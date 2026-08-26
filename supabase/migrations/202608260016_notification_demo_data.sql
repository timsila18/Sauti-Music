begin;
insert into public.notifications(recipient_profile_id,notification_type,title,body,link_url,related_entity_type,related_entity_id,priority,category,deduplication_key,metadata)
select v.recipient,v.kind::public.notification_type,v.title,v.body,v.url,v.entity_type,v.entity_id,v.priority::public.notification_priority,v.category::public.notification_category,v.dedupe,'{"demo":true}'::jsonb
from(values
 ('20000000-0000-0000-0000-000000000002'::uuid,'CAMPAIGN_ACTIVE','Your campaign is active','Nairobi Nights Launch is ready for participating DJs and matatus.','/artist/campaigns/70000000-0000-0000-0000-000000000001','campaign','70000000-0000-0000-0000-000000000001'::uuid,'NORMAL','CAMPAIGNS','demo-artist-campaign'),
 ('20000000-0000-0000-0000-000000000003'::uuid,'EARNING_CREDITED','You earned KSh 105','Nairobi Nights Launch qualified activity.','/dj/wallet','campaign','70000000-0000-0000-0000-000000000001'::uuid,'NORMAL','EARNINGS','demo-dj-earning'),
 ('20000000-0000-0000-0000-000000000004'::uuid,'PASSENGER_REQUEST','New request','3 passengers are requesting Nairobi After Dark.','/matatu/activity','song','60000000-0000-0000-0000-000000000001'::uuid,'NORMAL','REQUESTS','demo-matatu-request'),
 ('20000000-0000-0000-0000-000000000001'::uuid,'FOLLOWED_ARTIST_RELEASE','New music from an artist you follow','Nairobi After Dark is now on Sauti.','/song/nairobi-after-dark','song','60000000-0000-0000-0000-000000000001'::uuid,'LOW','MUSIC_DISCOVERY','demo-listener-release'),
 ('20000000-0000-0000-0000-000000000005'::uuid,'PLAY_REVIEW_REQUIRED','Activity needs review','A flagged campaign play is waiting in the Admin queue.','/admin/reviews/plays','play_event','90000000-0000-0000-0000-000000000002'::uuid,'HIGH','ACCOUNT_SECURITY','demo-admin-flag')
)v(recipient,kind,title,body,url,entity_type,entity_id,priority,category,dedupe)
where exists(select 1 from public.profiles p where p.id=v.recipient)
on conflict do nothing;

insert into public.activity_events(id,event_type,subject_type,subject_id,related_campaign_id,related_song_id,visibility,recipient_profile_id,title,body,action_url,metadata,created_at)
select v.id,v.event_type,v.subject_type,v.subject_id,v.campaign,v.song,v.visibility::public.activity_visibility,v.recipient,v.title,v.body,v.url,'{"demo":true}',v.created_at
from(values
 ('d0000000-0000-0000-0000-000000000001'::uuid,'campaign.activated','campaign','70000000-0000-0000-0000-000000000001'::uuid,'70000000-0000-0000-0000-000000000001'::uuid,'60000000-0000-0000-0000-000000000001'::uuid,'PARTICIPANTS','20000000-0000-0000-0000-000000000002'::uuid,'Nairobi Nights Launch went active','DJs and matatus can now join.','/artist/campaigns/70000000-0000-0000-0000-000000000001',now()-interval'2 hours'),
 ('d0000000-0000-0000-0000-000000000002'::uuid,'earning.created','ledger_transaction',null,'70000000-0000-0000-0000-000000000001'::uuid,'60000000-0000-0000-0000-000000000001'::uuid,'PRIVATE','20000000-0000-0000-0000-000000000003'::uuid,'KSh 105 earning credited','Qualified campaign activity.','/dj/wallet',now()-interval'1 hour'),
 ('d0000000-0000-0000-0000-000000000003'::uuid,'request.created','song_request',null,null,'60000000-0000-0000-0000-000000000001'::uuid,'PRIVATE','20000000-0000-0000-0000-000000000004'::uuid,'Passenger request','Nairobi After Dark is being requested.','/matatu/activity',now()-interval'20 minutes'),
 ('d0000000-0000-0000-0000-000000000004'::uuid,'release.published','song','60000000-0000-0000-0000-000000000001'::uuid,null,'60000000-0000-0000-0000-000000000001'::uuid,'PRIVATE','20000000-0000-0000-0000-000000000001'::uuid,'New music from Akili Records','Nairobi After Dark is now on Sauti.','/song/nairobi-after-dark',now()-interval'1 day')
)v(id,event_type,subject_type,subject_id,campaign,song,visibility,recipient,title,body,url,created_at)
where exists(select 1 from public.profiles p where p.id=v.recipient)
on conflict(id) do nothing;
commit;
