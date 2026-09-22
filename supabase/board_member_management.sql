-- Owner может удалять участников (кроме роли owner).

drop policy if exists "Owners can remove board members" on board_members;
create policy "Owners can remove board members"
  on board_members for delete
  using (
    public.is_board_owner(board_id)
    and role = 'member'
  );
