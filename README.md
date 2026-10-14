# TaskFlow

Канбан-приложение для управления задачами (Jira-lite) на React, TypeScript и Supabase: доски, колонки, drag-and-drop, realtime, совместный доступ и профили.

**Стек:** React 19 · Vite · TypeScript (strict) · Supabase (Auth, Postgres, RLS, Realtime) · React Router · @dnd-kit · Tailwind CSS

## Демо

| | |
| --- | --- |
| **Приложение (Vercel)** | https://task-flow-gamma-umber.vercel.app |
| **Репозиторий** | https://github.com/antonsmazheuskii/TaskFlow |

### Демо-учётные записи

| Роль | Email | Пароль |
| --- | --- | --- |
| Owner | `owner@taskflow.demo` | `TaskFlowOwner1!` |
| Member | `member@taskflow.demo` | `TaskFlowMember1!` |

Учётки уже созданы в Supabase; на демо-доске `Demo Board` member приглашён. Вход — данными из таблицы выше.

## Локальный запуск

```bash
git clone https://github.com/antonsmazheuskii/TaskFlow.git
cd TaskFlow
npm install
cp .env.example .env   # заполнить ключи Supabase
npm run dev
```

Откройте `http://localhost:5173`.

### Переменные окружения

Скопируйте `.env.example` → `.env`. Значения: Supabase → Project Settings → API.

| Переменная | Описание |
| --- | --- |
| `VITE_SUPABASE_URL` | URL проекта (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | публичный `anon` key |

Реальные ключи в git не коммитить.

## Развёртывание Supabase с нуля

1. Создайте проект на [supabase.com](https://supabase.com).
2. Authentication → Providers → включите **Email**.
3. SQL Editor: выполните миграции из папки [`supabase/migrations/`](./supabase/migrations/) **строго по порядку** `01` → `19` (инструкция внутри [`supabase/migrations/README.md`](./supabase/migrations/README.md)).
4. Database → Publications: убедитесь, что `columns` и `tasks` в `supabase_realtime` (скрипты `11` и `17`).
5. Создайте демо-пользователей (таблица выше).
6. Вставьте `VITE_SUPABASE_*` в `.env` (локально) и в Environment Variables на Vercel (для деплоя).

Исходные SQL также лежат в `supabase/*.sql` (история разработки); для новой БД используйте только `supabase/migrations/`.

## Деплой на Vercel

```bash
npm i -g vercel
vercel login
vercel          # Preview
vercel --prod   # Production
```

В проекте Vercel добавьте:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

После деплоя сделайте Redeploy (Vite подставляет env на этапе build).  
В корень добавлен `vercel.json` (SPA rewrite на `index.html`).

Вставьте итоговый URL в секцию **Демо** этого README.

## Реализованные уровни

| Уровень | Статус |
| --- | --- |
| **1. MVP** | Полностью |
| **2. Полный функционал** | Полностью |
| **3. Бонус** | Частично (тёмная тема через `prefers-color-scheme`) |

### Уровень 1 — MVP

- Регистрация / вход / выход, защита роутов
- Доски: список, создание, удаление, переход
- Колонки по умолчанию + CRUD
- Задачи: создание, удаление, DnD
- Адаптивный UI, скелетоны, toast-ошибки

### Уровень 2 — полный функционал

- Детали задачи, комментарии, realtime
- Invite по email, роли owner/member, управление участниками
- Профиль (имя, аватар URL), аватары на карточках и в комментариях

### Уровень 3 — бонус

- Системная тёмная тема (`dark:`)

## Что улучшить при наличии времени

- Загрузка аватара/файлов в Storage
- Фильтры и поиск, activity log
- Переключатель темы, Google OAuth, хоткеи
## Скрипты

```bash
npm run dev        # разработка
npm run typecheck  # tsc strict
npm run test       # vitest (хуки boards/tasks)
npm run build      # tsc -b && vite build
npm run preview
npm run lint
```
