export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'in-testing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string | null;
}

export interface TaskUpdatePayload extends Partial<TaskCreatePayload> {
  order?: number;
}

export interface TaskFilters {
  status: TaskStatus | null;
  priority: TaskPriority | null;
  search: string;
  sortBy: 'deadline' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
