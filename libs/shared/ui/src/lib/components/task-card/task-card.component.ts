import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormatDatePipe } from '@shared/pipes/format-date.pipe';
import { PriorityBadgeComponent } from '../../badges/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../badges/status-badge/status-badge.component';
import type { Task } from '@features/tasks/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    FormatDatePipe,
    PriorityBadgeComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div
      class="task-card"
      [class.kanban-card]="variant() === 'kanban'"
      [class.task-card-list]="variant() === 'list'"
      [attr.data-priority]="task().priority"
      cdkDrag
      [cdkDragData]="task()"
      [cdkDragDisabled]="!draggable()"
    >
      @if (showHandle()) {
        <div class="task-card-handle" cdkDragHandle [attr.title]="variant() === 'kanban' ? 'Drag to move' : 'Drag to reorder'">
          <mat-icon>drag_handle</mat-icon>
        </div>
      }
      <div class="task-card-content">
        <div class="task-card-head">
          <h3 [class.task-title]="true" [class.task-title-list]="variant() === 'list'">{{ task().title }}</h3>
          <div class="task-actions">
            <button mat-icon-button (click)="onEdit.emit(task())" [attr.aria-label]="'Edit'">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="onDelete.emit(task().id)" [attr.aria-label]="'Delete'" color="warn">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
        @if (task().description) {
          <p class="task-description">{{ task().description }}</p>
        }
        <div class="task-card-footer">
          @if (variant() === 'list') {
            <app-status-badge [status]="task().status" [label]="statusLabel()" />
          }
          <app-priority-badge [priority]="task().priority" [label]="priorityLabel()" />
          @if (task().deadline) {
            <span class="task-deadline">
              <mat-icon>event</mat-icon>
              {{ task().deadline | formatDate }}
            </span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .task-card {
        position: relative;
        display: flex;
        flex-direction: column;
        background: var(--app-surface-elevated, var(--app-bg));
        border: 1px solid var(--app-border);
        border-radius: var(--radius-md);
        overflow: hidden;
        cursor: grab;
        transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: var(--radius-md) 0 0 var(--radius-md);
          background: var(--task-accent, var(--app-border));
          transition: width 0.2s ease, opacity 0.2s ease;
        }

        &[data-priority='low']::before {
          --task-accent: #64748b;
        }
        &[data-priority='medium']::before {
          --task-accent: #ca8a04;
        }
        &[data-priority='high']::before {
          --task-accent: #b91c1c;
        }

        &:active {
          cursor: grabbing;
        }

        &:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--app-border-strong);

          &::before {
            width: 5px;
            opacity: 1;
          }

          .task-actions {
            opacity: 1;
          }
        }

        .task-card-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.4rem;
          color: var(--app-text-muted);
          border-bottom: 1px solid var(--app-border);
          background: var(--app-bg);
          cursor: grab;
          transition: background-color 0.2s ease;

          &:hover {
            background: var(--app-surface);
          }

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }

        .task-card-content {
          flex: 1;
          padding: 0.875rem;
          min-width: 0;
        }

        .task-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .task-title {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          line-height: 1.35;
          color: var(--app-text);
          flex: 1;
          min-width: 0;

          &.task-title-list {
            font-size: 1rem;
          }
        }

        .task-actions {
          display: flex;
          gap: 0.15rem;
          opacity: 0.7;
          transition: opacity 0.2s ease;
          flex-shrink: 0;

          button mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }

        .task-description {
          margin: 0 0 0.6rem;
          font-size: 0.8125rem;
          color: var(--app-text-muted);
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-card-footer {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--app-border);
        }

        .task-deadline {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          margin-left: auto;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
            opacity: 0.9;
          }
        }

        &.kanban-card .task-card-content {
          padding-top: 0.75rem;
        }

        &.task-card-list {
          background: var(--app-surface);

          .task-description {
            font-size: 0.9rem;
            -webkit-line-clamp: 2;
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  task = input.required<Task>();
  variant = input<'kanban' | 'list'>('kanban');
  draggable = input(true);
  showHandle = input(true);
  statusLabel = input.required<string>();
  priorityLabel = input.required<string>();

  @Output() onEdit = new EventEmitter<Task>();
  @Output() onDelete = new EventEmitter<string>();
}
