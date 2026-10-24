-- 21. P1: email не читается из profiles клиентом.
-- RLS ограничивает строки, но не колонки: коллеги по доске могли выбрать
-- profiles.email через REST. Переходим на column-level privileges —
-- authenticated видит/пишет только id, name, avatar_url.
-- Поиск по email остаётся только внутри security definer RPC invite_board_member
-- (lookup в auth.users). Синхронизация profiles.email из auth.users — триггером
-- от имени владельца, клиентские права на колонку не нужны.

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

grant select (id, name, avatar_url) on table public.profiles to authenticated;
grant insert (id, name, avatar_url) on table public.profiles to authenticated;
grant update (name, avatar_url)     on table public.profiles to authenticated;

grant all on table public.profiles to service_role;
