-- P0 №3: полный old-record в Realtime DELETE (иначе в payload только id).
-- Выполнить в SQL Editor.

alter table public.columns replica identity full;
alter table public.tasks replica identity full;
