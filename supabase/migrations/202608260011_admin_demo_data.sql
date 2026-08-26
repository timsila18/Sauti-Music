begin;

insert into public.campaigns(id,artist_account_id,song_id,campaign_name,objective,total_budget,currency,start_date,end_date,status,approval_status)
select v.id::uuid,'30000000-0000-0000-0000-000000000001'::uuid,v.song_id::uuid,v.name,v.objective::public.campaign_objective,v.budget,'KES',v.starts::date,v.ends::date,'PENDING_APPROVAL','PENDING'
from(values('70000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000001','City Pulse DJ Push','AWARENESS',25000,'2026-09-03','2026-09-18'),('70000000-0000-0000-0000-000000000004','60000000-0000-0000-0000-000000000002','Umoja Route Weekend','VERIFIED_PLAYS',18000,'2026-09-05','2026-09-12'))v(id,song_id,name,objective,budget,starts,ends)
where exists(select 1 from public.artist_accounts where id='30000000-0000-0000-0000-000000000001') on conflict(id) do nothing;
insert into public.campaign_participant_types(campaign_id,participant_type) select '70000000-0000-0000-0000-000000000003'::uuid,'DJ'::public.participant_type where exists(select 1 from public.campaigns where id='70000000-0000-0000-0000-000000000003') union all select '70000000-0000-0000-0000-000000000004'::uuid,'MATATU'::public.participant_type where exists(select 1 from public.campaigns where id='70000000-0000-0000-0000-000000000004') on conflict do nothing;
insert into public.play_event_flags(play_event_id,flag_type,details) select '90000000-0000-0000-0000-000000000002','SUSPICIOUS_REPETITION','{"pattern":"development review example"}' where exists(select 1 from public.play_events where id='90000000-0000-0000-0000-000000000002') on conflict do nothing;
update public.profiles set account_status='SUSPENDED' where id='20000000-0000-0000-0000-000000000001';
insert into public.disputes(id,dispute_type,opened_by,related_entity_type,related_entity_id,status,description,admin_notes) select 'c0000000-0000-0000-0000-000000000001','MISSING_EARNING','20000000-0000-0000-0000-000000000003','play_event','90000000-0000-0000-0000-000000000002','OPEN','A fictional missing earning review for the Admin demo.','Check the linked play and campaign allocation.' where exists(select 1 from public.profiles where id='20000000-0000-0000-0000-000000000003') on conflict(id) do nothing;

commit;
