-- Исправление RLS: владелец всегда видит свои доски.
-- Без этого INSERT ... RETURNING и проверка при добавлении в board_members падают.

drop policy if exists "Users can view their boards" on boards;
create policy "Users can view their boards"
  on boards for select
  using (
    owner_id = auth.uid()
    or id in (select board_id from board_members where user_id = auth.uid())
  );
