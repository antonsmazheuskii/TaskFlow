# Supabase: установка с нуля

Выполняйте файлы из этой папки **по порядку** в SQL Editor (сверху вниз).  
Каждый файл — отдельный Run. Ошибки вида «already exists» / «already member of publication» обычно безопасны.

| № | Файл | Назначение |
| --- | --- | --- |
| 01 | `01_boards.sql` | Таблицы `boards`, `board_members`, базовые RLS |
| 02 | `02_boards_mutations.sql` | Политики создания доски / участника |
| 03 | `03_fix_boards_select_policy.sql` | SELECT доски для owner + членства |
| 04 | `04_columns.sql` | Таблица `columns` + RLS |
| 05 | `05_columns_mutations.sql` | Мутации колонок |
| 06 | `06_tasks.sql` | Таблица `tasks` + RLS |
| 07 | `07_tasks_mutations.sql` | Update/delete задач |
| 08 | `08_tasks_details.sql` | Поля деталей задачи (если отдельно) |
| 09 | `09_comments.sql` | Комментарии + RLS |
| 10 | `10_profiles_and_assignees.sql` | `profiles`, `is_board_member` |
| 11 | `11_realtime.sql` | Publication Realtime для `columns`, `tasks` |
| 12 | `12_board_invites.sql` | Email в profiles, invite INSERT |
| 13 | `13_board_roles.sql` | Только owner меняет колонки |
| 14 | `14_board_member_management.sql` | Owner удаляет участников |
| 15 | `15_fix_profiles_privacy.sql` | RLS профилей, sync email, RPC invite |
| 16 | `16_fix_task_ordering.sql` | Атомарный move/reorder задач |
| 17 | `17_fix_realtime_replica_identity.sql` | `REPLICA IDENTITY FULL` для DELETE |
| 18 | `18_fix_tasks_update_constraints.sql` | created_by lock, same-board move, assignee ∈ members |
| 19 | `19_fix_create_board_rpc.sql` | Атомарное создание доски + owner + колонки |

## Realtime

После `11_realtime.sql` и `17_…`:

1. Database → Publications → `supabase_realtime` — таблицы `columns` и `tasks` включены.
2. Authentication → Providers → Email включён.

## Демо-пользователи

В Auth → Users создайте двух пользователей (или зарегистрируйте через UI):

| Роль | Email | Пароль |
| --- | --- | --- |
| Owner | `owner@taskflow.demo` | `TaskFlowOwner1!` |
| Member | `member@taskflow.demo` | `TaskFlowMember1!` |

Сценарий проверки:

1. Войти как owner → создать доску.
2. Пригласить `member@taskflow.demo` по email.
3. Войти как member → открыть доску, править задачи (колонки/инвайт недоступны).
