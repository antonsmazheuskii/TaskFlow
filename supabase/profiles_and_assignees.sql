-- Профили + политики для выбора исполнителя.
-- Функция is_board_member нужна, чтобы участники видели друг друга без RLS-рекурсии.

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  avatar_url text
);

alter table profiles enable row level security;

drop policy if exists "Authenticated users can view profiles" on profiles;
create policy "Authenticated users can view profiles"
  on profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

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

drop policy if exists "Users can view their board memberships" on board_members;
drop policy if exists "Members can view fellow board members" on board_members;
create policy "Members can view fellow board members"
  on board_members for select
  using (public.is_board_member(board_id));
