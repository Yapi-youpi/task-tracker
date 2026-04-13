import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';
import type { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { FormatDatePipe } from '@shared/pipes/format-date.pipe';
import { StatusBadgeComponent } from '@shared-ui/badges/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '@shared-ui/badges/priority-badge/priority-badge.component';

export type TaskViewDialogData = Task;

export type TaskViewDialogResult = { action: 'delete'; id: string } | undefined;

@Component({
  selector: 'app-task-view-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormatDatePipe,
    StatusBadgeComponent,
    PriorityBadgeComponent,
  ],
  templateUrl: './task-view-dialog.component.html',
  styleUrl: './task-view-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskViewDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskViewDialogComponent, TaskViewDialogResult>);
  private readonly dialog = inject(MatDialog);
  readonly task = inject<TaskViewDialogData>(MAT_DIALOG_DATA);

  readonly statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    'in-review': 'In Review',
    'in-testing': 'In Testing',
    done: 'Done',
  };
  readonly priorityLabels: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  statusLabel(s: TaskStatus): string {
    return this.statusLabels[s] ?? s;
  }

  priorityLabel(p: TaskPriority): string {
    return this.priorityLabels[p] ?? p;
  }

  edit(): void {
    this.dialog.open(TaskFormDialogComponent, {
      width: 'min(500px, 95vw)',
      data: this.task,
    }).afterClosed().subscribe(() => {
      this.dialogRef.close();
    });
  }

  delete(): void {
    if (!confirm('Delete this task?')) return;
    this.dialogRef.close({ action: 'delete', id: this.task.id });
  }

  close(): void {
    this.dialogRef.close();
  }
}
