-- 09. Комментарии к задачам + RLS для участников доски.
-- Выполнить после 06_tasks.sql. is_board_member объявлена в 01_boards.sql.

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references tasks(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

alter table comments enable row level security;

revoke all on table comments from anon;
grant select, insert, delete on table comments to authenticated;
grant all on table comments to service_role;

drop policy if exists "Members can view comments" on comments;
create policy "Members can view comments"
  on comments for select
  using (
    task_id in (
      select tasks.id
      from tasks
      join columns on columns.id = tasks.column_id
      where public.is_board_member(columns.board_id)
    )
  );

drop policy if exists "Members can create comments" on comments;
create policy "Members can create comments"
  on comments for insert
  with check (
    user_id = auth.uid()
    and task_id in (
      select tasks.id
      from tasks
      join columns on columns.id = tasks.column_id
      where public.is_board_member(columns.board_id)
    )
  );

drop policy if exists "Authors can delete own comments" on comments;
create policy "Authors can delete own comments"
  on comments for delete
  using (
    user_id = auth.uid()
    and task_id in (
      select tasks.id
      from tasks
      join columns on columns.id = tasks.column_id
      where public.is_board_member(columns.board_id)
    )
  );
