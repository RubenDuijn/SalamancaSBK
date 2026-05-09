begin;

alter table public.profiles
  add column if not exists role text not null default 'member';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('member', 'admin'));

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin_user());

drop policy if exists profiles_insert_admin_only on public.profiles;
create policy profiles_insert_admin_only
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin_user());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id or public.is_admin_user())
  with check (auth.uid() = id or public.is_admin_user());

drop policy if exists profiles_delete_admin_only on public.profiles;
create policy profiles_delete_admin_only
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin_user());

alter table public.student_style_levels enable row level security;

drop policy if exists student_style_levels_select_own_or_admin on public.student_style_levels;
create policy student_style_levels_select_own_or_admin
  on public.student_style_levels
  for select
  to authenticated
  using (
    auth.uid() = student_id
    or public.is_admin_user()
  );

drop policy if exists student_style_levels_insert_admin_only on public.student_style_levels;
create policy student_style_levels_insert_admin_only
  on public.student_style_levels
  for insert
  to authenticated
  with check (public.is_admin_user());

drop policy if exists student_style_levels_update_admin_only on public.student_style_levels;
create policy student_style_levels_update_admin_only
  on public.student_style_levels
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists student_style_levels_delete_admin_only on public.student_style_levels;
create policy student_style_levels_delete_admin_only
  on public.student_style_levels
  for delete
  to authenticated
  using (public.is_admin_user());

commit;
