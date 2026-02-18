import { Injectable, signal, computed } from '@angular/core';
import type { Task, TaskFilters } from '../models/task.model';

export interface TasksState {
  tasks: Task[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
}

const defaultFilters: TaskFilters = {
  status: null,
  priority: null,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const initialState: TasksState = {
  tasks: [],
  filters: defaultFilters,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class TasksStore {
  private readonly state = signal<TasksState>(initialState);

  readonly tasks = computed(() => this.state().tasks);
  readonly filters = computed(() => this.state().filters);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly filteredAndSortedTasks = computed(() => {
    const { tasks, filters } = this.state();
    let result = [...tasks];

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    const mult = filters.sortOrder === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return mult * aVal.localeCompare(bVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return mult * (aVal - bVal);
      }
      return mult * String(aVal).localeCompare(String(bVal));
    });
    return result;
  });

  readonly tasksByStatus = computed(() => {
    const list = this.filteredAndSortedTasks();
    return {
      todo: list.filter((t) => t.status === 'todo'),
      inProgress: list.filter((t) => t.status === 'in-progress'),
      inReview: list.filter((t) => t.status === 'in-review'),
      inTesting: list.filter((t) => t.status === 'in-testing'),
      done: list.filter((t) => t.status === 'done'),
    };
  });

  readonly stats = computed(() => {
    const tasks = this.state().tasks;
    const now = new Date().toISOString().slice(0, 10);
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      inReview: tasks.filter((t) => t.status === 'in-review').length,
      inTesting: tasks.filter((t) => t.status === 'in-testing').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter(
        (t) => t.deadline && t.deadline < now && t.status !== 'done'
      ).length,
    };
  });

  setTasks(tasks: Task[]): void {
    this.state.update((s) => ({ ...s, tasks, loading: false, error: null }));
  }

  addTask(task: Task): void {
    this.state.update((s) => ({
      ...s,
      tasks: [...s.tasks, task],
      error: null,
    }));
  }

  updateTask(id: string, patch: Partial<Task>): void {
    this.state.update((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      error: null,
    }));
  }

  removeTask(id: string): void {
    this.state.update((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== id),
      error: null,
    }));
  }

  reorderTasks(orderedIds: string[]): void {
    this.state.update((s) => {
      const byId = new Map(s.tasks.map((t) => [t.id, t]));
      const tasks = orderedIds
        .map((id, i) => {
          const t = byId.get(id);
          return t ? { ...t, order: i } : null;
        })
        .filter((t): t is Task => t != null);
      const rest = s.tasks.filter((t) => !orderedIds.includes(t.id));
      return { ...s, tasks: [...tasks, ...rest].sort((a, b) => a.order - b.order) };
    });
  }

  setFilters(filters: Partial<TaskFilters>): void {
    this.state.update((s) => ({
      ...s,
      filters: { ...s.filters, ...filters },
    }));
  }

  setLoading(loading: boolean): void {
    this.state.update((s) => ({ ...s, loading }));
  }

  setError(error: string | null): void {
    this.state.update((s) => ({ ...s, error, loading: false }));
  }
}
