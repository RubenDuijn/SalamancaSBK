# Admin SQL Playbook

Copy-friendly SQL blocks for the Salamanca SBK admin/member setup.

## 1) Quick Unblock (RLS issue in profiles)
Use this when admin page says profile/style inserts are blocked by policy.

```sql
begin;

drop policy if exists profiles_insert_admin_only on public.profiles;
create policy profiles_insert_admin_or_owner_member
  on public.profiles
  for insert
  to authenticated
  with check (
    public.is_admin_user()
    or (
      auth.uid() = id
      and coalesce(role, 'member') = 'member'
    )
  );

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id or public.is_admin_user())
  with check (
    public.is_admin_user()
    or (
      auth.uid() = id
      and coalesce(role, 'member') = 'member'
    )
  );

drop policy if exists student_style_levels_insert_admin_only on public.student_style_levels;
create policy student_style_levels_insert_admin_or_owner
  on public.student_style_levels
  for insert
  to authenticated
  with check (
    public.is_admin_user()
    or auth.uid() = student_id
  );

drop policy if exists student_style_levels_update_admin_only on public.student_style_levels;
create policy student_style_levels_update_admin_or_owner
  on public.student_style_levels
  for update
  to authenticated
  using (
    public.is_admin_user()
    or auth.uid() = student_id
  )
  with check (
    public.is_admin_user()
    or auth.uid() = student_id
  );

commit;
```

## 2) Admin User Setup (after creating auth user in Supabase UI)
Create the auth user in Authentication -> Users first, then run:

```sql
begin;

alter table public.profiles
  add column if not exists role text not null default 'member';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('member', 'admin'));

create table if not exists public.student_style_levels (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  style_key text not null,
  level_slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists student_style_levels_student_style_ux
  on public.student_style_levels(student_id, style_key);

do $$
declare
  v_user_id uuid;
  v_email text;
begin
  select id, email
  into v_user_id, v_email
  from auth.users
  where lower(email) = lower('SalamancaSBK@gmail.com')
  limit 1;

  if v_user_id is null then
    raise exception 'No auth user found for SalamancaSBK@gmail.com. Create it first in Authentication > Users.';
  end if;

  insert into public.profiles (id, full_name, email, level, role)
  values (v_user_id, 'Admin', coalesce(v_email, 'SalamancaSBK@gmail.com'), 'advanced_3', 'admin')
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    level = excluded.level,
    role = excluded.role;

  insert into public.student_style_levels (student_id, style_key, level_slug)
  values
    (v_user_id, 'salsa', 'advanced_2'),
    (v_user_id, 'bachata', 'advanced_1'),
    (v_user_id, 'kizomba', 'intermediate_3'),
    (v_user_id, 'tango', 'intermediate_2'),
    (v_user_id, 'zouk', 'intermediate_1'),
    (v_user_id, 'forro', 'beginner')
  on conflict (student_id, style_key) do update set
    level_slug = excluded.level_slug,
    updated_at = now();
end $$;

commit;
```

## 3) Long-Term Setup Recommendation
Use SQL quick unblock now for speed.
Then move student creation to a server-side function (service role) and tighten policies back to admin-only writes.
