# Рефакторинг проекта под Nx

Проект был рефакторен для использования Nx монорепозитория и выделения переиспользуемых компонентов в отдельные библиотеки.

## Структура проекта

```
task-tracker/
├── libs/
│   └── shared/
│       └── ui/                    # Библиотека переиспользуемых UI компонентов
│           └── src/
│               ├── lib/
│               │   ├── badges/    # Компоненты бейджей (Status, Priority)
│               │   ├── components/ # Основные компоненты (TaskCard, ViewToggle)
│               │   └── filters/    # Компоненты фильтров (TaskFilters)
│               └── index.ts       # Публичный API библиотеки
├── src/
│   └── app/
│       └── features/
│           └── tasks/            # Feature модуль tasks
└── nx.json                        # Конфигурация Nx
```

## Созданные переиспользуемые компоненты

### 1. **PriorityBadgeComponent** (`libs/shared/ui/src/lib/badges/priority-badge/`)
Компонент для отображения бейджа приоритета задачи.

**Использование:**
```typescript
<app-priority-badge [priority]="task.priority" [label]="'High'" />
```

### 2. **StatusBadgeComponent** (`libs/shared/ui/src/lib/badges/status-badge/`)
Компонент для отображения бейджа статуса задачи.

**Использование:**
```typescript
<app-status-badge [status]="task.status" [label]="'In Progress'" />
```

### 3. **TaskCardComponent** (`libs/shared/ui/src/lib/components/task-card/`)
Универсальный компонент карточки задачи, поддерживающий режимы kanban и list.

**Параметры:**
- `task` (required): Объект задачи
- `variant`: 'kanban' | 'list' (по умолчанию 'kanban')
- `draggable`: boolean (по умолчанию true)
- `showHandle`: boolean (по умолчанию true)
- `statusLabel` (required): Метка статуса
- `priorityLabel` (required): Метка приоритета

**События:**
- `onEdit`: Событие редактирования задачи
- `onDelete`: Событие удаления задачи

**Использование:**
```typescript
<app-task-card
  [task]="task"
  variant="kanban"
  [statusLabel]="statusLabel(task.status)"
  [priorityLabel]="priorityLabel(task.priority)"
  (onEdit)="openEditDialog($event)"
  (onDelete)="deleteTask($event)"
/>
```

### 4. **ViewToggleComponent** (`libs/shared/ui/src/lib/components/view-toggle/`)
Компонент переключения между режимами просмотра (kanban/list).

**Параметры:**
- `currentMode` (required): Текущий режим просмотра

**События:**
- `modeChange`: Событие изменения режима

**Использование:**
```typescript
<app-view-toggle [currentMode]="viewMode()" (modeChange)="setViewMode($event)" />
```

### 5. **TaskFiltersComponent** (`libs/shared/ui/src/lib/filters/task-filters/`)
Компонент фильтров для задач.

**Параметры:**
- `filters` (required): Объект фильтров
- `showAdvanced`: boolean - показывать ли расширенные фильтры
- `statusOptions` (required): Опции статусов
- `priorityOptions` (required): Опции приоритетов
- `sortOptions` (required): Опции сортировки

**События:**
- `onSearchChange`: Изменение поискового запроса
- `onStatusFilter`: Фильтр по статусу
- `onPriorityFilter`: Фильтр по приоритету
- `onSortBy`: Сортировка
- `onSortOrder`: Порядок сортировки

**Использование:**
```typescript
<app-task-filters
  [filters]="filters()"
  [showAdvanced]="viewMode() === 'list'"
  [statusOptions]="statusOptions"
  [priorityOptions]="priorityOptions"
  [sortOptions]="sortOptions"
  (onSearchChange)="onSearchChange($event)"
  (onStatusFilter)="onStatusFilter($event)"
  (onPriorityFilter)="onPriorityFilter($event)"
  (onSortBy)="onSortBy($event)"
  (onSortOrder)="onSortOrder($event)"
/>
```

## Импорт компонентов

Все компоненты экспортируются из библиотеки `@shared-ui`:

```typescript
import {
  TaskCardComponent,
  TaskFiltersComponent,
  ViewToggleComponent,
  PriorityBadgeComponent,
  StatusBadgeComponent,
  type ViewMode,
} from '@shared-ui';
```

## Конфигурация путей

Пути настроены в `tsconfig.base.json`:

```json
{
  "paths": {
    "@shared-ui": ["libs/shared/ui/src/index.ts"],
    "@shared-ui/*": ["libs/shared/ui/src/lib/*"]
  }
}
```

## Преимущества рефакторинга

1. **Переиспользуемость**: Компоненты можно использовать в разных частях приложения
2. **Модульность**: Четкое разделение ответственности
3. **Масштабируемость**: Легко добавлять новые компоненты в библиотеку
4. **Тестируемость**: Компоненты можно тестировать изолированно
5. **Монорепозиторий**: Структура Nx позволяет управлять зависимостями между библиотеками

## Следующие шаги

1. Добавить unit-тесты для новых компонентов
2. Создать Storybook для документации компонентов
3. Рассмотреть создание дополнительных библиотек для других feature модулей
4. Настроить CI/CD для автоматической сборки библиотек
