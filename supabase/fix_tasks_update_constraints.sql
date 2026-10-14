-- P1: ограничения UPDATE задач —
-- created_by неизменяем, перенос только внутри доски,
-- assignee только из участников доски.

create or replace function public.enforce_task_update_rules()
returns trigger
language plpgsql
as $$
declare
  v_old_board_id uuid;
  v_new_board_id uuid;
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'Поле created_by нельзя изменять.';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Поле created_at нельзя изменять.';
  end if;

  select columns.board_id
  into v_old_board_id
  from columns
  where columns.id = old.column_id;

  select columns.board_id
  into v_new_board_id
  from columns
  where columns.id = new.column_id;

  if v_old_board_id is null or v_new_board_id is null then
    raise exception 'Колонка задачи не найдена.';
  end if;

  if v_old_board_id <> v_new_board_id then
    raise exception 'Нельзя переносить задачу на другую доску.';
  end if;

  if new.assignee_id is not null
     and not exists (
       select 1
       from board_members
       where board_members.board_id = v_new_board_id
         and board_members.user_id = new.assignee_id
     )
  then
    raise exception 'Исполнитель должен быть участником доски.';
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_enforce_update_rules on tasks;
create trigger tasks_enforce_update_rules
  before update on tasks
  for each row
  execute function public.enforce_task_update_rules();

-- INSERT: assignee тоже только участник доски (если указан).
create or replace function public.enforce_task_insert_rules()
returns trigger
language plpgsql
as $$
declare
  v_board_id uuid;
begin
  if new.created_by <> auth.uid() then
    raise exception 'created_by должен совпадать с текущим пользователем.';
  end if;

  select columns.board_id
  into v_board_id
  from columns
  where columns.id = new.column_id;

  if v_board_id is null then
    raise exception 'Колонка задачи не найдена.';
  end if;

  if new.assignee_id is not null
     and not exists (
       select 1
       from board_members
       where board_members.board_id = v_board_id
         and board_members.user_id = new.assignee_id
     )
  then
    raise exception 'Исполнитель должен быть участником доски.';
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_enforce_insert_rules on tasks;
create trigger tasks_enforce_insert_rules
  before insert on tasks
  for each row
  execute function public.enforce_task_insert_rules();
