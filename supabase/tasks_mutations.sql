-- Политики update/delete для задач.
-- Выполнить после supabase/tasks.sql

drop policy if exists "Members can update tasks" on tasks;
create policy "Members can update tasks"
  on tasks for update
  using (
    column_id in (
      select columns.id
      from columns
      join board_members on board_members.board_id = columns.board_id
      where board_members.user_id = auth.uid()
    )
  )
  with check (
    column_id in (
      select columns.id
      from columns
      join board_members on board_members.board_id = columns.board_id
      where board_members.user_id = auth.uid()
    )
  );

drop policy if exists "Members can delete tasks" on tasks;
create policy "Members can delete tasks"
  on tasks for delete
  using (
    column_id in (
      select columns.id
      from columns
      join board_members on board_members.board_id = columns.board_id
      where board_members.user_id = auth.uid()
    )
  );
