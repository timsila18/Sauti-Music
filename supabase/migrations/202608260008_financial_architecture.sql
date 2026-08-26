begin;

alter view public.wallet_balances set (security_invoker=true);
alter view public.campaign_budget_summary set (security_invoker=true);

-- The existing application stores KES as exact numeric(14,2). This is deliberate:
-- no JavaScript arithmetic is used and the schema can represent minor units and
-- additional currencies without a disruptive migration.
do $$begin if exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='wallet_status' and e.enumlabel='FROZEN') then alter type public.wallet_status rename value 'FROZEN' to 'SUSPENDED'; end if; end$$;
do $$begin if exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='ledger_transaction_type' and e.enumlabel='SAUTI_COMMISSION') then alter type public.ledger_transaction_type rename value 'SAUTI_COMMISSION' to 'PLATFORM_COMMISSION'; end if; end$$;
do $$begin if exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='ledger_transaction_type' and e.enumlabel='PAYMENT_FEE') then alter type public.ledger_transaction_type rename value 'PAYMENT_FEE' to 'FEE'; end if; end$$;
alter type public.ledger_transaction_type add value if not exists 'CAMPAIGN_RELEASE';
alter type public.ledger_transaction_type add value if not exists 'PAYOUT_REVERSAL';
do $$begin if exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='ledger_status' and e.enumlabel='VOIDED') then alter type public.ledger_status rename value 'VOIDED' to 'CANCELLED'; end if; end$$;
alter type public.ledger_status add value if not exists 'FAILED';
alter type public.ledger_status add value if not exists 'REVERSED';
alter type public.campaign_funding_status add value if not exists 'PARTIALLY_SPENT';
alter type public.campaign_funding_status add value if not exists 'EXHAUSTED';

-- PostgreSQL requires newly added enum values to be committed before use.
commit;
begin;

create type public.payout_status as enum ('REQUESTED','PROCESSING','COMPLETED','FAILED','CANCELLED','REVERSED');
create type public.payout_method as enum ('MPESA_B2C','BANK','OTHER');
create type public.financial_event_type as enum ('campaign.funded','participant.earning_created','campaign.budget_low','campaign.budget_exhausted','refund.created','payout.requested','payout.completed');

alter table public.ledger_transactions
  add column transfer_id uuid,
  add column available_at timestamptz,
  add column created_by uuid references public.profiles(id) on delete set null,
  add column reversal_of uuid references public.ledger_transactions(id) on delete restrict,
  add column metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object');
create unique index ledger_one_reversal_idx on public.ledger_transactions(reversal_of) where reversal_of is not null;
create index ledger_reference_idx on public.ledger_transactions(reference_type,reference_id,created_at desc);
create index ledger_transfer_idx on public.ledger_transactions(transfer_id) where transfer_id is not null;

create table public.payout_requests (
  id uuid primary key default gen_random_uuid(), wallet_id uuid not null references public.wallets(id) on delete restrict,
  amount numeric(14,2) not null check(amount>0), currency text not null default 'KES' check(currency~'^[A-Z]{3}$'),
  method public.payout_method not null, destination_reference text not null,
  status public.payout_status not null default 'REQUESTED', requested_by uuid not null references public.profiles(id) on delete restrict,
  requested_at timestamptz not null default now(), processed_at timestamptz, external_transaction_id text,
  failure_reason text, idempotency_key text not null unique, metadata jsonb not null default '{}'::jsonb,
  check((status in ('COMPLETED','FAILED','CANCELLED','REVERSED') and processed_at is not null) or status in ('REQUESTED','PROCESSING'))
);
create index payout_wallet_idx on public.payout_requests(wallet_id,requested_at desc);

create table public.financial_events (
  id bigint generated always as identity primary key, event_type public.financial_event_type not null,
  entity_type text not null, entity_id uuid, actor_profile_id uuid references public.profiles(id) on delete set null,
  idempotency_key text not null unique, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

insert into public.business_settings(key,value) values
('finance_policy','{"currency":"KES","platform_commission_bps":2000,"fixed_fee":0,"minimum_campaign_budget":5000,"minimum_payout":100,"settlement_review_hours":24,"budget_low_threshold_bps":2000,"fees_refundable":false}'::jsonb)
on conflict(key) do update set value=excluded.value,updated_at=now();

create function public.protect_posted_ledger() returns trigger language plpgsql set search_path='' as $$
begin
  if old.status='POSTED' then raise exception 'Posted ledger transactions are immutable; create a reversal or adjustment'; end if;
  return case when tg_op='DELETE' then old else new end;
end$$;
create trigger ledger_posted_immutable before update or delete on public.ledger_transactions for each row execute function public.protect_posted_ledger();
create trigger payout_requests_no_delete before delete on public.payout_requests for each row execute function public.prevent_mutation();
create trigger financial_events_immutable before update or delete on public.financial_events for each row execute function public.prevent_mutation();

create function public.prepare_financial_entry() returns trigger language plpgsql set search_path='' as $$
declare balance numeric; review_hours integer;
begin
  -- Locking the campaign wallet serializes all debits, including different plays
  -- arriving together at the last available reward.
  if new.status='POSTED' and new.direction='DEBIT' and exists(select 1 from public.wallets where id=new.wallet_id and owner_type='CAMPAIGN') then
    perform 1 from public.wallets where id=new.wallet_id for update;
    select coalesce(sum(case when direction='CREDIT' then amount else -amount end) filter(where status='POSTED'),0) into balance from public.ledger_transactions where wallet_id=new.wallet_id;
    if balance<new.amount then raise exception 'Campaign has insufficient available balance'; end if;
  end if;
  if new.status='POSTED' and new.direction='CREDIT' and new.transaction_type in ('PARTICIPANT_EARNING','BONUS') and new.available_at is null then
    select coalesce((value->>'settlement_review_hours')::integer,24) into review_hours from public.business_settings where key='finance_policy';
    new.available_at=now()+make_interval(hours=>review_hours);
  end if;
  return new;
end$$;
create trigger ledger_prepare_financial_entry before insert on public.ledger_transactions for each row execute function public.prepare_financial_entry();

create function public.after_campaign_spend() returns trigger language plpgsql security definer set search_path='' as $$
declare cid uuid; summary record; threshold integer; artist_profile uuid;
begin
 if new.status<>'POSTED' or new.direction<>'DEBIT' or new.transaction_type<>'PARTICIPANT_EARNING' then return new; end if;
 select campaign_id into cid from public.wallets where id=new.wallet_id; if cid is null then return new; end if;
 select * into summary from public.campaign_financial_summary where campaign_id=cid;
 select coalesce((value->>'budget_low_threshold_bps')::integer,2000) into threshold from public.business_settings where key='finance_policy';
 update public.campaigns set funding_status=case when summary.remaining_balance<=0 then 'EXHAUSTED'::public.campaign_funding_status else 'PARTIALLY_SPENT'::public.campaign_funding_status end where id=cid and funding_status not in ('PARTIALLY_REFUNDED','REFUNDED');
 select m.profile_id into artist_profile from public.campaigns c join public.artist_account_memberships m on m.artist_account_id=c.artist_account_id and m.membership_role in ('OWNER','ADMIN') where c.id=cid limit 1;
 if summary.remaining_balance<=0 then
   insert into public.financial_events(event_type,entity_type,entity_id,idempotency_key,payload) values('campaign.budget_exhausted','campaign',cid,'budget-exhausted:'||cid,jsonb_build_object('remaining',summary.remaining_balance)) on conflict(idempotency_key) do nothing;
   insert into public.notifications(recipient_profile_id,notification_type,title,body,metadata,link_url) values(artist_profile,'CAMPAIGN_BUDGET_LOW','Campaign budget used','Your campaign participant budget has been used. No new paid plays will be accepted.',jsonb_build_object('campaign_id',cid),'/artist/campaigns/'||cid);
 elsif summary.total_funded>0 and summary.remaining_balance*10000<=summary.total_funded*threshold then
   insert into public.financial_events(event_type,entity_type,entity_id,idempotency_key,payload) values('campaign.budget_low','campaign',cid,'budget-low:'||cid,jsonb_build_object('remaining',summary.remaining_balance,'threshold_bps',threshold)) on conflict(idempotency_key) do nothing;
   if found then insert into public.notifications(recipient_profile_id,notification_type,title,body,metadata,link_url) values(artist_profile,'CAMPAIGN_BUDGET_LOW','Campaign budget is running low','Your campaign has less than the configured share of its budget remaining.',jsonb_build_object('campaign_id',cid,'threshold_bps',threshold),'/artist/campaigns/'||cid); end if;
 end if; return new;
end$$;
create trigger ledger_campaign_spend_event after insert on public.ledger_transactions for each row execute function public.after_campaign_spend();

create function public.validate_payout_request() returns trigger language plpgsql set search_path='' as $$
declare minimum numeric; available numeric; wallet_currency text; wallet_status public.wallet_status;
begin
 select currency,status into wallet_currency,wallet_status from public.wallets where id=new.wallet_id for update;
 select coalesce((value->>'minimum_payout')::numeric,100) into minimum from public.business_settings where key='finance_policy';
 select coalesce(s.available,0) into available from public.wallet_financial_summary s where s.wallet_id=new.wallet_id;
 if wallet_status<>'ACTIVE' then raise exception 'Wallet is not active'; end if;
 if new.currency<>wallet_currency then raise exception 'Payout currency must match wallet'; end if;
 if new.amount<minimum then raise exception 'Payout is below configured minimum'; end if;
 if new.amount>available then raise exception 'Payout exceeds available balance'; end if;
 return new;
end$$;
create trigger payout_request_valid before insert on public.payout_requests for each row execute function public.validate_payout_request();

create or replace view public.campaign_financial_summary with(security_barrier=true,security_invoker=true) as
select c.id campaign_id,c.currency,
 coalesce(sum(case when l.status='POSTED' and l.transaction_type='CAMPAIGN_FUNDING' and l.direction='CREDIT' then l.amount else 0 end),0)::numeric(14,2) total_funded,
 coalesce(sum(case when l.status='POSTED' and l.transaction_type='PARTICIPANT_EARNING' and l.direction='DEBIT' then l.amount else 0 end),0)::numeric(14,2) participant_earnings,
 coalesce(sum(case when l.status='POSTED' and l.transaction_type='PLATFORM_COMMISSION' and l.direction='DEBIT' then l.amount else 0 end),0)::numeric(14,2) platform_fee,
 coalesce(sum(case when l.status='POSTED' and l.transaction_type='FEE' and l.direction='DEBIT' then l.amount else 0 end),0)::numeric(14,2) reserved_fees,
 coalesce(sum(case when l.status='POSTED' and l.transaction_type='REFUND' and l.direction='DEBIT' then l.amount else 0 end),0)::numeric(14,2) refunded,
 coalesce(sum(case when l.status='PENDING' then case when l.direction='DEBIT' then l.amount else 0 end else 0 end),0)::numeric(14,2) pending_amount,
 coalesce(sum(case when l.status='POSTED' then case when l.direction='CREDIT' then l.amount else -l.amount end else 0 end),0)::numeric(14,2) remaining_balance
from public.campaigns c left join public.wallets w on w.campaign_id=c.id and w.wallet_type='CAMPAIGN_BUDGET'
left join public.ledger_transactions l on l.wallet_id=w.id group by c.id,c.currency;

create or replace view public.wallet_financial_summary with(security_barrier=true,security_invoker=true) as
select w.id wallet_id,w.profile_id,w.artist_account_id,w.campaign_id,w.wallet_type,w.currency,w.status,
 coalesce(sum(case when l.status='POSTED' and (l.available_at is null or l.available_at<=now()) then case when l.direction='CREDIT' then l.amount else -l.amount end else 0 end),0)::numeric(14,2) available,
 coalesce(sum(case when (l.status='PENDING' or (l.status='POSTED' and l.available_at>now())) and l.direction='CREDIT' then l.amount else 0 end),0)::numeric(14,2) pending,
 coalesce(sum(case when l.status='POSTED' and l.transaction_type in ('PARTICIPANT_EARNING','BONUS','ADJUSTMENT') and l.direction='CREDIT' then l.amount else 0 end),0)::numeric(14,2) total_earned
from public.wallets w left join public.ledger_transactions l on l.wallet_id=w.id group by w.id;

create or replace function public.admin_simulate_campaign_funding(p_campaign_id uuid,p_amount numeric,p_idempotency_key text) returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.campaigns; policy jsonb; campaign_wallet uuid; platform_wallet uuid; actor uuid; fee numeric(14,2); transfer uuid:=gen_random_uuid();
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 if p_amount<=0 then raise exception 'Funding amount must be positive'; end if;
 select * into c from public.campaigns where id=p_campaign_id for update; if c.id is null then raise exception 'Campaign not found'; end if;
 select value into policy from public.business_settings where key='finance_policy';
 if p_amount < (policy->>'minimum_campaign_budget')::numeric then raise exception 'Amount is below the minimum campaign budget'; end if;
 select public.current_profile_id() into actor;
 insert into public.wallets(owner_type,campaign_id,wallet_type,currency) values('CAMPAIGN',c.id,'CAMPAIGN_BUDGET',c.currency) on conflict do nothing;
 select id into campaign_wallet from public.wallets where campaign_id=c.id and wallet_type='CAMPAIGN_BUDGET' and currency=c.currency;
 insert into public.wallets(owner_type,profile_id,wallet_type,currency) values('PROFILE',actor,'OPERATING',c.currency) on conflict do nothing;
 select id into platform_wallet from public.wallets where profile_id=actor and wallet_type='OPERATING' and currency=c.currency;
 fee=round((p_amount*(policy->>'platform_commission_bps')::integer)/10000,2)+(policy->>'fixed_fee')::numeric;
 insert into public.ledger_transactions(wallet_id,transaction_type,direction,amount,currency,reference_type,reference_id,description,status,idempotency_key,posted_at,transfer_id,created_by,metadata)
 values(campaign_wallet,'CAMPAIGN_FUNDING','CREDIT',p_amount,c.currency,'campaign',c.id,'Development Funding','POSTED',p_idempotency_key||':funding',now(),transfer,actor,'{"simulated":true,"environment":"development"}'),
 (campaign_wallet,'PLATFORM_COMMISSION','DEBIT',fee,c.currency,'campaign',c.id,'Platform fee reserved','POSTED',p_idempotency_key||':fee-debit',now(),transfer,actor,jsonb_build_object('recognition','reserved')),
 (platform_wallet,'PLATFORM_COMMISSION','CREDIT',fee,c.currency,'campaign',c.id,'Platform fee reserved','POSTED',p_idempotency_key||':fee-credit',now(),transfer,actor,jsonb_build_object('recognition','reserved'));
 update public.campaigns set funding_status='FUNDED' where id=c.id;
 insert into public.financial_events(event_type,entity_type,entity_id,actor_profile_id,idempotency_key,payload) values('campaign.funded','campaign',c.id,actor,p_idempotency_key,jsonb_build_object('gross',p_amount,'platform_fee',fee,'participant_allocation',p_amount-fee,'simulated',true));
 insert into public.audit_logs(actor_profile_id,action,entity_type,entity_id,new_data,metadata) values(actor,'DEVELOPMENT_CAMPAIGN_FUNDING','campaign',c.id,jsonb_build_object('amount',p_amount,'fee',fee),jsonb_build_object('idempotency_key',p_idempotency_key,'transfer_id',transfer));
 return jsonb_build_object('campaign_id',c.id,'gross',p_amount,'platform_fee',fee,'participant_allocation',p_amount-fee,'currency',c.currency);
exception when unique_violation then return jsonb_build_object('duplicate',true,'idempotency_key',p_idempotency_key); end$$;

create or replace function public.admin_create_adjustment(p_wallet_id uuid,p_amount numeric,p_direction public.ledger_direction,p_reason text,p_note text,p_idempotency_key text) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid; tx uuid;
begin if not public.is_admin() then raise exception 'Admin access required'; end if;
 if p_amount<=0 or length(trim(p_reason))<3 or length(trim(p_note))<3 then raise exception 'Amount, reason and supporting note are required'; end if;
 select public.current_profile_id() into actor;
 insert into public.ledger_transactions(wallet_id,transaction_type,direction,amount,currency,reference_type,description,status,idempotency_key,posted_at,created_by,metadata)
 select id,'ADJUSTMENT',p_direction,p_amount,currency,'admin_adjustment',p_reason,'POSTED',p_idempotency_key,now(),actor,jsonb_build_object('reason',p_reason,'supporting_note',p_note) from public.wallets where id=p_wallet_id and status='ACTIVE' returning id into tx;
 if tx is null then raise exception 'Active wallet not found'; end if;
 insert into public.audit_logs(actor_profile_id,action,entity_type,entity_id,new_data,metadata) values(actor,'FINANCIAL_ADJUSTMENT','wallet',p_wallet_id,jsonb_build_object('amount',p_amount,'direction',p_direction),jsonb_build_object('reason',p_reason,'supporting_note',p_note,'idempotency_key',p_idempotency_key)); return tx; end$$;

create or replace function public.admin_simulate_campaign_refund(p_campaign_id uuid,p_amount numeric,p_reason text,p_idempotency_key text) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid; wid uuid; balance numeric; tx uuid;
begin if not public.is_admin() then raise exception 'Admin access required'; end if; select public.current_profile_id() into actor;
 select w.id,coalesce(s.remaining_balance,0) into wid,balance from public.wallets w join public.campaign_financial_summary s on s.campaign_id=w.campaign_id where w.campaign_id=p_campaign_id and w.wallet_type='CAMPAIGN_BUDGET' for update of w;
 if p_amount<=0 or p_amount>balance then raise exception 'Refund exceeds remaining refundable balance'; end if;
 insert into public.ledger_transactions(wallet_id,transaction_type,direction,amount,currency,reference_type,reference_id,description,status,idempotency_key,posted_at,created_by,metadata) select id,'REFUND','DEBIT',p_amount,currency,'campaign',p_campaign_id,'Development refund','POSTED',p_idempotency_key,now(),actor,jsonb_build_object('reason',p_reason,'simulated',true) from public.wallets where id=wid returning id into tx;
 update public.campaigns set funding_status=case when p_amount=balance then 'REFUNDED' else 'PARTIALLY_REFUNDED' end where id=p_campaign_id;
 insert into public.financial_events(event_type,entity_type,entity_id,actor_profile_id,idempotency_key,payload) values('refund.created','campaign',p_campaign_id,actor,p_idempotency_key,jsonb_build_object('amount',p_amount,'reason',p_reason,'simulated',true));
 insert into public.audit_logs(actor_profile_id,action,entity_type,entity_id,new_data,metadata) values(actor,'DEVELOPMENT_REFUND','campaign',p_campaign_id,jsonb_build_object('amount',p_amount),jsonb_build_object('reason',p_reason,'idempotency_key',p_idempotency_key)); return tx; end$$;

alter table public.payout_requests enable row level security; alter table public.financial_events enable row level security;
create policy payout_owner_read on public.payout_requests for select to authenticated using(public.is_admin() or exists(select 1 from public.wallets w where w.id=wallet_id and w.profile_id=public.current_profile_id()));
create policy financial_events_admin_read on public.financial_events for select to authenticated using(public.is_admin());
grant select on public.payout_requests to authenticated; grant select on public.campaign_financial_summary,public.wallet_financial_summary to authenticated;
grant execute on function public.admin_simulate_campaign_funding(uuid,numeric,text),public.admin_create_adjustment(uuid,numeric,public.ledger_direction,text,text,text),public.admin_simulate_campaign_refund(uuid,numeric,text,text) to authenticated;
revoke insert,update,delete on public.wallets,public.ledger_transactions,public.financial_events from authenticated;

commit;
