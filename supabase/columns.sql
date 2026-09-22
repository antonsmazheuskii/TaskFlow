-- Таблица columns + политики select/insert для участников доски.
-- Выполнить в SQL Editor после boards.sql / boards_mutations.sql

create table if not exists columns (
  id        uuid primary key default gen_random_uuid(),
  board_id  uuid not null references boards(id) on delete cascade,
  title     text not null,
  position  integer not null default 0
);

alter table columns enable row level security;

drop policy if exists "Members can view columns" on columns;
create policy "Members can view columns"
  on columns for select
  using (
    board_id in (select board_id from board_members where user_id = auth.uid())
  );

drop policy if exists "Members can create columns" on columns;
create policy "Members can create columns"
  on columns for insert
  with check (
    board_id in (select board_id from board_members where user_id = auth.uid())
  );
