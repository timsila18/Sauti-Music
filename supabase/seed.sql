-- Local development identities. Password for all demo accounts: SautiDemo254!
insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
values
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000001','authenticated','authenticated','amani.listener@sauti.local',extensions.crypt('SautiDemo254!',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"],"seed_profile_managed":true}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000002','authenticated','authenticated','akili.artist@sauti.local',extensions.crypt('SautiDemo254!',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"],"seed_profile_managed":true}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000003','authenticated','authenticated','mura.dj@sauti.local',extensions.crypt('SautiDemo254!',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"],"seed_profile_managed":true}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000004','authenticated','authenticated','niaje.crew@sauti.local',extensions.crypt('SautiDemo254!',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"],"seed_profile_managed":true}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000005','authenticated','authenticated','admin@sauti.local',extensions.crypt('SautiDemo254!',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"],"seed_profile_managed":true}','{}',now(),now(),'','','','')
on conflict (id) do nothing;

insert into public.profiles (id,auth_user_id,display_name,handle,role,county,town_area,verification_status,onboarding_status)
values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Amani Wanjiru','amani_w','LISTENER','Nairobi','Kilimani','PENDING','COMPLETED'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Akili Records','akili_records','ARTIST_LABEL','Nairobi','Westlands','VERIFIED','COMPLETED'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','Mura Kamau','dj_mura','DJ','Nairobi','Kasarani','VERIFIED','COMPLETED'),
('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','Niaje Crew','niaje_crew','MATATU_CREW','Nairobi','Umoja','VERIFIED','COMPLETED'),
('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000005','Sauti Operations','sauti_admin','ADMIN','Nairobi','CBD','VERIFIED','COMPLETED')
on conflict (id) do nothing;

insert into public.artist_accounts (id,account_type,name,handle,bio,county,town_area,verification_status)
values
('30000000-0000-0000-0000-000000000001','LABEL','Akili Records','akili_records','Independent Kenyan sounds with a homegrown pulse.','Nairobi','Westlands','VERIFIED'),
('30000000-0000-0000-0000-000000000002','INDEPENDENT_ARTIST','Amani Vale','amani_vale','Warm city pop made in Nairobi.','Nairobi','Kilimani','VERIFIED'),
('30000000-0000-0000-0000-000000000003','INDEPENDENT_ARTIST','Zuri Mwende','zuri_mwende','Coastal melodies, bright guitars and honest stories.','Mombasa','Nyali','VERIFIED'),
('30000000-0000-0000-0000-000000000004','ARTIST_TEAM','The Mtaa Collective','mtaa_collective','New voices moving through the city.','Nairobi','Eastlands','PENDING')
on conflict (id) do nothing;

insert into public.artist_account_memberships (artist_account_id,profile_id,membership_role)
values ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','OWNER')
on conflict do nothing;

insert into public.dj_profiles (id,profile_id,stage_name,handle,bio,county,town_area,music_genres,verification_status)
values ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','DJ Mura','dj_mura','Open-format Nairobi DJ.','Nairobi','Kasarani',array['Afropop','Gengetone','Amapiano'],'VERIFIED')
on conflict (id) do nothing;

insert into public.matatus (id,display_name,handle,vehicle_identifier,sacco_name,main_route,county,town_area,verification_status)
values ('50000000-0000-0000-0000-000000000001','Niaje 254','niaje_254','KDK 254A','Umoja One Sacco','CBD – Umoja','Nairobi','Umoja','VERIFIED')
on conflict (id) do nothing;

insert into public.matatu_crew_memberships (matatu_id,profile_id,membership_role)
values ('50000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','OWNER')
on conflict do nothing;

insert into public.songs (id,artist_account_id,title,version_name,featured_artist_text,duration_seconds,isrc,release_date,genre,language,status,rights_declaration_accepted,rights_declaration_timestamp)
values
('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Nairobi After Dark',null,'Kendi Amani',214,'KEA260000001','2026-06-12','Afropop','Swahili','APPROVED',true,now()),
('60000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','Mtaa Motion','Matatu Mix',null,188,'KEA260000002','2026-07-04','Gengetone','Sheng','APPROVED',true,now()),
('60000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','Coastline',null,'Zuri Mwende',201,'KEA260000003','2026-08-01','Afrofusion','Swahili','APPROVED',true,now()),
('60000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000002','Back Home',null,'Amani Vale',196,'KEA260000004','2026-08-08','Afropop','English','APPROVED',true,now()),
('60000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000004','Sunday Energy',null,'Mali K',183,'KEA260000005','2026-08-15','Amapiano','Sheng','APPROVED',true,now()),
('60000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000002','Nairobi Nights',null,'Amani Vale',207,'KEA260000006','2026-08-22','Afropop','Swahili','APPROVED',true,now())
on conflict (id) do nothing;

update public.songs set audio_asset_url='seed-authorised/'||id||'.mp3' where artist_account_id in(select artist_account_id from public.artist_account_memberships);

insert into public.song_contributors (song_id,display_name,contribution_role,sort_order)
values
('60000000-0000-0000-0000-000000000001','Kendi Amani','PRIMARY_ARTIST',0),
('60000000-0000-0000-0000-000000000002','The Akili Collective','PRIMARY_ARTIST',0),
('60000000-0000-0000-0000-000000000003','Zuri Mwende','PRIMARY_ARTIST',0),
('60000000-0000-0000-0000-000000000004','Amani Vale','PRIMARY_ARTIST',0),
('60000000-0000-0000-0000-000000000005','Mali K','PRIMARY_ARTIST',0),
('60000000-0000-0000-0000-000000000006','Amani Vale','PRIMARY_ARTIST',0)
on conflict do nothing;

insert into public.campaigns (id,artist_account_id,song_id,campaign_name,objective,total_budget,currency,start_date,end_date,status,approval_status,approved_at,approved_by)
values
('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Nairobi Nights Launch','VERIFIED_PLAYS',120000,'KES','2026-08-20','2026-09-20','ACTIVE','APPROVED',now(),'20000000-0000-0000-0000-000000000005'),
('70000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','Mtaa Motion Route Push','DISCOVERY',85000,'KES','2026-09-01','2026-09-30','PENDING_APPROVAL','PENDING',null,null),
('70000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','City Pulse DJ Push','AWARENESS',25000,'KES','2026-09-03','2026-09-18','PENDING_APPROVAL','PENDING',null,null),
('70000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','Umoja Route Weekend','VERIFIED_PLAYS',18000,'KES','2026-09-05','2026-09-12','PENDING_APPROVAL','PENDING',null,null)
on conflict (id) do nothing;

insert into public.campaign_drafts(id,artist_account_id,owner_profile_id,song_id,current_step,configuration)
values('71000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000002',4,'{"participant_types":["MATATU"],"county":"Nairobi","areas":"Umoja","routes":"CBD – Umoja","specific":[],"start_date":"2026-09-10","end_date":"2026-09-17","budget":5000,"campaign_name":"Mtaa Motion Route Trial"}') on conflict(id) do nothing;

insert into public.campaign_participant_types (campaign_id,participant_type)
values ('70000000-0000-0000-0000-000000000001','DJ'),('70000000-0000-0000-0000-000000000001','MATATU'),('70000000-0000-0000-0000-000000000002','MATATU'),('70000000-0000-0000-0000-000000000003','DJ'),('70000000-0000-0000-0000-000000000004','MATATU')
on conflict do nothing;

insert into public.campaign_targets (campaign_id,target_type,text_value)
values
('70000000-0000-0000-0000-000000000001','COUNTY','Nairobi'),
('70000000-0000-0000-0000-000000000002','MATATU_ROUTE','CBD – Umoja');

insert into public.campaign_participations (id,campaign_id,participant_type,dj_profile_id,matatu_id,status,accepted_at,earned_amount,qualified_play_count,last_qualified_play_at)
values
('80000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','DJ','40000000-0000-0000-0000-000000000001',null,'ACTIVE',now()-interval '5 days',105,3,now()-interval '2 hours'),
('80000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000001','MATATU',null,'50000000-0000-0000-0000-000000000001','ACTIVE',now()-interval '4 days',70,2,now()-interval '1 hour')
on conflict (id) do nothing;

insert into public.play_events (id,song_id,campaign_id,campaign_participation_id,source_type,source_id,started_at,ended_at,duration_seconds,verification_status,verification_method,qualification_status,qualified_at,metadata)
values
('90000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000001','DJ','40000000-0000-0000-0000-000000000001',now()-interval '2 days',now()-interval '2 days'+interval '190 seconds',190,'VERIFIED','SAUTI_PLAYER','QUALIFIED',now()-interval '2 days','{"context":"evening set"}'),
('90000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000001','DJ','40000000-0000-0000-0000-000000000001',now()-interval '1 day',now()-interval '1 day'+interval '180 seconds',180,'VERIFIED','SAUTI_PLAYER','QUALIFIED',now()-interval '1 day','{}'),
('90000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000002','MATATU','50000000-0000-0000-0000-000000000001',now()-interval '3 hours',now()-interval '3 hours'+interval '185 seconds',185,'VERIFIED','SAUTI_PLAYER','QUALIFIED',now()-interval '3 hours','{"route":"CBD – Umoja"}'),
('90000000-0000-0000-0000-000000000004','60000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000002','MATATU','50000000-0000-0000-0000-000000000001',now()-interval '1 hour',now()-interval '1 hour'+interval '35 seconds',35,'VERIFIED','SAUTI_PLAYER','NOT_QUALIFIED',null,'{"reason":"minimum_duration"}');

insert into public.play_event_flags (play_event_id,flag_type,details)
values ('90000000-0000-0000-0000-000000000004','MINIMUM_DURATION_FAILURE','{"minimum_seconds":60,"observed_seconds":35}'),('90000000-0000-0000-0000-000000000002','SUSPICIOUS_REPETITION','{"pattern":"development review example"}') on conflict do nothing;

insert into public.wallets (id,owner_type,profile_id,artist_account_id,campaign_id,wallet_type,currency)
values
('a0000000-0000-0000-0000-000000000001','CAMPAIGN',null,null,'70000000-0000-0000-0000-000000000001','CAMPAIGN_BUDGET','KES'),
('a0000000-0000-0000-0000-000000000002','PROFILE','20000000-0000-0000-0000-000000000003',null,null,'EARNINGS','KES'),
('a0000000-0000-0000-0000-000000000003','PROFILE','20000000-0000-0000-0000-000000000004',null,null,'EARNINGS','KES'),
('a0000000-0000-0000-0000-000000000004','PROFILE','20000000-0000-0000-0000-000000000005',null,null,'OPERATING','KES')
on conflict (id) do nothing;

insert into public.ledger_transactions (wallet_id,transaction_type,direction,amount,currency,reference_type,reference_id,description,status,idempotency_key,posted_at,available_at)
values
('a0000000-0000-0000-0000-000000000001','CAMPAIGN_FUNDING','CREDIT',120000,'KES','campaign','70000000-0000-0000-0000-000000000001','Campaign funded','POSTED','seed-campaign-funding',now()-interval '7 days',null),
('a0000000-0000-0000-0000-000000000001','PARTICIPANT_EARNING','DEBIT',105,'KES','participation','80000000-0000-0000-0000-000000000001','DJ qualified play earnings','POSTED','seed-dj-campaign-debit',now()-interval '1 day',null),
('a0000000-0000-0000-0000-000000000002','PARTICIPANT_EARNING','CREDIT',105,'KES','participation','80000000-0000-0000-0000-000000000001','DJ qualified play earnings','POSTED','seed-dj-earning-credit',now()-interval '1 day',now()-interval '1 hour'),
('a0000000-0000-0000-0000-000000000001','PARTICIPANT_EARNING','DEBIT',70,'KES','participation','80000000-0000-0000-0000-000000000002','Matatu qualified play earnings','POSTED','seed-matatu-campaign-debit',now()-interval '1 hour',null),
('a0000000-0000-0000-0000-000000000003','PARTICIPANT_EARNING','CREDIT',70,'KES','participation','80000000-0000-0000-0000-000000000002','Matatu qualified play earnings','POSTED','seed-matatu-earning-credit',now()-interval '1 hour',now()-interval '30 minutes'),
('a0000000-0000-0000-0000-000000000001','PLATFORM_COMMISSION','DEBIT',17.50,'KES','campaign','70000000-0000-0000-0000-000000000001','Sauti platform fee reserved','POSTED','seed-sauti-commission-debit',now()-interval '1 hour',null),
('a0000000-0000-0000-0000-000000000004','PLATFORM_COMMISSION','CREDIT',17.50,'KES','campaign','70000000-0000-0000-0000-000000000001','Sauti platform fee reserved','POSTED','seed-sauti-commission-credit',now()-interval '1 hour',null),
('a0000000-0000-0000-0000-000000000002','BONUS','CREDIT',50,'KES','development',null,'Campaign quality bonus','PENDING','seed-dj-pending-bonus',null,null),
('a0000000-0000-0000-0000-000000000003','ADJUSTMENT','CREDIT',100,'KES','admin_adjustment',null,'Development support adjustment','POSTED','seed-matatu-adjustment',now()-interval '2 days',now()-interval '1 day') on conflict(idempotency_key) do nothing;

insert into public.payout_requests(id,wallet_id,amount,currency,method,destination_reference,status,requested_by,idempotency_key,metadata)
values('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002',100,'KES','MPESA_B2C','2547•••••123','REQUESTED','20000000-0000-0000-0000-000000000003','seed-payout-placeholder','{"development_only":true}') on conflict(id) do nothing;

insert into public.notifications (recipient_profile_id,notification_type,title,body,metadata,link_url)
values
('20000000-0000-0000-0000-000000000002','CAMPAIGN_APPROVED','Campaign approved','Nairobi Nights Launch is live.','{"campaign_id":"70000000-0000-0000-0000-000000000001"}','/artist'),
('20000000-0000-0000-0000-000000000003','EARNINGS_CREDITED','Earnings credited','KSh 105 was credited for qualified plays.','{"amount":105,"currency":"KES"}','/dj');

insert into public.audit_logs (actor_profile_id,action,entity_type,entity_id,new_data,metadata)
values ('20000000-0000-0000-0000-000000000005','CAMPAIGN_APPROVED','campaign','70000000-0000-0000-0000-000000000001','{"status":"ACTIVE","approval_status":"APPROVED"}','{"source":"seed"}');

insert into public.external_identifiers (provider,entity_type,entity_id,external_id,metadata)
values ('TRIPLINK','matatu','50000000-0000-0000-0000-000000000001','triplink-demo-254','{"environment":"demo"}') on conflict do nothing;

update public.profiles set account_status='SUSPENDED' where id='20000000-0000-0000-0000-000000000001';
insert into public.disputes(id,dispute_type,opened_by,related_entity_type,related_entity_id,status,description,admin_notes)
values('c0000000-0000-0000-0000-000000000001','MISSING_EARNING','20000000-0000-0000-0000-000000000003','play_event','90000000-0000-0000-0000-000000000002','OPEN','A fictional missing earning review for the Admin demo.','Check the linked play and campaign allocation.') on conflict(id) do nothing;
