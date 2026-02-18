import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TasksService } from '../../services/tasks.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import type { TaskStatus, TaskPriority } from '../../models/task.model';

export type TaskFormDialogData = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
} | null;

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  private readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly isEdit = signal(!!this.data?.id);

  readonly form = this.fb.nonNullable.group({
    title: [this.data?.title ?? '', [Validators.required, Validators.minLength(1)]],
    description: [this.data?.description ?? ''],
    status: [<TaskStatus>(this.data?.status ?? 'todo')],
    priority: [<TaskPriority>(this.data?.priority ?? 'medium')],
    deadline: [this.data?.deadline ? new Date(this.data.deadline) : null as Date | null],
  });

  readonly statusOptions: TaskStatus[] = ['todo', 'in-progress', 'in-review', 'in-testing', 'done'];
  readonly statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    'in-review': 'In Review',
    'in-testing': 'In Testing',
    done: 'Done',
  };
  readonly priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];

  loading = signal(false);

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload = {
      title: raw.title,
      description: raw.description || undefined,
      status: raw.status,
      priority: raw.priority,
      deadline: raw.deadline ? raw.deadline.toISOString().slice(0, 10) : null,
    };
    this.loading.set(true);
    if (this.data?.id) {
      this.tasksService.update(this.data.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.loading.set(false);
          this.errorHandler.showError(err.error?.message ?? 'Update failed');
        },
        complete: () => this.loading.set(false),
      });
    } else {
      this.tasksService.create(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.loading.set(false);
          this.errorHandler.showError(err.error?.message ?? 'Create failed');
        },
        complete: () => this.loading.set(false),
      });
    }
  }
}
