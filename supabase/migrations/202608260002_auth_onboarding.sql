begin;

create type public.onboarding_status as enum ('NOT_STARTED','IN_PROGRESS','COMPLETED');
create type public.matatu_relationship_role as enum ('OWNER','DRIVER','CONDUCTOR','CREW_MUSIC_OPERATOR');

alter table public.profiles
  add column onboarding_status public.onboarding_status not null default 'NOT_STARTED',
  add column favourite_genres text[] not null default '{}';

-- Accounts created before onboarding existed are already configured.
update public.profiles set onboarding_status = 'COMPLETED';

alter table public.matatu_crew_memberships
  add column relationship_role public.matatu_relationship_role not null default 'CREW_MUSIC_OPERATOR';

update public.matatu_crew_memberships
set relationship_role = case membership_role when 'OWNER' then 'OWNER'::public.matatu_relationship_role else 'CREW_MUSIC_OPERATOR'::public.matatu_relationship_role end;

create table public.public_handles (
  handle text primary key check (handle ~ '^[a-z0-9_]{3,30}$'),
  entity_type text not null check (entity_type in ('artist_account','dj_profile','matatu')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);

insert into public.public_handles(handle,entity_type,entity_id)
select lower(handle),'artist_account',id from public.artist_accounts
union all select lower(handle),'dj_profile',id from public.dj_profiles
union all select lower(handle),'matatu',id from public.matatus;

create function public.normalize_handle(value text)
returns text language sql immutable set search_path = ''
as $$ select lower(trim(both '_' from regexp_replace(coalesce(value,''), '[^a-zA-Z0-9_]+', '_', 'g'))) $$;

create function public.is_reserved_handle(value text)
returns boolean language sql immutable set search_path = ''
as $$ select public.normalize_handle(value) = any(array['admin','api','auth','help','login','logout','me','official','root','sauti','settings','signup','support','system']) $$;

create function public.claim_public_handle()
returns trigger language plpgsql security definer set search_path = '' as $$
declare normalized text := public.normalize_handle(new.handle);
declare kind text := case tg_table_name when 'artist_accounts' then 'artist_account' when 'dj_profiles' then 'dj_profile' when 'matatus' then 'matatu' else null end;
begin
  if normalized !~ '^[a-z0-9_]{3,30}$' then raise exception using errcode='22023', message='INVALID_HANDLE'; end if;
  if public.is_reserved_handle(normalized) then raise exception using errcode='22023', message='RESERVED_HANDLE'; end if;
  if tg_op = 'UPDATE' and old.handle <> normalized then delete from public.public_handles where entity_type=kind and entity_id=old.id; end if;
  insert into public.public_handles(handle,entity_type,entity_id) values(normalized,kind,new.id)
  on conflict(entity_type,entity_id) do update set handle=excluded.handle;
  new.handle := normalized;
  return new;
exception when unique_violation then raise exception using errcode='23505', message='HANDLE_TAKEN';
end;
$$;

create trigger artist_accounts_claim_handle before insert or update of handle on public.artist_accounts for each row execute function public.claim_public_handle();
create trigger dj_profiles_claim_handle before insert or update of handle on public.dj_profiles for each row execute function public.claim_public_handle();
create trigger matatus_claim_handle before insert or update of handle on public.matatus for each row execute function public.claim_public_handle();

create function public.release_public_handle()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.public_handles where entity_id=old.id and entity_type=case tg_table_name when 'artist_accounts' then 'artist_account' when 'dj_profiles' then 'dj_profile' when 'matatus' then 'matatu' end;
  return old;
end;
$$;
create trigger artist_accounts_release_handle after delete on public.artist_accounts for each row execute function public.release_public_handle();
create trigger dj_profiles_release_handle after delete on public.dj_profiles for each row execute function public.release_public_handle();
create trigger matatus_release_handle after delete on public.matatus for each row execute function public.release_public_handle();

create function public.handle_is_available(value text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.normalize_handle(value) ~ '^[a-z0-9_]{3,30}$'
    and not public.is_reserved_handle(value)
    and not exists(select 1 from public.public_handles where handle=public.normalize_handle(value));
$$;

create function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce((new.raw_app_meta_data->>'seed_profile_managed')::boolean,false) then return new; end if;
  insert into public.profiles(auth_user_id,display_name,contact_email,role,onboarding_status)
  values(new.id,coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),split_part(coalesce(new.email,'Sauti member'),'@',1)),new.email,'LISTENER','NOT_STARTED')
  on conflict(auth_user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create function public.complete_onboarding(p_role public.user_role, p_details jsonb default '{}'::jsonb)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare profile_row public.profiles;
declare entity_id uuid;
declare requested_handle text;
declare relationship public.matatu_relationship_role;
begin
  if auth.uid() is null then raise exception using errcode='42501', message='AUTH_REQUIRED'; end if;
  if p_role = 'ADMIN' then raise exception using errcode='42501', message='ROLE_NOT_ALLOWED'; end if;

  select * into profile_row from public.profiles where auth_user_id=auth.uid() for update;
  if profile_row.id is null then raise exception using errcode='P0002', message='PROFILE_NOT_FOUND'; end if;
  if profile_row.onboarding_status='COMPLETED' then return profile_row; end if;

  update public.profiles set
    role=p_role,
    display_name=coalesce(nullif(trim(p_details->>'display_name'),''),display_name),
    county=nullif(trim(p_details->>'county'),''),
    town_area=nullif(trim(p_details->>'town_area'),''),
    bio=nullif(trim(p_details->>'bio'),''),
    avatar_url=nullif(trim(p_details->>'avatar_url'),''),
    favourite_genres=coalesce(array(select jsonb_array_elements_text(coalesce(p_details->'genres','[]'::jsonb))),'{}'),
    onboarding_status='IN_PROGRESS'
  where id=profile_row.id returning * into profile_row;

  if p_role='ARTIST_LABEL' then
    requested_handle := public.normalize_handle(p_details->>'handle');
    if nullif(trim(p_details->>'name'),'') is null then raise exception using errcode='22023', message='ARTIST_NAME_REQUIRED'; end if;
    insert into public.artist_accounts(account_type,name,handle,profile_image_url,bio,county,town_area)
    values((p_details->>'account_type')::public.artist_account_type,trim(p_details->>'name'),requested_handle,nullif(trim(p_details->>'avatar_url'),''),nullif(trim(p_details->>'bio'),''),nullif(trim(p_details->>'county'),''),nullif(trim(p_details->>'town_area'),''))
    returning id into entity_id;
    insert into public.artist_account_memberships(artist_account_id,profile_id,membership_role) values(entity_id,profile_row.id,'OWNER');
  elsif p_role='DJ' then
    requested_handle := public.normalize_handle(p_details->>'handle');
    if nullif(trim(p_details->>'stage_name'),'') is null then raise exception using errcode='22023', message='STAGE_NAME_REQUIRED'; end if;
    insert into public.dj_profiles(profile_id,stage_name,handle,bio,photo_url,county,town_area,music_genres)
    values(profile_row.id,trim(p_details->>'stage_name'),requested_handle,nullif(trim(p_details->>'bio'),''),nullif(trim(p_details->>'avatar_url'),''),nullif(trim(p_details->>'county'),''),nullif(trim(p_details->>'town_area'),''),coalesce(array(select jsonb_array_elements_text(coalesce(p_details->'genres','[]'::jsonb))),'{}'));
  elsif p_role='MATATU_CREW' then
    if nullif(trim(p_details->>'name'),'') is null then raise exception using errcode='22023', message='MATATU_NAME_REQUIRED'; end if;
    relationship := (p_details->>'relationship')::public.matatu_relationship_role;
    requested_handle := public.normalize_handle(coalesce(nullif(p_details->>'handle',''),(p_details->>'name')||'_'||substr(replace(profile_row.id::text,'-',''),1,5)));
    insert into public.matatus(display_name,handle,sacco_name,main_route,county,town_area,profile_image_url)
    values(trim(p_details->>'name'),requested_handle,nullif(trim(p_details->>'sacco_name'),''),nullif(trim(p_details->>'main_route'),''),nullif(trim(p_details->>'county'),''),nullif(trim(p_details->>'town_area'),''),nullif(trim(p_details->>'avatar_url'),''))
    returning id into entity_id;
    insert into public.matatu_crew_memberships(matatu_id,profile_id,membership_role,relationship_role) values(entity_id,profile_row.id,'OWNER',relationship);
  end if;

  update public.profiles set onboarding_status='COMPLETED' where id=profile_row.id returning * into profile_row;
  return profile_row;
exception
  when invalid_text_representation then raise exception using errcode='22023', message='INVALID_ONBOARDING_OPTION';
end;
$$;

alter table public.public_handles enable row level security;
revoke all on public.public_handles from anon,authenticated;
grant execute on function public.handle_is_available(text) to authenticated;
grant execute on function public.complete_onboarding(public.user_role,jsonb) to authenticated;

commit;
