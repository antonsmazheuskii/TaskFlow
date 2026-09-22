-- Таблицы boards и board_members + политики select/insert/delete.
-- Выполнить в SQL Editor проекта Supabase (для нового проекта — целиком).

create table if not exists boards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now()
);

create table if not exists board_members (
  id        uuid primary key default gen_random_uuid(),
  board_id  uuid not null references boards(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'member' check (role in ('owner', 'member')),
  unique(board_id, user_id)
);

alter table boards enable row level security;
alter table board_members enable row level security;

drop policy if exists "Users can view their boards" on boards;
create policy "Users can view their boards"
  on boards for select
  using (
    id in (select board_id from board_members where user_id = auth.uid())
  );

drop policy if exists "Users can create boards" on boards;
create policy "Users can create boards"
  on boards for insert
  with check (owner_id = auth.uid());

drop policy if exists "Owner can delete board" on boards;
create policy "Owner can delete board"
  on boards for delete
  using (owner_id = auth.uid());

drop policy if exists "Users can view their board memberships" on board_members;
create policy "Users can view their board memberships"
  on board_members for select
  using (user_id = auth.uid());

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
