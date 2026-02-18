# Task Tracker

Production-ready Angular 19 task tracker with auth, dashboard, and CRUD tasks. Built with standalone components, signals, and feature-based architecture.

## Requirements

- **Node.js** 18.19+ or 20.11+ (see `engines` in `package.json`)
- Backend API for auth and tasks (see API contract below)

## Quick start

```bash
npm install
npm start
```

Open http://localhost:4200.

**Чтобы логин и задачи работали**, запустите бэкенд в отдельном терминале:

```bash
cd server
npm install
npm start
```

API будет доступен на `http://localhost:3000/api`. Затем в приложении зарегистрируйтесь или войдите (любой email/пароль от 6 символов).

## Scripts

| Command   | Description        |
|----------|--------------------|
| `npm start` | Dev server        |
| `npm run build` | Production build |
| `npm test` | Unit tests (Karma) |
| `npm run e2e` | E2E (Protractor; run `npm start` in another terminal) |

## Project structure

```
src/app
├── core/                 # Singletons: services, interceptors, guards
│   ├── guards/           # authGuard, guestGuard (functional)
│   ├── interceptors/     # authTokenInterceptor, errorInterceptor (functional)
│   └── services/        # ThemeService, TokenService, ErrorHandlerService, LoadingService
├── shared/               # Reusable UI and utilities
│   └── pipes/           # formatDate
├── features/
│   ├── auth/            # Login, register, JWT, AuthStore
│   ├── dashboard/       # Stats (total, by status, overdue)
│   └── tasks/           # CRUD, filters, sort, drag & drop, TasksStore
├── layout/              # Main layout (sidebar, toolbar, outlet)
└── app.config.ts        # Router, HttpClient, interceptors, animations
```

## API contract

Base URL: configurable via `environment.apiUrl` (e.g. `http://localhost:3000/api`).

### Auth

- `POST /auth/register`  
  Body: `{ name, email, password }`  
  Response: `{ accessToken, refreshToken?, user: { id, email, name } }`

- `POST /auth/login`  
  Body: `{ email, password }`  
  Response: same as register

- `GET /auth/me`  
  Headers: `Authorization: Bearer <token>`  
  Response: `{ id, email, name }`

### Tasks

- `GET /tasks`  
  Response: `Task[]`

- `POST /tasks`  
  Body: `{ title, description?, status?, priority?, deadline? }`  
  Response: `Task`

- `PATCH /tasks/:id`  
  Body: partial task  
  Response: `Task`

- `DELETE /tasks/:id`  
  Response: `204`

- `PATCH /tasks/reorder`  
  Body: `{ order: string[] }` (task ids)

### Task model

```ts
{
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;  // ISO date
  createdAt: string;
  updatedAt: string;
  order: number;
}
```

## Path aliases

- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@features/*` → `src/app/features/*`
- `@layout/*` → `src/app/layout/*`
- `@env/*` → `src/environments/*`

## Architecture notes

- **Signals**: Used in `AuthStore`, `TasksStore`, `ThemeService`, `LoadingService` for reactive state; components use `store.tasks()`, `store.stats()`, etc.
- **Stores**: Feature-level only (`auth.store.ts`, `tasks.store.ts`); no NgRx. State, actions (methods), and selectors (computed) live in the store.
- **Lazy loading**: Auth, dashboard, and tasks are loaded via `loadChildren`.
- **Error handling**: Global `errorInterceptor` shows snackbar and redirects to login on 401.
- **Theming**: Light/dark via `ThemeService` (signal) and CSS variables in `_theme.scss`.

## Scaling and enterprise improvements

- Add API versioning and feature flags.
- Use NgRx or similar only if you need time-travel, persistence, or very large shared state.
- Add SSR/SSG if SEO or first-load performance is critical.
- Introduce a BFF or API gateway for 50k+ daily users; cache and rate-limit per user.
- Add E2E with Cypress/Playwright and CI for PRs.
- Monitor errors (e.g. Sentry) and performance (Web Vitals).
- Enforce strict CSP and security headers in production.
