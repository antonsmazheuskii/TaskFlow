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
grant select, insert, update         on table public.profiles      to authenticated;

grant all on table public.boards        to service_role;
grant all on table public.board_members to service_role;
grant all on table public.columns       to service_role;
grant all on table public.tasks         to service_role;
grant all on table public.comments      to service_role;
grant all on table public.profiles      to service_role;

-- RPC доступны только авторизованным.
revoke all on function public.is_board_member(uuid)                       from public;
revoke all on function public.is_board_owner(uuid)                        from public;
revoke all on function public.invite_board_member(uuid, text)             from public;
revoke all on function public.reorder_tasks_in_column(uuid, uuid[])       from public;
revoke all on function public.move_task_to_column(uuid, uuid, integer)    from public;
revoke all on function public.create_board_with_defaults(text)            from public;

grant execute on function public.is_board_member(uuid)                    to authenticated;
grant execute on function public.is_board_owner(uuid)                     to authenticated;
grant execute on function public.invite_board_member(uuid, text)          to authenticated;
grant execute on function public.reorder_tasks_in_column(uuid, uuid[])    to authenticated;
grant execute on function public.move_task_to_column(uuid, uuid, integer) to authenticated;
grant execute on function public.create_board_with_defaults(text)         to authenticated;
