-- Политики создания и удаления досок.
-- Выполнить в SQL Editor после supabase/boards.sql

drop policy if exists "Users can create boards" on boards;
create policy "Users can create boards"
  on boards for insert
  with check (owner_id = auth.uid());

drop policy if exists "Owner can delete board" on boards;
create policy "Owner can delete board"
  on boards for delete
  using (owner_id = auth.uid());

drop policy if exists "Users can add themselves as board members" on board_members;
create policy "Users can add themselves as board members"
  on board_members for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from boards
      where boards.id = board_id
        and boards.owner_id = auth.uid()
    )
  );
