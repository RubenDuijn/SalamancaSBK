-- Attendance duplicate cleanup (safe across schema variants)
-- Run this once in Supabase SQL editor.

-- Optional: preview potential duplicates before deleting
-- (run this select first if you want a preview)
-- select student_id, figure_id, figure_name, class_date, count(*)
-- from public.attendance
-- group by student_id, figure_id, figure_name, class_date
-- having count(*) > 1
-- order by count(*) desc;

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
    with ranked as (
      select
        id,
        row_number() over (
          partition by student_id, figure_id, figure_name, class_date, %s
          order by id
        ) as rn
      from public.attendance
    )
    delete from public.attendance a
    using ranked r
    where a.id = r.id
      and r.rn > 1;
  $sql$, time_expr);
end $$;

-- Optional: quick check after cleanup
-- select count(*) as remaining_rows from public.attendance;
