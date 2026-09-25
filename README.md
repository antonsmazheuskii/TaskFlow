# TaskFlow

Визуальный таск-трекер-приложение для управления задачами (Jira-lite) на React, TypeScript и Supabase: доски, колонки, drag-and-drop, realtime, совместный доступ и профили.

**Стек:** React 19 · Vite · TypeScript · Supabase (Auth, Postgres, RLS, Realtime) · React Router · @dnd-kit · Tailwind CSS

## Демо

- Приложение: _добавить ссылку на Vercel после деплоя_
- Репозиторий: https://github.com/antonsmazheuskii/TaskFlow

Тестовый пользователь (после деплоя / в своём проекте Supabase): зарегистрируйтесь через UI или создайте пользователя в Supabase Auth → Users.

## Запуск

```bash
git clone https://github.com/antonsmazheuskii/TaskFlow.git
cd TaskFlow
npm install
cp .env.example .env   # заполнить ключи Supabase
npm run dev
```

Откройте `http://localhost:5173`.

### Переменные окружения

Скопируйте `.env.example` в `.env` и укажите значения из Supabase → Project Settings → API:

| Переменная | Описание |
| --- | --- |
| `VITE_SUPABASE_URL` | URL проекта (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | публичный `anon` / `publishable` key |

Не коммитьте `.env` с реальными ключами.

## Реализованные уровни

| Уровень | Статус |
| --- | --- |
| **1. MVP** | Полностью |
| **2. Полный функционал** | Полностью |
| **3. Бонус** | Частично (системная тёмная тема через `prefers-color-scheme`) |

### Уровень 1 — MVP

- Регистрация / вход / выход (Supabase Auth), защита роутов
- Список досок, создание, удаление, переход на доску
- Колонки по умолчанию (To Do / In Progress / Done), CRUD колонок
- Задачи: создание, удаление, DnD между колонками и внутри колонки
- Адаптивный UI, навигация, скелетоны / спиннеры, toast-уведомления об ошибках

### Уровень 2 — полный функционал

- Модалка задачи: название, описание, приоритет, дедлайн, assignee
- Комментарии: список, добавление / удаление, автор и время
- Realtime: обновление колонок и задач без перезагрузки
- Приглашение по email, роли owner / member, управление участниками и удаление доски owner’ом
- Профиль: имя, аватар (URL), отображение аватаров на карточках и в комментариях

### Уровень 3 — бонус

Сделано:

- Тёмная тема по системным настройкам ОС (Tailwind `dark:`)

Не сделано (см. ниже).

## Что улучшить при наличии времени

- Загрузка аватара и вложений в Supabase Storage (сейчас аватар — URL)
- Фильтры и поиск задач, лог активности на доске
- Переключатель light/dark в UI, Google OAuth
- Горячие клавиши (N — новая задача, Esc — закрыть модалку)
- Тесты ключевых хуков и сервисов

## Скрипты

```bash
npm run dev      # разработка
npm run build    # production-сборка
npm run preview  # просмотр сборки
npm run lint     # oxlint
```
