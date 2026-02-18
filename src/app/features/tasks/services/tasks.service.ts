import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '@env/environment';
import { TasksStore } from '../store/tasks.store';
import type { Task, TaskCreatePayload, TaskUpdatePayload } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(TasksStore);

  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  load(): void {
    this.store.setLoading(true);
    this.http.get<Task[]>(this.baseUrl).subscribe({
      next: (tasks) => this.store.setTasks(tasks),
      error: (err) =>
        this.store.setError(err.error?.message ?? 'Failed to load tasks'),
    });
  }

  create(payload: TaskCreatePayload) {
    return this.http.post<Task>(this.baseUrl, payload).pipe(
      tap((task) => this.store.addTask(task))
    );
  }

  update(id: string, payload: TaskUpdatePayload) {
    return this.http.patch<Task>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((task) =>
        this.store.updateTask(id, {
          ...task,
          updatedAt: task.updatedAt ?? new Date().toISOString(),
        })
      )
    );
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.store.removeTask(id))
    );
  }

  reorder(orderedIds: string[]) {
    return this.http
      .patch<{ order: string[] }>(`${this.baseUrl}/reorder`, { order: orderedIds })
      .pipe(tap(() => this.store.reorderTasks(orderedIds)));
  }
}
