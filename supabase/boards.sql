-- Таблицы boards и board_members для списка «моих досок».
-- Выполнить в SQL Editor проекта Supabase.

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

create policy "Users can view their boards"
  on boards for select
  using (
    id in (select board_id from board_members where user_id = auth.uid())
  );

create policy "Users can view their board memberships"
  on board_members for select
  using (user_id = auth.uid());
