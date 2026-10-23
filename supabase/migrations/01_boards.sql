-- 01. Схема доступа, таблицы boards / board_members, helper-функции RLS, базовые политики.
-- Порядок внутри файла важен: таблицы → функции (ссылаются на board_members) → политики.

-- ---------------------------------------------------------------------------
-- 0) Явные привилегии клиентских ролей на схему.
--    В новых проектах Supabase автоматических GRANT на объекты public нет.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 1) Таблицы.
-- ---------------------------------------------------------------------------
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

revoke all on table boards from anon;
revoke all on table board_members from anon;
grant select, insert, update, delete on table boards to authenticated;
grant select, insert, update, delete on table board_members to authenticated;
grant all on table boards to service_role;
grant all on table board_members to service_role;

-- ---------------------------------------------------------------------------
-- 2) Helper-функции для политик (security definer — без RLS-рекурсии).
--    Объявлены здесь, т.к. используются в 04, 06, 09, 10, 13, 14, 16, 18.
-- ---------------------------------------------------------------------------
create or replace function public.is_board_member(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from board_members
    where board_id = p_board_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_board_member(uuid) from public;
grant execute on function public.is_board_member(uuid) to authenticated;

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

-- ---------------------------------------------------------------------------
-- 3) Политики.
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view their boards" on boards;
create policy "Users can view their boards"
  on boards for select
  using (
    owner_id = auth.uid()
    or id in (select board_id from board_members where user_id = auth.uid())
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
drop policy if exists "Members can view fellow board members" on board_members;
create policy "Members can view fellow board members"
  on board_members for select
  using (public.is_board_member(board_id));

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
