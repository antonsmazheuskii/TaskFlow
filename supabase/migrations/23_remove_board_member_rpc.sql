-- 23. P1: атомарное удаление участника доски.
-- Раньше клиент делал 3 запроса (select member → update tasks → delete member);
-- сбой между ними оставлял задачи с assignee вне доски. Теперь одна транзакция
-- в security definer RPC: проверка owner, обнуление assignee_id, удаление членства.

create or replace function public.remove_board_member(
  p_board_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Необходимо войти в аккаунт.';
  end if;

  if not public.is_board_owner(p_board_id) then
    raise exception 'Только владелец доски может удалять участников.';
  end if;

  -- Сериализация с move/reorder задач той же доски.
  perform pg_advisory_xact_lock(hashtext(p_board_id::text));

  select board_members.role
  into v_role
  from board_members
  where board_members.board_id = p_board_id
    and board_members.user_id = p_user_id
  for update;

  if v_role is null then
    raise exception 'Участник не найден.';
  end if;

  if v_role = 'owner' then
    raise exception 'Нельзя удалить владельца доски.';
  end if;

  update tasks
  set assignee_id = null
  where assignee_id = p_user_id
    and column_id in (
      select columns.id
      from columns
      where columns.board_id = p_board_id
    );

  delete from board_members
  where board_members.board_id = p_board_id
    and board_members.user_id = p_user_id;
end;
$$;

revoke all on function public.remove_board_member(uuid, uuid) from public;
grant execute on function public.remove_board_member(uuid, uuid) to authenticated;

-- Прямой DELETE из board_members клиенту больше не нужен — только через RPC.
drop policy if exists "Owners can remove board members" on board_members;
