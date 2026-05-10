-- Attendance RLS delete fix
-- Run this in Supabase SQL Editor for project txansvfngkjtbbdmvgtw.
-- Goal: allow authenticated users to delete only their own attendance rows.

begin;

-- Ensure RLS is enabled (safe if already enabled)
alter table if exists public.attendance enable row level security;

-- Helpful read policy (only if missing)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'attendance'
      and policyname = 'attendance_select_own'
  ) then
    create policy attendance_select_own
      on public.attendance
      for select
      to authenticated
      using (student_id = auth.uid());
  end if;
end $$;

-- Helpful insert policy (only if missing)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'attendance'
      and policyname = 'attendance_insert_own'
  ) then
    create policy attendance_insert_own
      on public.attendance
      for insert
      to authenticated
      with check (student_id = auth.uid());
  end if;
end $$;

-- Critical delete policy (only if missing)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'attendance'
      and policyname = 'attendance_delete_own'
  ) then
    create policy attendance_delete_own
      on public.attendance
      for delete
      to authenticated
      using (student_id = auth.uid());
  end if;
end $$;

commit;

-- Optional verification
-- select policyname, cmd, roles, qual, with_check
-- from pg_policies
-- where schemaname = 'public' and tablename = 'attendance'
-- order by policyname;
