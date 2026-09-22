-- Включить Realtime для таблиц доски.
-- Выполнить в SQL Editor. Если таблица уже в publication — будет ошибка, это нормально.

alter publication supabase_realtime add table columns;
alter publication supabase_realtime add table tasks;
