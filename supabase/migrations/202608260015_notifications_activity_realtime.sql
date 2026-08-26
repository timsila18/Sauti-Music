begin;
alter type public.notification_type add value if not exists 'CAMPAIGN_CHANGES_REQUESTED';
alter type public.notification_type add value if not exists 'CAMPAIGN_ACTIVE';
alter type public.notification_type add value if not exists 'CAMPAIGN_EXHAUSTED';
alter type public.notification_type add value if not exists 'PARTICIPANT_JOINED';
alter type public.notification_type add value if not exists 'QUALIFIED_PLAY_MILESTONE';
alter type public.notification_type add value if not exists 'LISTENER_ENGAGEMENT_MILESTONE';
alter type public.notification_type add value if not exists 'NEW_CAMPAIGN_AVAILABLE';
alter type public.notification_type add value if not exists 'CAMPAIGN_JOINED';
alter type public.notification_type add value if not exists 'CAMPAIGN_ENDING_SOON';
alter type public.notification_type add value if not exists 'ACTIVITY_PENDING_REVIEW';
alter type public.notification_type add value if not exists 'ACTIVITY_QUALIFIED';
alter type public.notification_type add value if not exists 'ACTIVITY_REJECTED';
alter type public.notification_type add value if not exists 'EARNING_CREDITED';
alter type public.notification_type add value if not exists 'NEW_FOLLOWER';
alter type public.notification_type add value if not exists 'PLAY_QUALIFIED';
alter type public.notification_type add value if not exists 'PLAY_NOT_QUALIFIED';
alter type public.notification_type add value if not exists 'CAMPAIGN_EXHAUSTED';
alter type public.notification_type add value if not exists 'PASSENGER_REQUEST';
alter type public.notification_type add value if not exists 'FOLLOWED_ARTIST_RELEASE';
alter type public.notification_type add value if not exists 'FOLLOWED_DJ_ACTIVITY';
alter type public.notification_type add value if not exists 'FOLLOWED_MATATU_ACTIVE';
alter type public.notification_type add value if not exists 'SAVED_SONG_TRENDING';
alter type public.notification_type add value if not exists 'REQUEST_STATUS_CHANGED';
alter type public.notification_type add value if not exists 'CAMPAIGN_REVIEW_REQUIRED';
alter type public.notification_type add value if not exists 'PLAY_REVIEW_REQUIRED';
alter type public.notification_type add value if not exists 'HIGH_RISK_ACTIVITY';
alter type public.notification_type add value if not exists 'PAYOUT_REVIEW_REQUIRED';
alter type public.notification_type add value if not exists 'DISPUTE_OPENED';
alter type public.notification_type add value if not exists 'SYSTEM_ALERT';
commit;
begin;

create type public.notification_priority as enum('LOW','NORMAL','HIGH','URGENT');
create type public.notification_category as enum('CAMPAIGNS','EARNINGS','REQUESTS','FOLLOWERS','MUSIC_DISCOVERY','ACCOUNT_SECURITY');
create type public.activity_visibility as enum('PRIVATE','PARTICIPANTS','PUBLIC','ADMIN');
create type public.outbox_status as enum('PENDING','PROCESSED','FAILED');

alter table public.notifications add column related_entity_type text,add column related_entity_id uuid,add column priority public.notification_priority not null default 'NORMAL',add column category public.notification_category not null default 'CAMPAIGNS',add column archived_at timestamptz,add column deduplication_key text;
create unique index notifications_dedupe_idx on public.notifications(recipient_profile_id,deduplication_key) where deduplication_key is not null;
create index notifications_unread_idx on public.notifications(recipient_profile_id,created_at desc) where read_at is null and archived_at is null;
create index notifications_related_idx on public.notifications(related_entity_type,related_entity_id);

create table public.notification_preferences(
 profile_id uuid not null references public.profiles(id) on delete cascade,
 category public.notification_category not null,
 in_app_enabled boolean not null default true,
 push_enabled boolean not null default false,
 email_enabled boolean not null default false,
 sms_enabled boolean not null default false,
 whatsapp_enabled boolean not null default false,
 updated_at timestamptz not null default now(),primary key(profile_id,category)
);
create table public.activity_events(
 id uuid primary key default gen_random_uuid(),event_type text not null,actor_profile_id uuid references public.profiles(id) on delete set null,
 subject_type text not null,subject_id uuid,related_campaign_id uuid references public.campaigns(id) on delete set null,related_song_id uuid references public.songs(id) on delete set null,
 visibility public.activity_visibility not null,recipient_profile_id uuid references public.profiles(id) on delete cascade,title text not null,body text,action_url text,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now()
);
create table public.notification_outbox(
 id bigint generated always as identity primary key,event_type public.notification_type not null,recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
 title text not null,body text not null,action_url text,related_entity_type text,related_entity_id uuid,priority public.notification_priority not null default 'NORMAL',category public.notification_category not null,
 metadata jsonb not null default '{}'::jsonb,deduplication_key text,status public.outbox_status not null default 'PENDING',attempts integer not null default 0,last_error text,created_at timestamptz not null default now(),processed_at timestamptz,
 unique(recipient_profile_id,deduplication_key)
);
create index activity_feed_idx on public.activity_events(recipient_profile_id,created_at desc);
create index activity_campaign_idx on public.activity_events(related_campaign_id,created_at desc);
create index activity_type_idx on public.activity_events(event_type,created_at desc);
create index requests_target_status_idx on public.song_requests(target_type,target_id,status,created_at desc);
create index outbox_pending_idx on public.notification_outbox(status,created_at) where status='PENDING';

create function public.enqueue_notification(p_recipient uuid,p_type public.notification_type,p_title text,p_body text,p_action_url text,p_related_type text,p_related_id uuid,p_priority public.notification_priority,p_category public.notification_category,p_metadata jsonb default '{}'::jsonb,p_dedupe_key text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_recipient is null then return;end if;
 if p_category<>'ACCOUNT_SECURITY' and exists(select 1 from public.notification_preferences where profile_id=p_recipient and category=p_category and not in_app_enabled) then return;end if;
 insert into public.notification_outbox(event_type,recipient_profile_id,title,body,action_url,related_entity_type,related_entity_id,priority,category,metadata,deduplication_key)
 values(p_type,p_recipient,p_title,p_body,p_action_url,p_related_type,p_related_id,p_priority,p_category,coalesce(p_metadata,'{}'),p_dedupe_key)
 on conflict(recipient_profile_id,deduplication_key) do nothing;
end$$;

create function public.dispatch_notification_outbox() returns trigger language plpgsql security definer set search_path='' as $$
begin
 begin
  insert into public.notifications(recipient_profile_id,notification_type,title,body,metadata,link_url,related_entity_type,related_entity_id,priority,category,deduplication_key)
  values(new.recipient_profile_id,new.event_type,new.title,new.body,new.metadata,new.action_url,new.related_entity_type,new.related_entity_id,new.priority,new.category,new.deduplication_key)
  on conflict(recipient_profile_id,deduplication_key) do nothing;
  update public.notification_outbox set status='PROCESSED',processed_at=now(),attempts=attempts+1 where id=new.id;
 exception when others then update public.notification_outbox set status='FAILED',attempts=attempts+1,last_error=sqlerrm where id=new.id;
 end;return new;
end$$;
create trigger dispatch_notification_after_outbox after insert on public.notification_outbox for each row execute function public.dispatch_notification_outbox();

create function public.emit_activity(p_event_type text,p_actor uuid,p_subject_type text,p_subject_id uuid,p_campaign uuid,p_song uuid,p_visibility public.activity_visibility,p_recipient uuid,p_title text,p_body text,p_url text,p_metadata jsonb default '{}'::jsonb) returns uuid language plpgsql security definer set search_path='' as $$declare eid uuid;begin insert into public.activity_events(event_type,actor_profile_id,subject_type,subject_id,related_campaign_id,related_song_id,visibility,recipient_profile_id,title,body,action_url,metadata) values(p_event_type,p_actor,p_subject_type,p_subject_id,p_campaign,p_song,p_visibility,p_recipient,p_title,p_body,p_url,coalesce(p_metadata,'{}')) returning id into eid;return eid;end$$;

create function public.after_participant_joined_event() returns trigger language plpgsql security definer set search_path='' as $$declare owner uuid;label text;begin if new.status in('ACCEPTED','ACTIVE') and old.status is distinct from new.status then select m.profile_id into owner from public.campaigns c join public.artist_account_memberships m on m.artist_account_id=c.artist_account_id where c.id=new.campaign_id order by case m.membership_role when 'OWNER' then 0 else 1 end limit 1;label=case when new.participant_type='DJ' then 'A DJ' else 'A matatu' end;perform public.emit_activity('participant.joined',null,'campaign_participation',new.id,new.campaign_id,null,'PARTICIPANTS',owner,label||' joined your campaign',null,'/artist/campaigns/'||new.campaign_id,'{}');perform public.enqueue_notification(owner,'PARTICIPANT_JOINED',label||' joined your campaign','Open the campaign to see its latest activity.','/artist/campaigns/'||new.campaign_id,'campaign',new.campaign_id,'NORMAL','CAMPAIGNS','{}','participant-joined:'||new.id);end if;return new;end$$;
create trigger participant_joined_event after update of status on public.campaign_participations for each row execute function public.after_participant_joined_event();

create function public.after_play_feedback_event() returns trigger language plpgsql security definer set search_path='' as $$declare artist_owner uuid;participant_profile uuid;campaign_name text;play_count integer;milestone integer;admin_id uuid;begin
 select c.campaign_name,m.profile_id into campaign_name,artist_owner from public.campaigns c join public.artist_account_memberships m on m.artist_account_id=c.artist_account_id where c.id=new.campaign_id order by case m.membership_role when 'OWNER' then 0 else 1 end limit 1;
 if new.source_type='DJ' then select profile_id into participant_profile from public.dj_profiles where id=new.source_id;elsif new.source_type='MATATU' then select profile_id into participant_profile from public.matatu_crew_memberships where matatu_id=new.source_id order by case membership_role when 'OWNER' then 0 else 1 end limit 1;end if;
 perform public.emit_activity('play.'||lower(new.qualification_status::text),participant_profile,'play_event',new.id,new.campaign_id,new.song_id,'PARTICIPANTS',artist_owner,case when new.qualification_status='QUALIFIED' then coalesce(campaign_name,'Campaign')||' generated a qualified play' when new.qualification_status='REVIEW_REQUIRED' then 'Campaign activity is pending review' else 'Campaign activity did not qualify' end,null,'/artist/campaigns/'||new.campaign_id,'{}');
 if participant_profile is not null then perform public.enqueue_notification(participant_profile,case when new.qualification_status='QUALIFIED' then 'PLAY_QUALIFIED'::public.notification_type when new.qualification_status='REVIEW_REQUIRED' then 'ACTIVITY_PENDING_REVIEW'::public.notification_type else 'PLAY_NOT_QUALIFIED'::public.notification_type end,case when new.qualification_status='QUALIFIED' then 'Play qualified' when new.qualification_status='REVIEW_REQUIRED' then 'Activity pending review' else 'Play not qualified' end,case when new.qualification_status='QUALIFIED' then 'Your campaign activity qualified and the earning is pending review.' when new.qualification_status='REVIEW_REQUIRED' then 'We are reviewing this activity before any earning is released.' else 'This activity did not meet the campaign requirement.' end,case when new.source_type='DJ' then '/dj/activity' else '/matatu/activity' end,'play_event',new.id,case when new.qualification_status='REVIEW_REQUIRED' then 'HIGH'::public.notification_priority else 'NORMAL'::public.notification_priority end,'EARNINGS',jsonb_build_object('qualification_status',new.qualification_status), 'play-result:'||new.id);end if;
 if new.qualification_status='QUALIFIED' then select count(*) into play_count from public.play_events where campaign_id=new.campaign_id and qualification_status='QUALIFIED';milestone=case when play_count>=1000 then 1000 when play_count>=500 then 500 when play_count>=100 then 100 when play_count>=10 then 10 else null end;if milestone is not null and play_count=milestone then perform public.enqueue_notification(artist_owner,'QUALIFIED_PLAY_MILESTONE','Your campaign reached '||milestone||' qualified plays','Open the campaign to see the latest results.','/artist/campaigns/'||new.campaign_id,'campaign',new.campaign_id,'NORMAL','CAMPAIGNS',jsonb_build_object('milestone',milestone),'play-milestone:'||new.campaign_id||':'||milestone);end if;end if;
 if new.verification_status='FLAGGED' or new.qualification_status='REVIEW_REQUIRED' then for admin_id in select id from public.profiles where role='ADMIN' and account_status='ACTIVE' loop perform public.enqueue_notification(admin_id,case when new.risk_level in('HIGH','BLOCKED') then 'HIGH_RISK_ACTIVITY'::public.notification_type else 'PLAY_REVIEW_REQUIRED'::public.notification_type end,'Activity needs review','A campaign activity requires an Admin decision.','/admin/reviews/plays','play_event',new.id,case when new.risk_level in('HIGH','BLOCKED') then 'HIGH'::public.notification_priority else 'NORMAL'::public.notification_priority end,'ACCOUNT_SECURITY',jsonb_build_object('risk_level',new.risk_level),'admin-play-review:'||new.id);end loop;end if;return new;end$$;
create trigger play_feedback_event after insert on public.play_events for each row execute function public.after_play_feedback_event();

create function public.after_earning_feedback_event() returns trigger language plpgsql security definer set search_path='' as $$declare recipient uuid;campaign_name text;begin if new.transaction_type='PARTICIPANT_EARNING' and new.direction='CREDIT' then select profile_id into recipient from public.wallets where id=new.wallet_id;select c.campaign_name into campaign_name from public.play_events e join public.campaigns c on c.id=e.campaign_id where e.id=new.reference_id;perform public.enqueue_notification(recipient,'EARNING_CREDITED','You earned KSh '||trim(to_char(new.amount,'FM999999990.00')),coalesce(campaign_name,'Campaign activity')||case when new.status='PENDING' then ' · pending review' else ' · available' end,case when exists(select 1 from public.profiles where id=recipient and role='DJ') then '/dj/wallet' else '/matatu/wallet' end,'ledger_transaction',new.id,'NORMAL','EARNINGS',jsonb_build_object('amount',new.amount,'currency',new.currency,'status',new.status),'earning:'||new.id);end if;return new;end$$;
create trigger earning_feedback_event after insert on public.ledger_transactions for each row execute function public.after_earning_feedback_event();

create function public.after_request_feedback_event() returns trigger language plpgsql security definer set search_path='' as $$declare target_profile uuid;song_title text;count_recent integer;begin select title into song_title from public.songs where id=new.song_id;if tg_op='INSERT' then if new.target_type='DJ' then select profile_id into target_profile from public.dj_profiles where id=new.target_id;else select profile_id into target_profile from public.matatu_crew_memberships where matatu_id=new.target_id order by case membership_role when 'OWNER' then 0 else 1 end limit 1;end if;select count(*) into count_recent from public.song_requests where target_type=new.target_type and target_id=new.target_id and song_id=new.song_id and created_at>now()-interval'30 minutes';perform public.enqueue_notification(target_profile,'PASSENGER_REQUEST','New request',count_recent||' passenger'||case when count_recent=1 then ' is' else 's are' end||' requesting '||coalesce(song_title,'this song')||'.',case when new.target_type='DJ' then '/dj/activity' else '/matatu/activity' end,'song_request',new.id,'NORMAL','REQUESTS',jsonb_build_object('count',count_recent,'song_id',new.song_id),'request-bucket:'||new.target_type||':'||new.target_id||':'||new.song_id||':'||date_trunc('hour',now()));perform public.emit_activity('request.created',new.requester_profile_id,'song_request',new.id,null,new.song_id,'PRIVATE',target_profile,'Passenger request',coalesce(song_title,'Song requested'),case when new.target_type='DJ' then '/dj/activity' else '/matatu/activity' end,'{}');elsif new.status is distinct from old.status then perform public.enqueue_notification(new.requester_profile_id,'REQUEST_STATUS_CHANGED',case when new.status='PLAYED' then 'Your request was played ✓' else 'Request '||lower(new.status::text) end,coalesce(song_title,'Your song request')||' was marked '||lower(new.status::text)||'.','/activity','song_request',new.id,'LOW','REQUESTS',jsonb_build_object('status',new.status),'request-status:'||new.id||':'||new.status);perform public.emit_activity('request.'||lower(new.status::text),target_profile,'song_request',new.id,null,new.song_id,'PRIVATE',new.requester_profile_id,'Request '||lower(new.status::text),song_title,'/activity','{}');end if;return new;end$$;
create trigger request_created_feedback after insert on public.song_requests for each row execute function public.after_request_feedback_event();
create trigger request_status_feedback after update of status on public.song_requests for each row execute function public.after_request_feedback_event();

create function public.mark_notification_read(p_notification_id uuid) returns void language sql security definer set search_path='' as $$update public.notifications set read_at=coalesce(read_at,now()) where id=p_notification_id and recipient_profile_id=public.current_profile_id()$$;
create function public.mark_all_notifications_read() returns integer language plpgsql security definer set search_path='' as $$declare n integer;begin update public.notifications set read_at=coalesce(read_at,now()) where recipient_profile_id=public.current_profile_id() and read_at is null and archived_at is null;get diagnostics n=row_count;return n;end$$;
create function public.archive_notification(p_notification_id uuid) returns void language sql security definer set search_path='' as $$update public.notifications set archived_at=coalesce(archived_at,now()) where id=p_notification_id and recipient_profile_id=public.current_profile_id()$$;
create function public.set_notification_preference(p_category public.notification_category,p_enabled boolean) returns void language sql security definer set search_path='' as $$insert into public.notification_preferences(profile_id,category,in_app_enabled) values(public.current_profile_id(),p_category,p_enabled) on conflict(profile_id,category) do update set in_app_enabled=excluded.in_app_enabled,updated_at=now()$$;

alter table public.notification_preferences enable row level security;alter table public.activity_events enable row level security;alter table public.notification_outbox enable row level security;
create policy notification_preferences_self on public.notification_preferences for select to authenticated using(profile_id=public.current_profile_id());
create policy activity_safe_read on public.activity_events for select to authenticated using(visibility='PUBLIC' or recipient_profile_id=public.current_profile_id() or (visibility='ADMIN' and public.is_admin()) or (visibility='PARTICIPANTS' and (recipient_profile_id=public.current_profile_id() or public.is_admin())));
create policy outbox_admin_read on public.notification_outbox for select to authenticated using(public.is_admin());
grant select on public.notification_preferences,public.activity_events to authenticated;grant update(archived_at) on public.notifications to authenticated;
grant execute on function public.mark_notification_read(uuid),public.mark_all_notifications_read(),public.archive_notification(uuid),public.set_notification_preference(public.notification_category,boolean) to authenticated;
revoke execute on function public.enqueue_notification(uuid,public.notification_type,text,text,text,text,uuid,public.notification_priority,public.notification_category,jsonb,text),public.emit_activity(text,uuid,text,uuid,uuid,uuid,public.activity_visibility,uuid,text,text,text,jsonb) from public,anon,authenticated;

do $$begin alter publication supabase_realtime add table public.notifications;exception when duplicate_object then null;end$$;
commit;
