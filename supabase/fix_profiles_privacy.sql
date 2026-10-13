-- ---------------------------------------------------------------------------
-- 1) SELECT: свой профиль ИЛИ коллеги по общей доске (не все authenticated).
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can view profiles" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Board colleagues can view profiles" on profiles;

create policy "Users can view own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Board colleagues can view profiles"
  on profiles for select
  to authenticated
  using (
    exists (
      select 1
      from board_members as me
      join board_members as them
        on them.board_id = me.board_id
      where me.user_id = auth.uid()
        and them.user_id = profiles.id
    )
  );

-- ---------------------------------------------------------------------------
-- 2) Email только из Auth: клиент не может менять profiles.email.
--    Синхронизация из auth.users через security definer + session flag.
-- ---------------------------------------------------------------------------
create or replace function public.prevent_profile_email_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
     and new.email is distinct from old.email
     and coalesce(current_setting('app.allow_profile_email_sync', true), 'off') <> 'on'
  then
    raise exception 'Email можно менять только через Auth.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_email_change on profiles;
create trigger profiles_prevent_email_change
  before update on profiles
  for each row
  execute function public.prevent_profile_email_change();

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_name text;
begin
  v_email := nullif(lower(trim(coalesce(new.email, ''))), '');
  v_name := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data->>'name', '')), ''),
    v_email,
    'Пользователь'
  );

  perform set_config('app.allow_profile_email_sync', 'on', true);

  insert into public.profiles (id, name, email)
  values (new.id, v_name, v_email)
  on conflict (id) do update
    set email = excluded.email
    where public.profiles.email is distinct from excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_auth_user_profile();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_auth_user_profile();

-- ---------------------------------------------------------------------------
-- 3) RPC приглашения: owner only, lookup в auth.users, роль только member.
-- ---------------------------------------------------------------------------
create or replace function public.invite_board_member(
  p_board_id uuid,
  p_email text
)
returns table (
  id uuid,
  board_id uuid,
  user_id uuid,
  role text,
  name text,
  avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_user_id uuid;
  v_member_id uuid;
  v_role text;
  v_name text;
  v_avatar text;
begin
  if auth.uid() is null then
    raise exception 'Необходимо войти в аккаунт.';
  end if;

  v_email := nullif(lower(trim(coalesce(p_email, ''))), '');

  if v_email is null then
    raise exception 'Введите email.';
  end if;

  if not exists (
    select 1
    from boards
    where boards.id = p_board_id
      and boards.owner_id = auth.uid()
  ) then
    raise exception 'Только владелец доски может приглашать участников.';
  end if;

  select au.id
  into v_user_id
  from auth.users as au
  where lower(au.email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'Пользователь с таким email не найден. Он должен сначала зарегистрироваться.';
  end if;

  if v_user_id = auth.uid() then
    raise exception 'Нельзя пригласить самого себя.';
  end if;

  if exists (
    select 1
    from board_members
    where board_members.board_id = p_board_id
      and board_members.user_id = v_user_id
  ) then
    raise exception 'Этот пользователь уже участник доски.';
  end if;

  insert into board_members (board_id, user_id, role)
  values (p_board_id, v_user_id, 'member')
  returning board_members.id, board_members.role
  into v_member_id, v_role;

  select profiles.name, profiles.avatar_url
  into v_name, v_avatar
  from profiles
  where profiles.id = v_user_id;

  return query
  select
    v_member_id,
    p_board_id,
    v_user_id,
    v_role,
    v_name,
    v_avatar;
end;
$$;

revoke all on function public.invite_board_member(uuid, text) from public;
grant execute on function public.invite_board_member(uuid, text) to authenticated;

-- INSERT: владелец доски может добавить себя как owner (создание доски)
-- или другого пользователя только как member.
drop policy if exists "Owners can add board members" on board_members;
create policy "Owners can add board members"
  on board_members for insert
  with check (
    exists (
      select 1
      from boards
      where boards.id = board_id
        and boards.owner_id = auth.uid()
    )
    and (
      (role = 'owner' and user_id = auth.uid())
      or role = 'member'
    )
  );
