begin;

alter type public.qualification_status rename value 'DISQUALIFIED' to 'NOT_QUALIFIED';
alter type public.play_flag_type add value if not exists 'IMPOSSIBLE_PLAYBACK_TIMING';
alter type public.play_flag_type add value if not exists 'OVERLAPPING_SESSION';
alter type public.play_flag_type add value if not exists 'CAMPAIGN_INACTIVE';
alter type public.play_flag_type add value if not exists 'PARTICIPANT_NOT_ELIGIBLE';
alter type public.play_flag_type add value if not exists 'BUDGET_EXHAUSTED';
alter type public.play_flag_type add value if not exists 'REPEATED_PATTERN';
alter type public.play_flag_type add value if not exists 'DEVICE_ANOMALY';
alter type public.play_flag_type add value if not exists 'ACCOUNT_SUSPENDED';
alter type public.play_flag_type add value if not exists 'ADMIN_FLAG';
alter type public.play_flag_type add value if not exists 'DUPLICATE_PLAY';

commit;
begin;

create type public.risk_level as enum ('LOW','MEDIUM','HIGH','BLOCKED');
create type public.risk_flag_severity as enum ('INFO','LOW','MEDIUM','HIGH','CRITICAL');
create type public.verification_decision_source as enum ('SYSTEM','ADMIN','REPROCESSING');

alter table public.campaign_participations
  add column earning_suspended_at timestamptz,
  add column earning_suspension_reason text;
alter table public.playback_sessions
  add column idempotency_key text,
  add column installation_id text,
  add column last_event_at timestamptz,
  add column trusted_playback_seconds integer not null default 0,
  add column event_summary jsonb not null default '{}'::jsonb;
create unique index playback_session_idempotency_idx on public.playback_sessions(idempotency_key) where idempotency_key is not null;
create index playback_installation_active_idx on public.playback_sessions(installation_id,status) where installation_id is not null;

alter table public.play_events
  add column activity_id text,
  add column idempotency_key text,
  add column rule_snapshot jsonb not null default '{}'::jsonb,
  add column reward_amount numeric(14,2),
  add column reward_status public.ledger_status,
  add column risk_level public.risk_level not null default 'LOW';
create unique index play_event_activity_idx on public.play_events(activity_id) where activity_id is not null;
create unique index play_event_idempotency_idx on public.play_events(idempotency_key) where idempotency_key is not null;

alter table public.play_event_flags
  add column severity public.risk_flag_severity not null default 'MEDIUM',
  add column source text not null default 'VERIFICATION_ENGINE',
  add column resolution text,
  add column admin_notes text,
  add column resolved_at timestamptz;

create table public.verification_decisions(
  id uuid primary key default gen_random_uuid(),
  play_event_id uuid not null references public.play_events(id) on delete cascade,
  decision_version integer not null,
  source public.verification_decision_source not null default 'SYSTEM',
  verification_status public.verification_status not null,
  qualification_status public.qualification_status not null,
  risk_level public.risk_level not null,
  reason_codes text[] not null default '{}',
  reward_eligible boolean not null,
  reward_amount numeric(14,2),
  rule_snapshot jsonb not null,
  evidence_summary jsonb not null default '{}'::jsonb,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  reprocess_reason text,
  supersedes_decision_id uuid references public.verification_decisions(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(play_event_id,decision_version)
);

create table public.account_risk_profiles(
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  risk_level public.risk_level not null default 'LOW',
  minor_violation_count integer not null default 0,
  serious_violation_count integer not null default 0,
  last_evaluated_at timestamptz not null default now(),
  earning_blocked_at timestamptz,
  admin_flag boolean not null default false,
  summary jsonb not null default '{}'::jsonb
);

insert into public.business_settings(key,value) values
('verification_policy','{"minimum_playback_percentage":80,"minimum_absolute_seconds":60,"cooldown_minutes":60,"participant_daily_limit":10,"campaign_daily_limit":null,"timing_tolerance_seconds":5,"overlap_tolerance_seconds":10,"participant_reward_kes":40,"player_qualification_enabled":true,"reward_posting_enabled":true,"privacy":{"installation_id":"pseudonymous","ip_retention_days":30,"raw_audio_stored":false}}'::jsonb)
on conflict(key) do nothing;

create function public.snapshot_campaign_verification_rules() returns trigger language plpgsql set search_path='' as $$
declare rules jsonb;
begin
  if new.configuration_snapshot is null or not (new.configuration_snapshot ? 'verification_rules') then
    select value into rules from public.business_settings where key='verification_policy';
    new.configuration_snapshot=coalesce(new.configuration_snapshot,'{}'::jsonb)||jsonb_build_object('verification_rules',rules,'verification_rules_snapshotted_at',now());
  end if;
  return new;
end$$;
create trigger campaign_verification_rules_snapshot before insert or update of approval_status on public.campaigns for each row execute function public.snapshot_campaign_verification_rules();
update public.campaigns c set configuration_snapshot=coalesce(configuration_snapshot,'{}'::jsonb)||jsonb_build_object('verification_rules',(select value from public.business_settings where key='verification_policy'),'verification_rules_snapshotted_at',now()) where not coalesce(configuration_snapshot,'{}'::jsonb)?'verification_rules';

create function public.refresh_account_risk(p_profile_id uuid) returns public.risk_level language plpgsql security definer set search_path='' as $$
declare minor_count integer; serious_count integer; level public.risk_level; admin_block boolean;
begin
 select count(*) filter(where f.severity in('INFO','LOW','MEDIUM')),count(*) filter(where f.severity in('HIGH','CRITICAL')) into minor_count,serious_count
 from public.play_event_flags f join public.play_events e on e.id=f.play_event_id left join public.dj_profiles d on e.source_type='DJ' and d.id=e.source_id left join public.matatu_crew_memberships m on e.source_type='MATATU' and m.matatu_id=e.source_id
 where f.status='OPEN' and coalesce(d.profile_id,m.profile_id)=p_profile_id;
 select coalesce(admin_flag,false) into admin_block from public.account_risk_profiles where profile_id=p_profile_id;
 level=case when admin_block or serious_count>=3 then 'BLOCKED'::public.risk_level when serious_count>=1 then 'HIGH'::public.risk_level when minor_count>=3 then 'MEDIUM'::public.risk_level else 'LOW'::public.risk_level end;
 insert into public.account_risk_profiles(profile_id,risk_level,minor_violation_count,serious_violation_count,last_evaluated_at,earning_blocked_at,summary)
 values(p_profile_id,level,minor_count,serious_count,now(),case when level='BLOCKED' then now() end,jsonb_build_object('open_minor',minor_count,'open_serious',serious_count))
 on conflict(profile_id) do update set risk_level=excluded.risk_level,minor_violation_count=excluded.minor_violation_count,serious_violation_count=excluded.serious_violation_count,last_evaluated_at=now(),earning_blocked_at=case when excluded.risk_level='BLOCKED' then coalesce(account_risk_profiles.earning_blocked_at,now()) else null end,summary=excluded.summary;
 if level='BLOCKED' then update public.profiles set account_status='UNDER_REVIEW' where id=p_profile_id and account_status='ACTIVE'; end if;
 return level;
end$$;

create or replace function public.start_matatu_playback(p_participation_id uuid,p_idempotency_key text default null,p_installation_id text default null) returns uuid language plpgsql security definer set search_path='' as $$
declare p public.campaign_participations;c public.campaigns;s uuid;actor uuid;risk public.risk_level;
begin
 actor=public.current_profile_id();
 if p_idempotency_key is not null then select id into s from public.playback_sessions where idempotency_key=p_idempotency_key;if s is not null then return s;end if;end if;
 select * into p from public.campaign_participations where id=p_participation_id and matatu_id is not null and public.can_manage_matatu(matatu_id) for update;
 if p.id is null or p.status not in('ACCEPTED','ACTIVE') or p.earning_suspended_at is not null then raise exception 'PARTICIPANT_NOT_ELIGIBLE';end if;
 if exists(select 1 from public.profiles where id=actor and account_status<>'ACTIVE') then raise exception 'ACCOUNT_SUSPENDED';end if;
 select risk_level into risk from public.account_risk_profiles where profile_id=actor;if risk='BLOCKED' then raise exception 'RISK_BLOCKED';end if;
 select * into c from public.campaigns where id=p.campaign_id and status='ACTIVE' and current_date between start_date and end_date;
 if c.id is null then raise exception 'CAMPAIGN_INACTIVE';end if;
 if exists(select 1 from public.playback_sessions where matatu_id=p.matatu_id and status='PLAYING') then raise exception 'OVERLAPPING_SESSION';end if;
 insert into public.playback_sessions(campaign_participation_id,matatu_id,song_id,idempotency_key,installation_id,last_event_at) values(p.id,p.matatu_id,c.song_id,p_idempotency_key,nullif(p_installation_id,''),now()) returning id into s;
 update public.campaign_participations set status='ACTIVE' where id=p.id;return s;
end$$;

create or replace function public.finish_matatu_playback(p_session_id uuid,p_position_seconds integer,p_idempotency_key text default null,p_trusted_playback_seconds integer default null,p_event_summary jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.playback_sessions;p public.campaign_participations;c public.campaigns;rules jsonb;track_seconds integer;elapsed integer;trusted integer;pct numeric;reward numeric;reason text;reasons text[]='{}';v_status public.verification_status='VERIFIED';q_status public.qualification_status='QUALIFIED';risk public.risk_level='LOW';severity public.risk_flag_severity;event_id uuid;campaign_wallet uuid;earning_wallet uuid;balance numeric;participant_today integer;campaign_today integer;actor uuid;transfer uuid:=gen_random_uuid();decision_id uuid;
begin
 actor=public.current_profile_id();
 if p_idempotency_key is not null then select id into event_id from public.play_events where idempotency_key=p_idempotency_key;if event_id is not null then return jsonb_build_object('play_event_id',event_id,'duplicate',true);end if;end if;
 select * into s from public.playback_sessions where id=p_session_id and status='PLAYING' and public.can_manage_matatu(matatu_id) for update;
 if s.id is null then select play_event_id into event_id from public.playback_sessions where id=p_session_id;return jsonb_build_object('play_event_id',event_id,'duplicate',event_id is not null,'status','REJECTED');end if;
 perform pg_advisory_xact_lock(hashtextextended(s.campaign_participation_id::text,0));
 select * into p from public.campaign_participations where id=s.campaign_participation_id for update;select * into c from public.campaigns where id=p.campaign_id for update;
 rules=coalesce(c.configuration_snapshot->'verification_rules',(select value from public.business_settings where key='verification_policy'));
 select duration_seconds into track_seconds from public.songs where id=s.song_id;elapsed=greatest(0,extract(epoch from(now()-s.started_at))::integer);trusted=least(greatest(0,coalesce(p_trusted_playback_seconds,p_position_seconds)),elapsed+coalesce((rules->>'timing_tolerance_seconds')::integer,5),coalesce(track_seconds,p_position_seconds));pct=round(100*trusted::numeric/nullif(track_seconds,0),2);reward=coalesce((rules->>'participant_reward_kes')::numeric,40);
 if p_idempotency_key is null then p_idempotency_key='session:'||s.id;end if;
 if s.song_id<>c.song_id or p.campaign_id<>c.id then reasons=array_append(reasons,'PARTICIPANT_NOT_ELIGIBLE');v_status='REJECTED';q_status='NOT_QUALIFIED';risk='HIGH';
 elsif exists(select 1 from public.profiles where id=actor and account_status<>'ACTIVE') then reasons=array_append(reasons,'ACCOUNT_SUSPENDED');v_status='REJECTED';q_status='NOT_QUALIFIED';risk='HIGH';
 elsif c.status<>'ACTIVE' or current_date not between c.start_date and c.end_date then reasons=array_append(reasons,'CAMPAIGN_INACTIVE');q_status='NOT_QUALIFIED';
 elsif p_position_seconds>elapsed+coalesce((rules->>'timing_tolerance_seconds')::integer,5) then reasons=array_append(reasons,'IMPOSSIBLE_PLAYBACK_TIMING');v_status='FLAGGED';q_status='REVIEW_REQUIRED';risk='HIGH';
 elsif pct<coalesce((rules->>'minimum_playback_percentage')::numeric,80) or trusted<least(coalesce(track_seconds,2147483647),coalesce((rules->>'minimum_absolute_seconds')::integer,60)) then reasons=array_append(reasons,'MINIMUM_DURATION_FAILED');q_status='NOT_QUALIFIED';
 elsif exists(select 1 from public.play_events e where e.campaign_participation_id=p.id and e.qualification_status='QUALIFIED' and e.started_at>now()-make_interval(mins=>coalesce((rules->>'cooldown_minutes')::integer,60))) then reasons=array_append(reasons,'COOLDOWN_VIOLATION');q_status='NOT_QUALIFIED';
 else
  select count(*) into participant_today from public.play_events e where e.campaign_participation_id=p.id and e.qualification_status='QUALIFIED' and e.started_at>=current_date;
  select count(*) into campaign_today from public.play_events e where e.campaign_id=c.id and e.qualification_status='QUALIFIED' and e.started_at>=current_date;
  if participant_today>=coalesce((rules->>'participant_daily_limit')::integer,10) or ((rules->>'campaign_daily_limit') is not null and campaign_today>=(rules->>'campaign_daily_limit')::integer) then reasons=array_append(reasons,'DAILY_LIMIT_EXCEEDED');q_status='NOT_QUALIFIED';end if;
 end if;
 if q_status='QUALIFIED' and (coalesce((rules->>'player_qualification_enabled')::boolean,true)=false or p.earning_suspended_at is not null) then reasons=array_append(reasons,'PARTICIPANT_NOT_ELIGIBLE');q_status='REVIEW_REQUIRED';end if;
 select id into campaign_wallet from public.wallets where campaign_id=c.id and wallet_type='CAMPAIGN_BUDGET' for update;
 if q_status='QUALIFIED' then select coalesce(sum(case when direction='CREDIT' then amount else -amount end),0) into balance from public.ledger_transactions where wallet_id=campaign_wallet and status in('PENDING','POSTED');if balance<reward then reasons=array_append(reasons,'CAMPAIGN_BUDGET_EXHAUSTED');q_status='NOT_QUALIFIED';end if;end if;
 if v_status='FLAGGED' then severity='HIGH';elsif array_length(reasons,1)>0 then severity='LOW';end if;
 insert into public.play_events(song_id,campaign_id,campaign_participation_id,source_type,source_id,started_at,ended_at,duration_seconds,verification_status,verification_method,qualification_status,qualified_at,metadata,activity_id,idempotency_key,rule_snapshot,reward_amount,reward_status,risk_level)
 values(s.song_id,c.id,p.id,'MATATU',s.matatu_id,s.started_at,now(),trusted,v_status,'SAUTI_PLAYER',q_status,case when q_status='QUALIFIED' then now() end,jsonb_build_object('completion_percentage',pct,'reason_codes',reasons,'server_elapsed_seconds',elapsed,'trusted_playback_seconds',trusted,'event_summary',p_event_summary),s.id::text,p_idempotency_key,rules,case when q_status in('QUALIFIED','REVIEW_REQUIRED') then reward end,case when q_status='QUALIFIED' then 'PENDING'::public.ledger_status end,risk) returning id into event_id;
 insert into public.verification_decisions(play_event_id,decision_version,verification_status,qualification_status,risk_level,reason_codes,reward_eligible,reward_amount,rule_snapshot,evidence_summary)
 values(event_id,1,v_status,q_status,risk,reasons,q_status='QUALIFIED',case when q_status='QUALIFIED' then reward end,rules,jsonb_build_object('elapsed_seconds',elapsed,'trusted_playback_seconds',trusted,'reported_position_seconds',p_position_seconds)) returning id into decision_id;
 if array_length(reasons,1)>0 then insert into public.play_event_flags(play_event_id,flag_type,severity,source,details) values(event_id,case reasons[1] when 'IMPOSSIBLE_PLAYBACK_TIMING' then 'IMPOSSIBLE_PLAYBACK_TIMING'::public.play_flag_type when 'COOLDOWN_VIOLATION' then 'COOLDOWN_VIOLATION'::public.play_flag_type when 'DAILY_LIMIT_EXCEEDED' then 'PARTICIPANT_LIMIT_EXCEEDED'::public.play_flag_type when 'MINIMUM_DURATION_FAILED' then 'MINIMUM_DURATION_FAILURE'::public.play_flag_type when 'CAMPAIGN_INACTIVE' then 'CAMPAIGN_INACTIVE'::public.play_flag_type when 'ACCOUNT_SUSPENDED' then 'ACCOUNT_SUSPENDED'::public.play_flag_type when 'CAMPAIGN_BUDGET_EXHAUSTED' then 'BUDGET_EXHAUSTED'::public.play_flag_type else 'OTHER'::public.play_flag_type end,severity,'VERIFICATION_ENGINE',jsonb_build_object('reason_codes',reasons,'decision_id',decision_id)) on conflict(play_event_id,flag_type) do nothing;end if;
 if q_status='QUALIFIED' then
  insert into public.wallets(owner_type,profile_id,wallet_type,currency) values('PROFILE',actor,'EARNINGS','KES') on conflict do nothing;select id into earning_wallet from public.wallets where profile_id=actor and wallet_type='EARNINGS' and currency='KES';
  insert into public.ledger_transactions(wallet_id,transaction_type,direction,amount,currency,reference_type,reference_id,description,status,idempotency_key,transfer_id,metadata) values(campaign_wallet,'CAMPAIGN_HOLD','DEBIT',reward,'KES','play_event',event_id,'Reserved pending verified play','PENDING','verification-hold-debit:'||event_id,transfer,jsonb_build_object('decision_id',decision_id)),(earning_wallet,'PARTICIPANT_EARNING','CREDIT',reward,'KES','play_event',event_id,'Verified play pending review window','PENDING','verification-hold-credit:'||event_id,transfer,jsonb_build_object('decision_id',decision_id)) on conflict(idempotency_key) do nothing;
  update public.campaign_participations set earned_amount=earned_amount+reward,qualified_play_count=qualified_play_count+1,last_qualified_play_at=now() where id=p.id;
 end if;
 update public.playback_sessions set ended_at=now(),playback_position_seconds=p_position_seconds,trusted_playback_seconds=trusted,completion_percentage=coalesce(pct,0),status=case when q_status='QUALIFIED' then 'QUALIFIED' when q_status='REVIEW_REQUIRED' then 'FLAGGED' else 'NOT_QUALIFIED' end,rejection_reason=array_to_string(reasons,','),play_event_id=event_id,event_summary=p_event_summary,last_event_at=now() where id=s.id;
 if array_length(reasons,1)>0 then perform public.refresh_account_risk(actor);end if;
 return jsonb_build_object('play_event_id',event_id,'verificationStatus',v_status,'qualificationStatus',q_status,'riskLevel',risk,'reasons',reasons,'rewardEligible',q_status='QUALIFIED','reward',case when q_status='QUALIFIED' then reward else 0 end,'pending',q_status='QUALIFIED');
end$$;

create function public.record_manual_dj_activity(p_set_track_id uuid,p_idempotency_key text) returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.dj_set_tracks;s public.dj_sets;p public.campaign_participations;e uuid;rules jsonb;
begin
 select * into t from public.dj_set_tracks where id=p_set_track_id for update;select * into s from public.dj_sets where id=t.set_id and dj_profile_id in(select id from public.dj_profiles where profile_id=public.current_profile_id());if s.id is null then raise exception 'DJ_NOT_AUTHORIZED';end if;
 select * into p from public.campaign_participations where campaign_id=t.campaign_id and dj_profile_id=s.dj_profile_id;
 select coalesce(c.configuration_snapshot->'verification_rules',(select value from public.business_settings where key='verification_policy')) into rules from public.campaigns c where c.id=t.campaign_id;
 insert into public.play_events(song_id,campaign_id,campaign_participation_id,source_type,source_id,started_at,ended_at,duration_seconds,verification_status,verification_method,qualification_status,metadata,activity_id,idempotency_key,rule_snapshot,risk_level)
 values(t.song_id,t.campaign_id,p.id,'DJ',s.dj_profile_id,t.logged_at,t.logged_at,0,'PENDING','MANUAL','REVIEW_REQUIRED','{"participant_message":"We are reviewing this activity before earnings are released."}',t.id::text,p_idempotency_key,rules,'LOW') on conflict(idempotency_key) do update set idempotency_key=excluded.idempotency_key returning id into e;
 insert into public.verification_decisions(play_event_id,decision_version,verification_status,qualification_status,risk_level,reason_codes,reward_eligible,rule_snapshot,evidence_summary) values(e,1,'PENDING','REVIEW_REQUIRED','LOW',array['MANUAL_ACTIVITY_REVIEW'],false,rules,jsonb_build_object('set_track_id',t.id)) on conflict(play_event_id,decision_version) do nothing;
 insert into public.play_event_flags(play_event_id,flag_type,severity,source,details) values(e,'MANUAL_REVIEW_REQUIRED','INFO','MANUAL_DJ',jsonb_build_object('set_track_id',t.id)) on conflict(play_event_id,flag_type) do nothing;update public.dj_set_tracks set play_event_id=e,qualification_status='REVIEW_REQUIRED' where id=t.id;return jsonb_build_object('play_event_id',e,'verificationStatus','PENDING','qualificationStatus','REVIEW_REQUIRED','rewardEligible',false);
end$$;

create function public.admin_reprocess_play(p_play_id uuid,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;old public.verification_decisions;v integer;new_id uuid;
begin
 if not public.is_admin() or length(trim(p_reason))<3 then raise exception 'Admin access and reason required';end if;actor=public.current_profile_id();select * into old from public.verification_decisions where play_event_id=p_play_id order by decision_version desc limit 1 for update;if old.id is null then raise exception 'Decision not found';end if;v=old.decision_version+1;
 insert into public.verification_decisions(play_event_id,decision_version,source,verification_status,qualification_status,risk_level,reason_codes,reward_eligible,reward_amount,rule_snapshot,evidence_summary,actor_profile_id,reprocess_reason,supersedes_decision_id) values(p_play_id,v,'REPROCESSING',old.verification_status,old.qualification_status,old.risk_level,old.reason_codes,old.reward_eligible,old.reward_amount,old.rule_snapshot,old.evidence_summary,actor,p_reason,old.id) returning id into new_id;
 insert into public.audit_logs(actor_profile_id,action,entity_type,entity_id,previous_data,new_data,metadata) values(actor,'PLAY_REPROCESSED','play_event',p_play_id,jsonb_build_object('decision_id',old.id,'version',old.decision_version),jsonb_build_object('decision_id',new_id,'version',v),jsonb_build_object('reason',p_reason,'financial_change',false));return jsonb_build_object('decision_id',new_id,'version',v);
end$$;

create or replace function public.admin_update_setting(p_key text,p_value jsonb,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;old jsonb;
begin
 if not public.is_admin() then raise exception 'Admin access required';end if;
 if p_key not in('finance_policy','operations_policy','verification_policy') or jsonb_typeof(p_value)<>'object' or length(trim(p_reason))<3 then raise exception 'Invalid setting update';end if;
 if p_key='finance_policy' and ((p_value->>'platform_commission_bps')::integer not between 0 and 5000 or (p_value->>'minimum_payout')::numeric<0 or (p_value->>'settlement_review_hours')::integer not between 0 and 720) then raise exception 'Finance setting outside allowed range';end if;
 if p_key='verification_policy' and ((p_value->>'minimum_playback_percentage')::integer not between 1 and 100 or (p_value->>'minimum_absolute_seconds')::integer not between 1 and 3600 or (p_value->>'participant_daily_limit')::integer not between 1 and 1000 or (p_value->>'cooldown_minutes')::integer not between 0 and 10080) then raise exception 'Verification setting outside allowed range';end if;
 actor=public.current_profile_id();select value into old from public.business_settings where key=p_key for update;
 insert into public.business_setting_versions(setting_key,value,changed_by,reason) values(p_key,p_value,actor,p_reason);
 insert into public.business_settings(key,value,updated_at) values(p_key,p_value,now()) on conflict(key) do update set value=excluded.value,updated_at=now();
 insert into public.audit_logs(actor_profile_id,action,entity_type,previous_data,new_data,metadata) values(actor,'SETTING_UPDATED','business_setting',old,p_value,jsonb_build_object('key',p_key,'reason',p_reason));
end$$;

create view public.admin_risk_metrics with (security_barrier=true) as select
 count(*) filter(where qualification_status='QUALIFIED') as qualified,
 count(*) filter(where qualification_status='NOT_QUALIFIED') as not_qualified,
 count(*) filter(where qualification_status='REVIEW_REQUIRED') as pending_review,
 count(*) filter(where verification_status='REJECTED') as rejected,
 count(*) as total
from public.play_events where created_at>=now()-interval'30 days';

alter table public.verification_decisions enable row level security;alter table public.account_risk_profiles enable row level security;
create policy verification_decisions_admin_read on public.verification_decisions for select to authenticated using(public.is_admin());
create policy risk_profiles_admin_read on public.account_risk_profiles for select to authenticated using(public.is_admin());
grant select on public.verification_decisions,public.account_risk_profiles,public.admin_risk_metrics to authenticated;
revoke insert,update,delete on public.verification_decisions,public.account_risk_profiles from authenticated;
revoke insert,update,delete on public.play_event_flags from authenticated;
grant execute on function public.start_matatu_playback(uuid,text,text),public.finish_matatu_playback(uuid,integer,text,integer,jsonb),public.record_manual_dj_activity(uuid,text),public.admin_reprocess_play(uuid,text) to authenticated;

comment on table public.verification_decisions is 'Immutable, versioned verification and qualification outcomes. Never overwrite prior system decisions.';
comment on column public.playback_sessions.installation_id is 'Pseudonymous app installation identifier; never a hardware fingerprint.';
comment on column public.play_events.rule_snapshot is 'Rules effective for this activity. Historical decisions are not silently recalculated.';
commit;
