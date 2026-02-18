import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TasksStore } from '../../store/tasks.store';
import { TasksService } from '../../services/tasks.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import type { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskFormDialogComponent } from '../../components/task-form-dialog/task-form-dialog.component';
import {
  TaskCardComponent,
  TaskFiltersComponent,
  ViewToggleComponent,
  type ViewMode,
} from '@shared-ui';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    DragDropModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TaskCardComponent,
    TaskFiltersComponent,
    ViewToggleComponent,
  ],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListPageComponent implements OnInit {
  private readonly store = inject(TasksStore);
  private readonly tasksService = inject(TasksService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly dialog = inject(MatDialog);

  readonly tasks = this.store.filteredAndSortedTasks;
  readonly tasksByStatus = this.store.tasksByStatus;
  readonly filters = this.store.filters;
  readonly loading = this.store.loading;

  viewMode = signal<ViewMode>('kanban');

  readonly todoTasks = signal<Task[]>([]);
  readonly inProgressTasks = signal<Task[]>([]);
  readonly inReviewTasks = signal<Task[]>([]);
  readonly inTestingTasks = signal<Task[]>([]);
  readonly doneTasks = signal<Task[]>([]);

  readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'in-review', label: 'In Review' },
    { value: 'in-testing', label: 'In Testing' },
    { value: 'done', label: 'Done' },
  ];
  readonly priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
  readonly sortOptions = [
    { value: 'createdAt', label: 'Created' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
  ];

  constructor() {
    effect(() => {
      const byStatus = this.store.tasksByStatus();
      this.todoTasks.set([...byStatus.todo]);
      this.inProgressTasks.set([...byStatus.inProgress]);
      this.inReviewTasks.set([...byStatus.inReview]);
      this.inTestingTasks.set([...byStatus.inTesting]);
      this.doneTasks.set([...byStatus.done]);
    });
  }

  ngOnInit(): void {
    this.tasksService.load();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onSearchChange(value: string): void {
    this.store.setFilters({ search: value });
  }

  onStatusFilter(value: TaskStatus | ''): void {
    this.store.setFilters({ status: value || null });
  }

  onPriorityFilter(value: TaskPriority | ''): void {
    this.store.setFilters({ priority: value || null });
  }

  onSortBy(value: string): void {
    this.store.setFilters({ sortBy: value as 'deadline' | 'priority' | 'createdAt' | 'title' });
  }

  onSortOrder(value: 'asc' | 'desc'): void {
    this.store.setFilters({ sortOrder: value });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: 'min(500px, 95vw)',
      data: null,
    });
    ref.afterClosed().subscribe((created) => {
      if (created) this.errorHandler.showSuccess('Task created');
    });
  }

  openEditDialog(task: { id: string; title: string; description: string; status: TaskStatus; priority: TaskPriority; deadline: string | null }): void {
    this.dialog.open(TaskFormDialogComponent, {
      width: 'min(500px, 95vw)',
      data: task,
    });
  }

  deleteTask(id: string): void {
    if (!confirm('Delete this task?')) return;
    this.tasksService.delete(id).subscribe({
      next: () => this.errorHandler.showSuccess('Task deleted'),
      error: (err) =>
        this.errorHandler.showError(err.error?.message ?? 'Delete failed'),
    });
  }

  dropInList(event: CdkDragDrop<Task[]>): void {
    const list = [...this.store.filteredAndSortedTasks()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    const ids = list.map((t) => t.id);
    this.store.reorderTasks(ids);
    this.tasksService.reorder(ids).subscribe({
      error: () => this.errorHandler.showError('Failed to reorder'),
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      const list = [...event.container.data];
      moveItemInArray(list, event.previousIndex, event.currentIndex);
      this.setColumnTasks(event.container.id as TaskStatus, list);
      const allIds = [
        ...this.todoTasks().map((t) => t.id),
        ...this.inProgressTasks().map((t) => t.id),
        ...this.inReviewTasks().map((t) => t.id),
        ...this.inTestingTasks().map((t) => t.id),
        ...this.doneTasks().map((t) => t.id),
      ];
      this.store.reorderTasks(allIds);
      this.tasksService.reorder(allIds).subscribe({
        error: () => this.errorHandler.showError('Failed to reorder'),
      });
    } else {
      const task = event.item.data as Task;
      if (!task?.id) {
        this.errorHandler.showError('Invalid task data');
        return;
      }
      const newStatus = event.container.id as TaskStatus;
      const prevList = [...event.previousContainer.data];
      const nextList = [...event.container.data];
      transferArrayItem(prevList, nextList, event.previousIndex, event.currentIndex);
      this.setColumnTasks(event.previousContainer.id as TaskStatus, prevList);
      this.setColumnTasks(event.container.id as TaskStatus, nextList);
      this.store.updateTask(task.id, { status: newStatus });
      this.tasksService.update(task.id, { status: newStatus }).subscribe({
        next: () => this.errorHandler.showSuccess('Status updated'),
        error: () => {
          this.store.updateTask(task.id, { status: task.status });
          this.errorHandler.showError('Failed to update status');
        },
      });
    }
  }

  private setColumnTasks(status: TaskStatus, list: Task[]): void {
    if (status === 'todo') this.todoTasks.set(list);
    else if (status === 'in-progress') this.inProgressTasks.set(list);
    else if (status === 'in-review') this.inReviewTasks.set(list);
    else if (status === 'in-testing') this.inTestingTasks.set(list);
    else this.doneTasks.set(list);
  }

  statusLabel(s: TaskStatus): string {
    return this.statusOptions.find((o) => o.value === s)?.label ?? s;
  }

  priorityLabel(p: TaskPriority): string {
    return this.priorityOptions.find((o) => o.value === p)?.label ?? p;
  }
}
