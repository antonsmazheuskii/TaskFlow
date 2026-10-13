-- Роли: только owner меняет колонки. Members — задачи (уже покрыто политиками tasks).

create or replace function public.is_board_owner(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from boards
    where id = p_board_id
      and owner_id = auth.uid()
  );
$$;

revoke all on function public.is_board_owner(uuid) from public;
grant execute on function public.is_board_owner(uuid) to authenticated;

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
