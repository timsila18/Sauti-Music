begin;

alter table public.admin_assignments
  add column if not exists ownership_bps integer not null default 0 check (ownership_bps between 0 and 10000);

create table public.management_profit_distributions (
  id uuid primary key default gen_random_uuid(),
  period_label text not null check (length(trim(period_label)) between 3 and 80),
  net_profit numeric(14,2) not null check (net_profit > 0),
  currency text not null default 'KES' check (currency = 'KES'),
  supporting_note text not null check (length(trim(supporting_note)) between 5 and 500),
  idempotency_key text not null unique,
  declared_by uuid not null references public.profiles(id) on delete restrict,
  declared_at timestamptz not null default now()
);

create table public.management_profit_allocations (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.management_profit_distributions(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  ownership_bps integer not null check (ownership_bps between 1 and 10000),
  amount numeric(14,2) not null check (amount >= 0),
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  ledger_transaction_id uuid not null unique references public.ledger_transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(distribution_id, profile_id)
);

create function public.management_ownership_total_valid()
returns trigger language plpgsql set search_path='' as $$
declare total integer;
begin
  select coalesce(sum(ownership_bps),0) into total from public.admin_assignments;
  if total <> 10000 then raise exception 'MANAGEMENT_OWNERSHIP_MUST_TOTAL_100_PERCENT'; end if;
  return null;
end$$;

create constraint trigger management_ownership_total
after insert or update or delete on public.admin_assignments
deferrable initially deferred for each row execute function public.management_ownership_total_valid();

update public.admin_assignments a set ownership_bps = case lower(u.email)
  when 'timsila18@gmail.com' then 5000
  when 'nyakundidicktamba@gmail.com' then 2500
  when 'wambandacyril@gmail.com' then 2500
  else 0 end
from public.profiles p join auth.users u on u.id=p.auth_user_id
where p.id=a.profile_id;

create or replace function public.record_management_net_profit(
  p_net_profit numeric,
  p_period_label text,
  p_supporting_note text,
  p_idempotency_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid; distribution uuid; owner record; wallet uuid; transaction uuid; allocated numeric(14,2):=0; share numeric(14,2);
begin
  if not public.is_super_admin() then raise exception 'SUPER_ADMIN_REQUIRED'; end if;
  if p_net_profit is null or p_net_profit<=0 then raise exception 'INVALID_NET_PROFIT'; end if;
  if length(trim(coalesce(p_period_label,'')))<3 or length(trim(coalesce(p_supporting_note,'')))<5 then raise exception 'DISTRIBUTION_DETAILS_REQUIRED'; end if;
  if length(trim(coalesce(p_idempotency_key,'')))<8 then raise exception 'INVALID_IDEMPOTENCY_KEY'; end if;
  select public.current_profile_id() into actor;
  perform pg_advisory_xact_lock(hashtext('sauti-management-profit'));
  insert into public.management_profit_distributions(period_label,net_profit,supporting_note,idempotency_key,declared_by)
  values(trim(p_period_label),round(p_net_profit,2),trim(p_supporting_note),trim(p_idempotency_key),actor)
  on conflict(idempotency_key) do update set idempotency_key=excluded.idempotency_key returning id into distribution;
  if exists(select 1 from public.management_profit_allocations where distribution_id=distribution) then return distribution; end if;
  for owner in select profile_id,ownership_bps from public.admin_assignments where ownership_bps>0 order by ownership_bps,profile_id loop
    insert into public.wallets(owner_type,profile_id,wallet_type,currency) values('PROFILE',owner.profile_id,'EARNINGS','KES') on conflict do nothing;
    select id into wallet from public.wallets where profile_id=owner.profile_id and wallet_type='EARNINGS' and currency='KES';
    share:=case when allocated + round(p_net_profit*owner.ownership_bps/10000,2) >= p_net_profit then round(p_net_profit-allocated,2) else round(p_net_profit*owner.ownership_bps/10000,2) end;
    insert into public.ledger_transactions(wallet_id,transaction_type,direction,amount,currency,reference_type,reference_id,description,status,idempotency_key,posted_at,created_by,metadata)
    values(wallet,'BONUS','CREDIT',share,'KES','management_profit',distribution,'Sauti management net-profit share','POSTED','management-profit:'||distribution||':'||owner.profile_id,now(),actor,jsonb_build_object('ownership_bps',owner.ownership_bps,'period',trim(p_period_label))) returning id into transaction;
    insert into public.management_profit_allocations(distribution_id,profile_id,ownership_bps,amount,wallet_id,ledger_transaction_id) values(distribution,owner.profile_id,owner.ownership_bps,share,wallet,transaction);
    allocated:=allocated+share;
  end loop;
  insert into public.audit_logs(actor_profile_id,action,entity_type,entity_id,new_data,metadata) values(actor,'MANAGEMENT_NET_PROFIT_DISTRIBUTED','management_profit_distribution',distribution,jsonb_build_object('net_profit',round(p_net_profit,2),'period',trim(p_period_label)),jsonb_build_object('idempotency_key',trim(p_idempotency_key)));
  return distribution;
end$$;

alter table public.management_profit_distributions enable row level security;
alter table public.management_profit_allocations enable row level security;
create policy management_distributions_admin_read on public.management_profit_distributions for select to authenticated using(public.is_admin());
create policy management_allocations_owner_read on public.management_profit_allocations for select to authenticated using(profile_id=public.current_profile_id() or public.is_super_admin());
revoke all on public.management_profit_distributions,public.management_profit_allocations from public,anon,authenticated;
grant select on public.management_profit_distributions,public.management_profit_allocations to authenticated;
revoke execute on function public.record_management_net_profit(numeric,text,text,text) from public,anon;
grant execute on function public.record_management_net_profit(numeric,text,text,text) to authenticated;

commit;
