-- 22. P1: позиция задач и колонок вычисляется на сервере.
-- Раньше клиент читал max(position) и вставлял max+1 — при конкурентных
-- запросах возникали дубликаты position. Теперь BEFORE INSERT триггер под
-- advisory-lock контейнера (column_id / board_id) назначает position = max+1,
-- а отложенный UNIQUE-констрейнт гарантирует отсутствие дублей на коммите
-- (reorder/move обновляют позиции в цикле внутри одной транзакции).

-- ---------------------------------------------------------------------------
-- 1) Нормализация уже существующих данных (дубли → плотная нумерация 0..n-1).
-- ---------------------------------------------------------------------------
with ranked as (
  select
    id,
    row_number() over (
      partition by column_id
      order by position, created_at, id
    ) - 1 as new_position
  from public.tasks
)
update public.tasks as t
set position = ranked.new_position
from ranked
where ranked.id = t.id
  and t.position is distinct from ranked.new_position;

with ranked as (
  select
    id,
    row_number() over (
      partition by board_id
      order by position, id
    ) - 1 as new_position
  from public.columns
)
update public.columns as c
set position = ranked.new_position
from ranked
where ranked.id = c.id
  and c.position is distinct from ranked.new_position;

-- ---------------------------------------------------------------------------
-- 2) Триггеры назначения позиции при INSERT (значение клиента игнорируется).
-- ---------------------------------------------------------------------------
create or replace function public.assign_task_position()
returns trigger
language plpgsql
as $$
begin
  perform pg_advisory_xact_lock(hashtext('tasks:' || new.column_id::text));

  select coalesce(max(position), -1) + 1
  into new.position
  from public.tasks
  where column_id = new.column_id;

  return new;
end;
$$;

drop trigger if exists tasks_assign_position on public.tasks;
create trigger tasks_assign_position
  before insert on public.tasks
  for each row
  execute function public.assign_task_position();

create or replace function public.assign_column_position()
returns trigger
language plpgsql
as $$
begin
  perform pg_advisory_xact_lock(hashtext('columns:' || new.board_id::text));

  select coalesce(max(position), -1) + 1
  into new.position
  from public.columns
  where board_id = new.board_id;

  return new;
end;
$$;

drop trigger if exists columns_assign_position on public.columns;
create trigger columns_assign_position
  before insert on public.columns
  for each row
  execute function public.assign_column_position();

-- ---------------------------------------------------------------------------
-- 3) Отложенные UNIQUE-констрейнты: проверка на коммите, чтобы переупорядочивание
--    в цикле (reorder_tasks_in_column / move_task_to_column) не падало на
--    промежуточных состояниях.
-- ---------------------------------------------------------------------------
alter table public.tasks
  drop constraint if exists tasks_column_position_unique;
alter table public.tasks
  add constraint tasks_column_position_unique
  unique (column_id, position)
  deferrable initially deferred;

alter table public.columns
  drop constraint if exists columns_board_position_unique;
alter table public.columns
  add constraint columns_board_position_unique
  unique (board_id, position)
  deferrable initially deferred;
