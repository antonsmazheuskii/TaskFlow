-- Если таблица tasks уже создана без этих полей — выполнить в SQL Editor.

alter table tasks
  add column if not exists description text;

alter table tasks
  add column if not exists priority text default 'medium';

alter table tasks
  add column if not exists due_date date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_priority_check'
  ) then
    alter table tasks
      add constraint tasks_priority_check
      check (priority in ('low', 'medium', 'high'));
  end if;
end $$;
