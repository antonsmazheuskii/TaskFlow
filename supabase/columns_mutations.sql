-- Политики update/delete для колонок.
-- Выполнить, если columns.sql уже был применён ранее без этих политик.

drop policy if exists "Members can update columns" on columns;
create policy "Members can update columns"
  on columns for update
  using (
    board_id in (select board_id from board_members where user_id = auth.uid())
  )
  with check (
    board_id in (select board_id from board_members where user_id = auth.uid())
  );

drop policy if exists "Members can delete columns" on columns;
create policy "Members can delete columns"
  on columns for delete
  using (
    board_id in (select board_id from board_members where user_id = auth.uid())
  );
