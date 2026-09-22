-- Email в profiles для приглашений + политика invite для owner.

alter table profiles
  add column if not exists email text;

create unique index if not exists profiles_email_unique
  on profiles (lower(email))
  where email is not null;

drop policy if exists "Users can add themselves as board members" on board_members;
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
  );
