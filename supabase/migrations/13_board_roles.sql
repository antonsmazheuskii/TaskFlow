-- 13. Роли: только owner меняет колонки. Members — задачи (уже покрыто политиками tasks).
-- is_board_owner объявлена в 01_boards.sql.

drop policy if exists "Members can create columns" on columns;
drop policy if exists "Owners can create columns" on columns;
create policy "Owners can create columns"
  on columns for insert
  with check (public.is_board_owner(board_id));

drop policy if exists "Members can update columns" on columns;
drop policy if exists "Owners can update columns" on columns;
create policy "Owners can update columns"
  on columns for update
  using (public.is_board_owner(board_id))
  with check (public.is_board_owner(board_id));

drop policy if exists "Members can delete columns" on columns;
drop policy if exists "Owners can delete columns" on columns;
create policy "Owners can delete columns"
  on columns for delete
  using (public.is_board_owner(board_id));
