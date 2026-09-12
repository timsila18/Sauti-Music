create or replace function public.request_payout(
  p_amount numeric,
  p_method public.payout_method,
  p_destination_reference text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  actor uuid;
  wallet public.wallets;
  summary public.wallet_financial_summary;
  minimum numeric;
  request_id uuid;
begin
  actor := public.current_profile_id();
  if actor is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'INVALID_AMOUNT'; end if;
  if length(trim(p_destination_reference)) < 10 or length(trim(p_destination_reference)) > 80 then raise exception 'INVALID_DESTINATION'; end if;
  if length(trim(p_idempotency_key)) < 8 or length(trim(p_idempotency_key)) > 120 then raise exception 'INVALID_IDEMPOTENCY_KEY'; end if;

  select * into wallet from public.wallets
  where profile_id=actor and wallet_type='EARNINGS' and status='ACTIVE'
  order by created_at limit 1 for update;
  if wallet.id is null then raise exception 'WALLET_UNAVAILABLE'; end if;

  select * into summary from public.wallet_financial_summary where wallet_id=wallet.id;
  select coalesce((value->>'minimum_payout')::numeric,100) into minimum
  from public.business_settings where key='finance_policy';
  if p_amount < minimum then raise exception 'BELOW_MINIMUM'; end if;
  if p_amount > coalesce(summary.available,0) then raise exception 'INSUFFICIENT_AVAILABLE_BALANCE'; end if;
  if exists(select 1 from public.payout_requests where wallet_id=wallet.id and status in('REQUESTED','PROCESSING')) then raise exception 'PAYOUT_ALREADY_PENDING'; end if;

  insert into public.payout_requests(wallet_id,amount,currency,method,destination_reference,requested_by,idempotency_key,metadata)
  values(wallet.id,p_amount,wallet.currency,p_method,trim(p_destination_reference),actor,trim(p_idempotency_key),jsonb_build_object('source','participant_wallet'))
  on conflict(idempotency_key) do update set idempotency_key=excluded.idempotency_key
  returning id into request_id;

  insert into public.audit_logs(actor_profile_id,action,entity_type,entity_id,new_data,metadata)
  values(actor,'PAYOUT_REQUESTED','payout_request',request_id,jsonb_build_object('amount',p_amount,'currency',wallet.currency,'method',p_method),jsonb_build_object('wallet_id',wallet.id));
  insert into public.financial_events(event_type,entity_type,entity_id,actor_profile_id,idempotency_key,payload)
  values('payout.requested','payout_request',request_id,actor,'payout-requested:'||p_idempotency_key,jsonb_build_object('amount',p_amount,'currency',wallet.currency));
  return request_id;
end$$;

revoke execute on function public.request_payout(numeric,public.payout_method,text,text) from public,anon;
grant execute on function public.request_payout(numeric,public.payout_method,text,text) to authenticated;
