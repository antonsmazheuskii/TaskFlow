-- 10. Профили + политики для выбора исполнителя.
-- is_board_member и SELECT-политика board_members объявлены в 01_boards.sql.

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  avatar_url text
);

alter table profiles enable row level security;

revoke all on table profiles from anon;
grant select, insert, update on table profiles to authenticated;
grant all on table profiles to service_role;

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
