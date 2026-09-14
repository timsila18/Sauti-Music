begin;

do $$
begin
  create type public.admin_level as enum ('SUPER_ADMIN', 'ADMIN');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.admin_assignments (
  profile_id uuid primary key references public.profiles(id) on delete restrict,
  level public.admin_level not null,
  assigned_by uuid references public.profiles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_super_admin
  on public.admin_assignments ((level))
  where level = 'SUPER_ADMIN';

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_assignments assignment
    join public.profiles profile on profile.id = assignment.profile_id
    where profile.auth_user_id = auth.uid()
      and profile.role = 'ADMIN'
      and profile.account_status = 'ACTIVE'
      and assignment.level = 'SUPER_ADMIN'
  )
$$;

alter table public.admin_assignments enable row level security;

do $$
begin
  create policy admin_assignments_admin_read
  on public.admin_assignments
  for select
  to authenticated
  using (public.is_admin());
exception
  when duplicate_object then null;
end
$$;

revoke all on public.admin_assignments from public, anon;
grant select on public.admin_assignments to authenticated;
revoke execute on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to authenticated;

commit;
