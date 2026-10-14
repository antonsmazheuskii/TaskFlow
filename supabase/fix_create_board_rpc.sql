-- P1: атомарное создание доски + owner membership + колонки по умолчанию.

create or replace function public.create_board_with_defaults(p_title text)
returns table (
  id uuid,
  title text,
  owner_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_title text;
  v_board_id uuid;
  v_board_title text;
  v_board_owner uuid;
  v_board_created timestamptz;
begin
  if v_user_id is null then
    raise exception 'Необходимо войти в аккаунт.';
  end if;

  v_title := nullif(trim(coalesce(p_title, '')), '');

  if v_title is null then
    raise exception 'Введите название доски.';
  end if;

  insert into boards (title, owner_id)
  values (v_title, v_user_id)
  returning boards.id, boards.title, boards.owner_id, boards.created_at
  into v_board_id, v_board_title, v_board_owner, v_board_created;

  insert into board_members (board_id, user_id, role)
  values (v_board_id, v_user_id, 'owner');

  insert into columns (board_id, title, position)
  values
    (v_board_id, 'To Do', 0),
    (v_board_id, 'In Progress', 1),
    (v_board_id, 'Done', 2);

  return query
  select v_board_id, v_board_title, v_board_owner, v_board_created;
end;
$$;

revoke all on function public.create_board_with_defaults(text) from public;
grant execute on function public.create_board_with_defaults(text) to authenticated;
