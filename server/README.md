# Task Tracker API

Сервер для фронтенда таск-трекера. Регистрация, логин (JWT), CRUD задач. **Данные хранятся в PostgreSQL.**

## Требования

- Node.js 18+
- PostgreSQL 14+ (локально или облако)

## Подготовка БД

1. Установите PostgreSQL и создайте базу:

```bash
createdb task_tracker
```

2. (Опционально) Создайте пользователя и выдайте права на базу.

## Настройка

1. Скопируйте пример переменных окружения:

```bash
cp .env.example .env
```

2. Отредактируйте `.env` и укажите строку подключения к PostgreSQL:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/task_tracker
```

Пример для локального PostgreSQL с пользователем `postgres` и паролем `postgres`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_tracker
```

## Запуск

```bash
cd server
npm install
npm start
```

При первом запуске сервер сам создаёт таблицы `users` и `tasks` (файл `schema.sql`). API доступен по адресу: `http://localhost:3000/api`

Для разработки с автоперезапуском: `npm run dev`

## Переменные окружения

| Переменная      | Описание |
|-----------------|----------|
| `DATABASE_URL`  | Строка подключения к PostgreSQL (обязательно) |
| `PORT`          | Порт сервера (по умолчанию 3000) |
| `JWT_SECRET`    | Секрет для подписи JWT (в проде обязательно сменить) |

## Эндпоинты

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/auth/me` — текущий пользователь (Bearer token)
- `GET /api/tasks` — список задач
- `POST /api/tasks` — создать задачу
- `PATCH /api/tasks/:id` — обновить задачу
- `DELETE /api/tasks/:id` — удалить задачу
- `PATCH /api/tasks/reorder` — изменить порядок (body: `{ order: ["id1","id2",...] }`)

## Схема БД

- **users** — id (UUID), email, name, password_hash, created_at
- **tasks** — id (UUID), user_id (FK), title, description, status, priority, deadline, order, created_at, updated_at

Файл `schema.sql` можно выполнить вручную или дать серверу создать таблицы при старте.
