begin;

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('LISTENER','ARTIST_LABEL','DJ','MATATU_CREW','ADMIN');
create type public.verification_status as enum ('PENDING','VERIFIED','REJECTED','FLAGGED');
create type public.account_status as enum ('ACTIVE','SUSPENDED','DEACTIVATED');
create type public.artist_account_type as enum ('INDEPENDENT_ARTIST','ARTIST_TEAM','LABEL');
create type public.membership_role as enum ('OWNER','ADMIN','MEMBER');
create type public.song_status as enum ('DRAFT','PENDING_REVIEW','APPROVED','REJECTED','ARCHIVED');
create type public.campaign_status as enum ('DRAFT','PENDING_APPROVAL','ACTIVE','PAUSED','COMPLETED','REJECTED','CANCELLED');
create type public.campaign_approval_status as enum ('NOT_SUBMITTED','PENDING','APPROVED','REJECTED');
create type public.campaign_objective as enum ('AWARENESS','VERIFIED_PLAYS','DISCOVERY');
create type public.participant_type as enum ('DJ','MATATU');
create type public.participation_status as enum ('AVAILABLE','INVITED','ACCEPTED','ACTIVE','COMPLETED','REJECTED','REMOVED');
create type public.target_type as enum ('COUNTY','TOWN_AREA','MATATU_ROUTE','DJ','MATATU','PARTICIPANT_TYPE');
create type public.play_source_type as enum ('MATATU','DJ','RADIO','VENUE','PERSONAL','TRIPLINK','OTHER');
create type public.verification_method as enum ('SAUTI_PLAYER','AUDIO_FINGERPRINT','DJ_INTEGRATION','RADIO_FEED','MANUAL','SYSTEM');
create type public.qualification_status as enum ('PENDING','QUALIFIED','DISQUALIFIED','REVIEW_REQUIRED');
create type public.play_flag_type as enum ('DUPLICATE_PLAY','COOLDOWN_VIOLATION','SUSPICIOUS_REPETITION','MINIMUM_DURATION_FAILURE','PARTICIPANT_LIMIT_EXCEEDED','CAMPAIGN_DAILY_LIMIT_EXCEEDED','MANUAL_REVIEW_REQUIRED','OTHER');
create type public.review_status as enum ('OPEN','CONFIRMED','DISMISSED');
create type public.wallet_owner_type as enum ('PROFILE','ARTIST_ACCOUNT','CAMPAIGN');
create type public.wallet_type as enum ('EARNINGS','CAMPAIGN_BUDGET','PAYOUT','OPERATING');
create type public.wallet_status as enum ('ACTIVE','FROZEN','CLOSED');
create type public.ledger_transaction_type as enum ('CAMPAIGN_FUNDING','CAMPAIGN_HOLD','PARTICIPANT_EARNING','SAUTI_COMMISSION','REFUND','PAYOUT','ADJUSTMENT','BONUS','PAYMENT_FEE');
create type public.ledger_direction as enum ('DEBIT','CREDIT');
create type public.ledger_status as enum ('PENDING','POSTED','VOIDED');
create type public.notification_type as enum ('CAMPAIGN_AVAILABLE','CAMPAIGN_APPROVED','CAMPAIGN_REJECTED','PARTICIPANT_ACCEPTED','QUALIFIED_PLAY','EARNINGS_CREDITED','CAMPAIGN_BUDGET_LOW','CAMPAIGN_COMPLETED','PAYOUT_UPDATE');
create type public.external_provider as enum ('TRIPLINK','SPOTIFY','YOUTUBE','APPLE_MUSIC','MDUNDO','AUDIO_RECOGNITION','OTHER');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  handle text unique check (handle is null or handle ~ '^[a-z0-9_]{3,30}$'),
  role public.user_role not null default 'LISTENER',
  phone text,
  contact_email text,
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 500),
  county text,
  town_area text,
  verification_status public.verification_status not null default 'PENDING',
  account_status public.account_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artist_accounts (
  id uuid primary key default gen_random_uuid(),
  account_type public.artist_account_type not null,
  name text not null check (char_length(name) between 1 and 120),
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,30}$'),
  profile_image_url text,
  cover_image_url text,
  bio text check (bio is null or char_length(bio) <= 1000),
  county text,
  town_area text,
  website_url text,
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  verification_status public.verification_status not null default 'PENDING',
  status public.account_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artist_account_memberships (
  artist_account_id uuid not null references public.artist_accounts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  membership_role public.membership_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  primary key (artist_account_id, profile_id)
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  artist_account_id uuid not null references public.artist_accounts(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 200),
  version_name text,
  featured_artist_text text,
  artwork_url text,
  audio_asset_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  isrc text check (isrc is null or isrc ~ '^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$'),
  release_date date,
  genre text,
  language text,
  is_explicit boolean not null default false,
  status public.song_status not null default 'DRAFT',
  rights_declaration_accepted boolean not null default false,
  rights_declaration_timestamp timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((rights_declaration_accepted and rights_declaration_timestamp is not null) or (not rights_declaration_accepted))
);
alter table public.songs add constraint songs_id_artist_account_unique unique (id, artist_account_id);

create table public.song_contributors (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  artist_account_id uuid references public.artist_accounts(id) on delete set null,
  display_name text not null,
  contribution_role text not null,
  sort_order smallint not null default 0 check (sort_order >= 0),
  unique (song_id, display_name, contribution_role)
);

create table public.dj_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  stage_name text not null,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,30}$'),
  bio text,
  photo_url text,
  county text,
  town_area text,
  music_genres text[] not null default '{}',
  verification_status public.verification_status not null default 'PENDING',
  status public.account_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matatus (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,30}$'),
  vehicle_identifier text unique,
  sacco_name text,
  main_route text,
  county text,
  town_area text,
  profile_image_url text,
  status public.account_status not null default 'ACTIVE',
  verification_status public.verification_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matatu_crew_memberships (
  matatu_id uuid not null references public.matatus(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  membership_role public.membership_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  primary key (matatu_id, profile_id)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  artist_account_id uuid not null references public.artist_accounts(id) on delete restrict,
  song_id uuid not null references public.songs(id) on delete restrict,
  campaign_name text not null,
  objective public.campaign_objective not null,
  total_budget numeric(14,2) not null check (total_budget > 0),
  currency text not null default 'KES' check (currency ~ '^[A-Z]{3}$'),
  start_date date not null,
  end_date date not null,
  status public.campaign_status not null default 'DRAFT',
  approval_status public.campaign_approval_status not null default 'NOT_SUBMITTED',
  approval_notes text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  paused_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check ((status = 'ACTIVE' and approval_status = 'APPROVED' and approved_at is not null and approved_by is not null) or status <> 'ACTIVE'),
  check ((approval_status = 'APPROVED' and approved_at is not null and approved_by is not null) or approval_status <> 'APPROVED')
);
alter table public.campaigns add constraint campaigns_song_owner_fk foreign key (song_id, artist_account_id) references public.songs(id, artist_account_id) on delete restrict;
alter table public.campaigns add constraint campaigns_id_song_unique unique (id, song_id);

create table public.campaign_participant_types (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  participant_type public.participant_type not null,
  primary key (campaign_id, participant_type)
);

create table public.campaign_targets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  target_type public.target_type not null,
  text_value text,
  dj_profile_id uuid references public.dj_profiles(id) on delete cascade,
  matatu_id uuid references public.matatus(id) on delete cascade,
  participant_type public.participant_type,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (
    (target_type in ('COUNTY','TOWN_AREA','MATATU_ROUTE') and text_value is not null and dj_profile_id is null and matatu_id is null and participant_type is null) or
    (target_type = 'DJ' and dj_profile_id is not null and text_value is null and matatu_id is null and participant_type is null) or
    (target_type = 'MATATU' and matatu_id is not null and text_value is null and dj_profile_id is null and participant_type is null) or
    (target_type = 'PARTICIPANT_TYPE' and participant_type is not null and text_value is null and dj_profile_id is null and matatu_id is null)
  )
);

create table public.campaign_participations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  participant_type public.participant_type not null,
  dj_profile_id uuid references public.dj_profiles(id) on delete restrict,
  matatu_id uuid references public.matatus(id) on delete restrict,
  status public.participation_status not null default 'AVAILABLE',
  accepted_at timestamptz,
  rejected_at timestamptz,
  earned_amount numeric(14,2) not null default 0 check (earned_amount >= 0),
  qualified_play_count integer not null default 0 check (qualified_play_count >= 0),
  last_qualified_play_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((participant_type = 'DJ' and dj_profile_id is not null and matatu_id is null) or (participant_type = 'MATATU' and matatu_id is not null and dj_profile_id is null)),
  unique nulls not distinct (campaign_id, dj_profile_id, matatu_id)
);
alter table public.campaign_participations add constraint participations_id_campaign_unique unique (id, campaign_id);
comment on column public.campaign_participations.earned_amount is 'Cached summary only; ledger_transactions is the financial source of truth.';
comment on column public.campaign_participations.qualified_play_count is 'Cached summary only; qualified play_events is the audit source of truth.';

create table public.play_events (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete restrict,
  campaign_id uuid references public.campaigns(id) on delete set null,
  campaign_participation_id uuid references public.campaign_participations(id) on delete set null,
  source_type public.play_source_type not null,
  source_id uuid,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  verification_status public.verification_status not null default 'PENDING',
  verification_method public.verification_method not null,
  qualification_status public.qualification_status not null default 'PENDING',
  qualified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at),
  check ((qualification_status = 'QUALIFIED' and qualified_at is not null) or qualification_status <> 'QUALIFIED')
);
alter table public.play_events add constraint play_events_campaign_song_fk foreign key (campaign_id, song_id) references public.campaigns(id, song_id) on delete restrict;
alter table public.play_events add constraint play_events_participation_campaign_fk foreign key (campaign_participation_id, campaign_id) references public.campaign_participations(id, campaign_id) on delete restrict;

create table public.play_event_flags (
  id uuid primary key default gen_random_uuid(),
  play_event_id uuid not null references public.play_events(id) on delete cascade,
  flag_type public.play_flag_type not null,
  status public.review_status not null default 'OPEN',
  details jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (play_event_id, flag_type)
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  owner_type public.wallet_owner_type not null,
  profile_id uuid references public.profiles(id) on delete restrict,
  artist_account_id uuid references public.artist_accounts(id) on delete restrict,
  campaign_id uuid references public.campaigns(id) on delete restrict,
  wallet_type public.wallet_type not null,
  currency text not null default 'KES' check (currency ~ '^[A-Z]{3}$'),
  status public.wallet_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  check ((owner_type='PROFILE' and profile_id is not null and artist_account_id is null and campaign_id is null) or (owner_type='ARTIST_ACCOUNT' and artist_account_id is not null and profile_id is null and campaign_id is null) or (owner_type='CAMPAIGN' and campaign_id is not null and profile_id is null and artist_account_id is null)),
  unique nulls not distinct (profile_id, artist_account_id, campaign_id, wallet_type, currency)
);

create table public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  transaction_type public.ledger_transaction_type not null,
  direction public.ledger_direction not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  reference_type text,
  reference_id uuid,
  description text not null,
  status public.ledger_status not null default 'PENDING',
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  check ((status = 'POSTED' and posted_at is not null) or status <> 'POSTED')
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  notification_type public.notification_type not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  link_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_data jsonb,
  new_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.external_identifiers (
  id uuid primary key default gen_random_uuid(),
  provider public.external_provider not null,
  entity_type text not null,
  entity_id uuid not null,
  external_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, entity_type, external_id),
  unique (provider, entity_type, entity_id)
);

create index songs_artist_account_idx on public.songs(artist_account_id);
create index campaigns_artist_account_idx on public.campaigns(artist_account_id);
create index campaigns_status_dates_idx on public.campaigns(status, start_date, end_date);
create index participations_campaign_idx on public.campaign_participations(campaign_id, status);
create index play_events_campaign_started_idx on public.play_events(campaign_id, started_at desc);
create index play_events_participation_idx on public.play_events(campaign_participation_id, qualification_status);
create index ledger_wallet_posted_idx on public.ledger_transactions(wallet_id, posted_at) where status = 'POSTED';
create index notifications_recipient_idx on public.notifications(recipient_profile_id, created_at desc);
create index audit_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create function public.prevent_mutation() returns trigger language plpgsql set search_path = '' as $$ begin raise exception '% is append-only', tg_table_name; end; $$;
create function public.validate_ledger_currency() returns trigger language plpgsql set search_path = '' as $$ begin if not exists(select 1 from public.wallets where id=new.wallet_id and currency=new.currency) then raise exception 'Ledger currency must match wallet currency'; end if; return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger artist_accounts_updated_at before update on public.artist_accounts for each row execute function public.set_updated_at();
create trigger songs_updated_at before update on public.songs for each row execute function public.set_updated_at();
create trigger dj_profiles_updated_at before update on public.dj_profiles for each row execute function public.set_updated_at();
create trigger matatus_updated_at before update on public.matatus for each row execute function public.set_updated_at();
create trigger campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger participations_updated_at before update on public.campaign_participations for each row execute function public.set_updated_at();
create trigger external_identifiers_updated_at before update on public.external_identifiers for each row execute function public.set_updated_at();
create trigger audit_logs_immutable before update or delete on public.audit_logs for each row execute function public.prevent_mutation();
create trigger ledger_currency_matches before insert or update of wallet_id,currency on public.ledger_transactions for each row execute function public.validate_ledger_currency();

create function public.current_profile_id() returns uuid language sql stable security definer set search_path = '' as $$ select id from public.profiles where auth_user_id = auth.uid() $$;
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.profiles where auth_user_id=auth.uid() and role='ADMIN' and account_status='ACTIVE') $$;
create function public.can_manage_artist(account_id uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.artist_account_memberships m join public.profiles p on p.id=m.profile_id where m.artist_account_id=account_id and p.auth_user_id=auth.uid() and m.membership_role in ('OWNER','ADMIN') and p.account_status='ACTIVE') $$;
create function public.can_manage_matatu(vehicle_id uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.matatu_crew_memberships m join public.profiles p on p.id=m.profile_id where m.matatu_id=vehicle_id and p.auth_user_id=auth.uid() and m.membership_role in ('OWNER','ADMIN') and p.account_status='ACTIVE') $$;

create view public.public_profiles with (security_barrier=true) as select id, display_name, handle, role, avatar_url, bio, county, town_area, verification_status from public.profiles where account_status='ACTIVE';
create view public.public_artist_accounts with (security_barrier=true) as select id, account_type, name, handle, profile_image_url, cover_image_url, bio, county, town_area, website_url, social_links, verification_status from public.artist_accounts where status='ACTIVE';
create view public.public_songs with (security_barrier=true) as select id, artist_account_id, title, version_name, featured_artist_text, artwork_url, duration_seconds, isrc, release_date, genre, language, is_explicit from public.songs where status='APPROVED';
create view public.wallet_balances with (security_barrier=true) as select w.id as wallet_id, w.currency, coalesce(sum(case when l.direction='CREDIT' then l.amount else -l.amount end) filter (where l.status='POSTED'),0)::numeric(14,2) as balance from public.wallets w left join public.ledger_transactions l on l.wallet_id=w.id group by w.id,w.currency;
create view public.campaign_budget_summary with (security_barrier=true) as select w.campaign_id, w.currency, coalesce(sum(l.amount) filter(where l.status='POSTED' and l.transaction_type='CAMPAIGN_FUNDING' and l.direction='CREDIT'),0)::numeric(14,2) as total_funded, coalesce(sum(l.amount) filter(where l.status='POSTED' and l.transaction_type='CAMPAIGN_HOLD' and l.direction='DEBIT'),0)::numeric(14,2) as reserved, coalesce(sum(l.amount) filter(where l.status='POSTED' and l.transaction_type in ('PARTICIPANT_EARNING','SAUTI_COMMISSION','PAYMENT_FEE') and l.direction='DEBIT'),0)::numeric(14,2) as spent, coalesce(sum(l.amount) filter(where l.status='POSTED' and l.transaction_type='PARTICIPANT_EARNING' and l.direction='DEBIT'),0)::numeric(14,2) as participant_earnings, coalesce(sum(l.amount) filter(where l.status='POSTED' and l.transaction_type='SAUTI_COMMISSION' and l.direction='DEBIT'),0)::numeric(14,2) as sauti_commission, coalesce(sum(l.amount) filter(where l.status='POSTED' and l.transaction_type='PAYMENT_FEE' and l.direction='DEBIT'),0)::numeric(14,2) as payment_fees, coalesce(sum(l.amount) filter(where l.status='POSTED' and l.transaction_type='REFUND' and l.direction='DEBIT'),0)::numeric(14,2) as refunded from public.wallets w left join public.ledger_transactions l on l.wallet_id=w.id where w.owner_type='CAMPAIGN' group by w.campaign_id,w.currency;

alter table public.profiles enable row level security;
alter table public.artist_accounts enable row level security;
alter table public.artist_account_memberships enable row level security;
alter table public.songs enable row level security;
alter table public.song_contributors enable row level security;
alter table public.dj_profiles enable row level security;
alter table public.matatus enable row level security;
alter table public.matatu_crew_memberships enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_participant_types enable row level security;
alter table public.campaign_targets enable row level security;
alter table public.campaign_participations enable row level security;
alter table public.play_events enable row level security;
alter table public.play_event_flags enable row level security;
alter table public.wallets enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.external_identifiers enable row level security;

create policy profiles_self_read on public.profiles for select to authenticated using (auth_user_id=auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (auth_user_id=auth.uid() or public.is_admin()) with check (auth_user_id=auth.uid() or public.is_admin());
create policy artist_accounts_member_read on public.artist_accounts for select to authenticated using (public.can_manage_artist(id) or public.is_admin());
create policy artist_accounts_member_update on public.artist_accounts for update to authenticated using (public.can_manage_artist(id) or public.is_admin()) with check (public.can_manage_artist(id) or public.is_admin());
create policy artist_memberships_member_read on public.artist_account_memberships for select to authenticated using (public.can_manage_artist(artist_account_id) or profile_id=public.current_profile_id() or public.is_admin());
create policy songs_owner_all on public.songs for all to authenticated using (public.can_manage_artist(artist_account_id) or public.is_admin()) with check (public.can_manage_artist(artist_account_id) or public.is_admin());
create policy song_contributors_owner_all on public.song_contributors for all to authenticated using (exists(select 1 from public.songs s where s.id=song_id and public.can_manage_artist(s.artist_account_id)) or public.is_admin()) with check (exists(select 1 from public.songs s where s.id=song_id and public.can_manage_artist(s.artist_account_id)) or public.is_admin());
create policy dj_profiles_self_all on public.dj_profiles for all to authenticated using (profile_id=public.current_profile_id() or public.is_admin()) with check (profile_id=public.current_profile_id() or public.is_admin());
create policy matatus_crew_read on public.matatus for select to authenticated using (public.can_manage_matatu(id) or public.is_admin());
create policy matatus_crew_update on public.matatus for update to authenticated using (public.can_manage_matatu(id) or public.is_admin()) with check (public.can_manage_matatu(id) or public.is_admin());
create policy matatu_memberships_crew_read on public.matatu_crew_memberships for select to authenticated using (public.can_manage_matatu(matatu_id) or profile_id=public.current_profile_id() or public.is_admin());
create policy campaigns_owner_read on public.campaigns for select to authenticated using (public.can_manage_artist(artist_account_id) or public.is_admin());
create policy campaigns_owner_insert on public.campaigns for insert to authenticated with check (public.can_manage_artist(artist_account_id) and status in ('DRAFT','PENDING_APPROVAL') and approval_status in ('NOT_SUBMITTED','PENDING'));
create policy campaigns_owner_update_draft on public.campaigns for update to authenticated using (public.can_manage_artist(artist_account_id) and status in ('DRAFT','PENDING_APPROVAL')) with check (public.can_manage_artist(artist_account_id) and status in ('DRAFT','PENDING_APPROVAL') and approval_status in ('NOT_SUBMITTED','PENDING'));
create policy campaigns_admin_all on public.campaigns for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy campaign_types_owner_all on public.campaign_participant_types for all to authenticated using (exists(select 1 from public.campaigns c where c.id=campaign_id and public.can_manage_artist(c.artist_account_id)) or public.is_admin()) with check (exists(select 1 from public.campaigns c where c.id=campaign_id and public.can_manage_artist(c.artist_account_id)) or public.is_admin());
create policy campaign_targets_owner_all on public.campaign_targets for all to authenticated using (exists(select 1 from public.campaigns c where c.id=campaign_id and public.can_manage_artist(c.artist_account_id)) or public.is_admin()) with check (exists(select 1 from public.campaigns c where c.id=campaign_id and public.can_manage_artist(c.artist_account_id)) or public.is_admin());
create policy participations_relevant_read on public.campaign_participations for select to authenticated using (public.is_admin() or exists(select 1 from public.campaigns c where c.id=campaign_id and public.can_manage_artist(c.artist_account_id)) or (dj_profile_id is not null and exists(select 1 from public.dj_profiles d where d.id=dj_profile_id and d.profile_id=public.current_profile_id())) or (matatu_id is not null and public.can_manage_matatu(matatu_id)));
create policy play_events_relevant_read on public.play_events for select to authenticated using (public.is_admin() or exists(select 1 from public.campaigns c where c.id=campaign_id and public.can_manage_artist(c.artist_account_id)) or exists(select 1 from public.campaign_participations cp where cp.id=campaign_participation_id and ((cp.dj_profile_id is not null and exists(select 1 from public.dj_profiles d where d.id=cp.dj_profile_id and d.profile_id=public.current_profile_id())) or (cp.matatu_id is not null and public.can_manage_matatu(cp.matatu_id)))));
create policy wallets_owner_read on public.wallets for select to authenticated using (public.is_admin() or profile_id=public.current_profile_id() or (artist_account_id is not null and public.can_manage_artist(artist_account_id)) or (campaign_id is not null and exists(select 1 from public.campaigns c where c.id=campaign_id and public.can_manage_artist(c.artist_account_id))));
create policy ledger_owner_read on public.ledger_transactions for select to authenticated using (public.is_admin() or exists(select 1 from public.wallets w where w.id=wallet_id and (w.profile_id=public.current_profile_id() or (w.artist_account_id is not null and public.can_manage_artist(w.artist_account_id)) or (w.campaign_id is not null and exists(select 1 from public.campaigns c where c.id=w.campaign_id and public.can_manage_artist(c.artist_account_id))))));
create policy notifications_self_read on public.notifications for select to authenticated using (recipient_profile_id=public.current_profile_id() or public.is_admin());
create policy notifications_self_update on public.notifications for update to authenticated using (recipient_profile_id=public.current_profile_id()) with check (recipient_profile_id=public.current_profile_id());
create policy audit_admin_read on public.audit_logs for select to authenticated using (public.is_admin());
create policy external_ids_admin_all on public.external_identifiers for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, handle, phone, contact_email, avatar_url, bio, county, town_area) on public.profiles to authenticated;
grant select on public.public_profiles, public.public_artist_accounts, public.public_songs to anon, authenticated;
grant select, insert, update, delete on public.artist_accounts, public.artist_account_memberships, public.songs, public.song_contributors, public.dj_profiles, public.matatus, public.matatu_crew_memberships, public.campaigns, public.campaign_participant_types, public.campaign_targets to authenticated;
grant select on public.campaign_participations, public.play_events, public.play_event_flags, public.wallets, public.ledger_transactions, public.audit_logs to authenticated;
grant select, update (read_at) on public.notifications to authenticated;
grant select on public.wallet_balances, public.campaign_budget_summary to authenticated;

commit;
