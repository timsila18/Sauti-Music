begin;

create or replace function public.after_campaign_spend() returns trigger language plpgsql security definer set search_path='' as $$
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

commit;
