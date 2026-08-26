begin;

create type public.follow_target_type as enum ('ARTIST','DJ','MATATU');
create type public.listener_source_type as enum ('SIMULATED_LISTENING','DJ','MATATU','OTHER');
create type public.song_request_target_type as enum ('DJ','MATATU');
create type public.song_request_status as enum ('PENDING','SEEN','PLAYED','DECLINED','EXPIRED');

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.follow_target_type not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique(profile_id,target_type,target_id)
);

create table public.song_saves (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(profile_id,song_id)
);

create table public.song_likes (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(profile_id,song_id)
);

create table public.listener_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  source_type public.listener_source_type not null default 'SIMULATED_LISTENING',
  source_id uuid,
  context_label text check(context_label is null or char_length(context_label)<=120),
  heard_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.song_requests (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.song_request_target_type not null,
  target_id uuid not null,
  song_id uuid not null references public.songs(id) on delete restrict,
  status public.song_request_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index follows_target_idx on public.follows(target_type,target_id);
create index song_saves_profile_created_idx on public.song_saves(profile_id,created_at desc);
create index song_likes_song_idx on public.song_likes(song_id);
create index listener_history_profile_heard_idx on public.listener_history(profile_id,heard_at desc);
create index song_requests_target_created_idx on public.song_requests(target_type,target_id,created_at desc);
create trigger song_requests_updated_at before update on public.song_requests for each row execute function public.set_updated_at();

create function public.validate_listener_target() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if (new.target_type='ARTIST' and not exists(select 1 from public.artist_accounts where id=new.target_id and status='ACTIVE'))
    or (new.target_type='DJ' and not exists(select 1 from public.dj_profiles where id=new.target_id and status='ACTIVE'))
    or (new.target_type='MATATU' and not exists(select 1 from public.matatus where id=new.target_id and status='ACTIVE')) then
    raise exception using errcode='23503',message='TARGET_NOT_FOUND';
  end if;
  return new;
end; $$;
create trigger follows_validate_target before insert or update on public.follows for each row execute function public.validate_listener_target();

create function public.validate_song_request_target() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if (new.target_type='DJ' and not exists(select 1 from public.dj_profiles where id=new.target_id and status='ACTIVE'))
    or (new.target_type='MATATU' and not exists(select 1 from public.matatus where id=new.target_id and status='ACTIVE')) then
    raise exception using errcode='23503',message='TARGET_NOT_FOUND';
  end if;
  return new;
end; $$;
create trigger song_requests_validate_target before insert or update on public.song_requests for each row execute function public.validate_song_request_target();

create view public.public_follow_counts with (security_barrier=true) as
  select target_type,target_id,count(*)::bigint as follower_count from public.follows group by target_type,target_id;
create view public.public_song_like_counts with (security_barrier=true) as
  select song_id,count(*)::bigint as like_count from public.song_likes group by song_id;
create view public.public_dj_profiles with (security_barrier=true) as
  select id,stage_name,handle,bio,photo_url,county,town_area,music_genres,verification_status from public.dj_profiles where status='ACTIVE';
create view public.public_matatus with (security_barrier=true) as
  select id,display_name,handle,sacco_name,main_route,county,town_area,profile_image_url,verification_status from public.matatus where status='ACTIVE';

alter table public.follows enable row level security;
alter table public.song_saves enable row level security;
alter table public.song_likes enable row level security;
alter table public.listener_history enable row level security;
alter table public.song_requests enable row level security;

create policy follows_self_all on public.follows for all to authenticated using(profile_id=public.current_profile_id()) with check(profile_id=public.current_profile_id());
create policy song_saves_self_all on public.song_saves for all to authenticated using(profile_id=public.current_profile_id()) with check(profile_id=public.current_profile_id());
create policy song_likes_self_all on public.song_likes for all to authenticated using(profile_id=public.current_profile_id()) with check(profile_id=public.current_profile_id());
create policy listener_history_self_all on public.listener_history for all to authenticated using(profile_id=public.current_profile_id()) with check(profile_id=public.current_profile_id());
create policy song_requests_requester_read on public.song_requests for select to authenticated using(requester_profile_id=public.current_profile_id());
create policy song_requests_requester_insert on public.song_requests for insert to authenticated with check(requester_profile_id=public.current_profile_id() and status='PENDING');
create policy song_requests_requester_delete on public.song_requests for delete to authenticated using(requester_profile_id=public.current_profile_id() and status='PENDING');

grant select,insert,delete on public.follows,public.song_saves,public.song_likes,public.listener_history to authenticated;
grant select,insert,delete on public.song_requests to authenticated;
grant select on public.public_follow_counts,public.public_song_like_counts,public.public_dj_profiles,public.public_matatus to anon,authenticated;

commit;
