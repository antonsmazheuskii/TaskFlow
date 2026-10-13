-- P0 №2: атомарное перемещение и сортировка задач в одной транзакции.
-- Выполнить в SQL Editor после tasks.sql / tasks_mutations.sql.

create or replace function public.reorder_tasks_in_column(
  p_column_id uuid,
  p_ordered_task_ids uuid[]
)
returns setof tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_board_id uuid;
  v_expected_count integer;
  v_provided_count integer;
  v_matched_count integer;
  v_pos integer;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Необходимо войти в аккаунт.';
  end if;

  select columns.board_id
  into v_board_id
  from columns
  where columns.id = p_column_id;

  if v_board_id is null then
    raise exception 'Колонка не найдена.';
  end if;

  if not public.is_board_member(v_board_id) then
    raise exception 'Нет доступа к доске.';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_board_id::text));

  perform 1
  from tasks
  where column_id = p_column_id
  for update;

  select count(*)::integer
  into v_expected_count
  from tasks
  where column_id = p_column_id;

  v_provided_count := coalesce(cardinality(p_ordered_task_ids), 0);

  if v_provided_count <> v_expected_count then
    raise exception 'Список задач не совпадает с колонкой.';
  end if;

  select count(*)::integer
  into v_matched_count
  from tasks
  where column_id = p_column_id
    and id = any (p_ordered_task_ids);

  if v_matched_count <> v_expected_count then
    raise exception 'В списке есть задачи вне этой колонки.';
  end if;

  v_pos := 0;
  foreach v_id in array p_ordered_task_ids
  loop
    update tasks
    set
      column_id = p_column_id,
      position = v_pos
    where id = v_id;

    v_pos := v_pos + 1;
  end loop;

  return query
  select *
  from tasks
  where column_id = p_column_id
  order by position;
end;
$$;

create or replace function public.move_task_to_column(
  p_task_id uuid,
  p_target_column_id uuid,
  p_target_index integer default null
)
returns setof tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task tasks%rowtype;
  v_source_column_id uuid;
  v_source_board_id uuid;
  v_target_board_id uuid;
  v_old_ids uuid[];
  v_target_ids uuid[] := array[]::uuid[];
  v_insert_index integer;
  v_old_count integer;
  v_pos integer;
  v_id uuid;
  i integer;
begin
  if auth.uid() is null then
    raise exception 'Необходимо войти в аккаунт.';
  end if;

  select columns.board_id
  into v_target_board_id
  from columns
  where columns.id = p_target_column_id;

  if v_target_board_id is null then
    raise exception 'Целевая колонка не найдена.';
  end if;

  if not public.is_board_member(v_target_board_id) then
    raise exception 'Нет доступа к доске.';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_target_board_id::text));

  select t.*
  into v_task
  from tasks as t
  where t.id = p_task_id
  for update;

  if not found then
    raise exception 'Задача не найдена.';
  end if;

  v_source_column_id := v_task.column_id;

  select columns.board_id
  into v_source_board_id
  from columns
  where columns.id = v_source_column_id;

  if v_source_board_id is null or v_source_board_id <> v_target_board_id then
    raise exception 'Нельзя переносить задачу на другую доску.';
  end if;

  perform 1
  from tasks
  where column_id in (v_source_column_id, p_target_column_id)
  for update;

  if v_source_column_id = p_target_column_id then
    select coalesce(array_agg(id order by position), array[]::uuid[])
    into v_old_ids
    from tasks
    where column_id = p_target_column_id
      and id <> p_task_id;

    v_old_count := coalesce(cardinality(v_old_ids), 0);
    v_insert_index := coalesce(p_target_index, v_old_count);

    if v_insert_index < 0 then
      v_insert_index := 0;
    end if;

    if v_insert_index > v_old_count then
      v_insert_index := v_old_count;
    end if;

    for i in 1..v_old_count
    loop
      if i - 1 = v_insert_index then
        v_target_ids := array_append(v_target_ids, p_task_id);
      end if;

      v_target_ids := array_append(v_target_ids, v_old_ids[i]);
    end loop;

    if v_insert_index >= v_old_count then
      v_target_ids := array_append(v_target_ids, p_task_id);
    end if;

    return query
    select *
    from public.reorder_tasks_in_column(p_target_column_id, v_target_ids);

    return;
  end if;

  select coalesce(array_agg(id order by position), array[]::uuid[])
  into v_old_ids
  from tasks
  where column_id = p_target_column_id
    and id <> p_task_id;

  v_old_count := coalesce(cardinality(v_old_ids), 0);
  v_insert_index := coalesce(p_target_index, v_old_count);

  if v_insert_index < 0 then
    v_insert_index := 0;
  end if;

  if v_insert_index > v_old_count then
    v_insert_index := v_old_count;
  end if;

  for i in 1..v_old_count
  loop
    if i - 1 = v_insert_index then
      v_target_ids := array_append(v_target_ids, p_task_id);
    end if;

    v_target_ids := array_append(v_target_ids, v_old_ids[i]);
  end loop;

  if v_insert_index >= v_old_count then
    v_target_ids := array_append(v_target_ids, p_task_id);
  end if;

  v_pos := 0;
  foreach v_id in array v_target_ids
  loop
    update tasks
    set
      column_id = p_target_column_id,
      position = v_pos
    where id = v_id;

    v_pos := v_pos + 1;
  end loop;

  v_pos := 0;
  for v_id in
    select tasks.id
    from tasks
    where tasks.column_id = v_source_column_id
      and tasks.id <> p_task_id
    order by tasks.position
  loop
    update tasks
    set position = v_pos
    where id = v_id;

    v_pos := v_pos + 1;
  end loop;

  return query
  select *
  from tasks
  where column_id in (v_source_column_id, p_target_column_id)
  order by column_id, position;
end;
$$;

revoke all on function public.reorder_tasks_in_column(uuid, uuid[]) from public;
revoke all on function public.move_task_to_column(uuid, uuid, integer) from public;
grant execute on function public.reorder_tasks_in_column(uuid, uuid[]) to authenticated;
grant execute on function public.move_task_to_column(uuid, uuid, integer) to authenticated;
