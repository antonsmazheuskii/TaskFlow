-- 20. Повторное явное выставление привилегий клиентских ролей.
-- Для свежей установки GRANT уже содержатся в 01/04/06/09/10; этот файл —
-- идемпотентная сверка для проектов, где миграции 01–19 применялись раньше
-- без явных GRANT (Supabase больше не гарантирует их автоматически).

grant usage on schema public to anon, authenticated, service_role;

-- anon не имеет доступа к данным приложения: всё за авторизацией + RLS.
revoke all on table public.boards        from anon;
revoke all on table public.board_members from anon;
revoke all on table public.columns       from anon;
revoke all on table public.tasks         from anon;
revoke all on table public.comments      from anon;
revoke all on table public.profiles      from anon;

grant select, insert, update, delete on table public.boards        to authenticated;
grant select, insert, update, delete on table public.board_members to authenticated;
grant select, insert, update, delete on table public.columns       to authenticated;
grant select, insert, update, delete on table public.tasks         to authenticated;
grant select, insert, delete         on table public.comments      to authenticated;

-- profiles: только column-level (email недоступен клиенту, см. 21).
revoke all on table public.profiles from authenticated;
grant select (id, name, avatar_url) on table public.profiles to authenticated;
grant insert (id, name, avatar_url) on table public.profiles to authenticated;
grant update (name, avatar_url)     on table public.profiles to authenticated;

grant all on table public.boards        to service_role;
grant all on table public.board_members to service_role;
grant all on table public.columns       to service_role;
grant all on table public.tasks         to service_role;
grant all on table public.comments      to service_role;
grant all on table public.profiles      to service_role;

-- RPC доступны только авторизованным.
-- Функции могут отсутствовать, если соответствующая миграция ещё не применена —
-- тогда права выставит сама миграция; здесь пропускаем без ошибки.
do $$
declare
  v_signature text;
begin
  foreach v_signature in array array[
    'public.is_board_member(uuid)',
    'public.is_board_owner(uuid)',
    'public.invite_board_member(uuid, text)',
    'public.reorder_tasks_in_column(uuid, uuid[])',
    'public.move_task_to_column(uuid, uuid, integer)',
    'public.create_board_with_defaults(text)'
  ]
  loop
    if to_regprocedure(v_signature) is null then
      raise notice 'skip grants: function % does not exist', v_signature;
      continue;
    end if;

    execute format('revoke all on function %s from public', v_signature);
    execute format('grant execute on function %s to authenticated', v_signature);
  end loop;
end $$;
