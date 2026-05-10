-- Attendance duplicate cleanup (safe across schema variants)
-- Run this once in Supabase SQL editor.
-- Keeps the lowest id in each duplicate group and deletes the rest.

-- Optional: preview potential duplicates before deleting.
-- Run one of these blocks first if you want to inspect the exact rows.
-- The preview uses the same duplicate key as the delete step.
--
-- If both time columns exist:
-- select student_id, figure_id, figure_name, class_date, coalesce(class_time::text, session_time::text, '') as time_key, count(*)
-- from public.attendance
-- group by student_id, figure_id, figure_name, class_date, coalesce(class_time::text, session_time::text, '')
-- having count(*) > 1
-- order by count(*) desc, class_date desc;
--
-- If only class_time exists:
-- select student_id, figure_id, figure_name, class_date, coalesce(class_time::text, '') as time_key, count(*)
-- from public.attendance
-- group by student_id, figure_id, figure_name, class_date, coalesce(class_time::text, '')
-- having count(*) > 1
-- order by count(*) desc, class_date desc;
--
-- If only session_time exists:
-- select student_id, figure_id, figure_name, class_date, coalesce(session_time::text, '') as time_key, count(*)
-- from public.attendance
-- group by student_id, figure_id, figure_name, class_date, coalesce(session_time::text, '')
-- having count(*) > 1
-- order by count(*) desc, class_date desc;
--
-- If neither time column exists:
-- select student_id, figure_id, figure_name, class_date, count(*)
-- from public.attendance
-- group by student_id, figure_id, figure_name, class_date
-- having count(*) > 1
-- order by count(*) desc, class_date desc;

do $$
declare
  has_class_time boolean;
  has_session_time boolean;
  time_expr text;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance'
      and column_name = 'class_time'
  ) into has_class_time;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance'
      and column_name = 'session_time'
  ) into has_session_time;

  if has_class_time and has_session_time then
    time_expr := 'coalesce(class_time::text, session_time::text, '''')';
  elsif has_class_time then
    time_expr := 'coalesce(class_time::text, '''')';
  elsif has_session_time then
    time_expr := 'coalesce(session_time::text, '''')';
  else
    time_expr := '''''';
  end if;

  execute format($sql$
    with source_rows as (
      select
        id,
        student_id,
        figure_id,
        figure_name,
        class_date,
        %s as time_key
      from public.attendance
    ),
    ranked as (
      select
        id,
        row_number() over (
          partition by student_id, figure_id, figure_name, class_date, time_key
          order by id
        ) as rn
      from source_rows
    )
    delete from public.attendance a
    using ranked r
    where a.id = r.id
      and r.rn > 1;
  $sql$, time_expr);
end $$;

-- Optional: remove old attendance rows for everyone
-- delete from public.attendance
-- where class_date < current_date;

-- Optional: remove old attendance rows for one student only
-- replace <STUDENT_UUID> with the student's id
-- delete from public.attendance
-- where student_id = '<STUDENT_UUID>'
--   and class_date < current_date;

-- Optional: remove ALL attendance rows for everyone (full reset)
-- delete from public.attendance;

-- Optional: remove ALL attendance rows for one student (full reset)
-- replace <STUDENT_UUID> with the student's id
-- delete from public.attendance
-- where student_id = '<STUDENT_UUID>';

-- Optional: quick check after cleanup
-- select count(*) as remaining_rows from public.attendance;
