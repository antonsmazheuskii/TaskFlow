-- Таблица tasks + политики select/insert для участников доски.
-- Выполнить в SQL Editor после columns.sql

create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  column_id   uuid not null references columns(id) on delete cascade,
  title       text not null,
  description text,
  priority    text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date    date,
  assignee_id uuid references auth.users(id),
  position    integer not null default 0,
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz default now()
);

alter table tasks enable row level security;

drop policy if exists "Members can view tasks" on tasks;
create policy "Members can view tasks"
  on tasks for select
  using (
    column_id in (
      select columns.id
      from columns
      join board_members on board_members.board_id = columns.board_id
      where board_members.user_id = auth.uid()
    )
  );

drop policy if exists "Members can create tasks" on tasks;
create policy "Members can create tasks"
  on tasks for insert
  with check (
    created_by = auth.uid()
    and column_id in (
      select columns.id
      from columns
      join board_members on board_members.board_id = columns.board_id
      where board_members.user_id = auth.uid()
    )
  );
