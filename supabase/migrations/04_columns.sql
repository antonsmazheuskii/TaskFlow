-- 04. Таблица columns + политики CRUD для участников доски.
-- Выполнить после 01_boards.sql (нужна is_board_member).

create table if not exists columns (
  id        uuid primary key default gen_random_uuid(),
  board_id  uuid not null references boards(id) on delete cascade,
  title     text not null,
  position  integer not null default 0
);

alter table columns enable row level security;

revoke all on table columns from anon;
grant select, insert, update, delete on table columns to authenticated;
grant all on table columns to service_role;

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

drop policy if exists "Members can update columns" on columns;
create policy "Members can update columns"
  on columns for update
  using (
    board_id in (select board_id from board_members where user_id = auth.uid())
  )
  with check (
    board_id in (select board_id from board_members where user_id = auth.uid())
  );

drop policy if exists "Members can delete columns" on columns;
create policy "Members can delete columns"
  on columns for delete
  using (
    board_id in (select board_id from board_members where user_id = auth.uid())
  );
