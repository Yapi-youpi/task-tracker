import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
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
      <div class="task-card-content" (click)="onCardClick.emit(task())" role="button" tabindex="0" (keydown.enter)="onCardClick.emit(task())" (keydown.space)="$event.preventDefault(); onCardClick.emit(task())">
        <div class="task-card-head">
          <h3 [class.task-title]="true" [class.task-title-list]="variant() === 'list'">{{ task().title }}</h3>
        </div>
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
        box-shadow: var(--shadow-card, var(--shadow-sm));
        transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
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

        .task-card-handle:active {
          cursor: grabbing;
        }

        &:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--app-border-strong);

          &::before {
            width: 4px;
            opacity: 1;
          }

        }

        .task-card-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem;
          color: var(--app-text-muted);
          border-bottom: 1px solid var(--app-border);
          background: var(--app-bg);
          cursor: grab;
          transition: background-color 0.2s ease;

          &:hover {
            background: var(--app-surface);
          }

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            opacity: 0.8;
          }
        }

        .task-card-content {
          flex: 1;
          padding: 0.75rem 0.875rem;
          min-width: 0;
          cursor: pointer;
        }

        .task-card-head {
          margin-bottom: 0.25rem;
        }

        .task-title {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.35;
          color: var(--app-text);
          min-width: 0;

          &.task-title-list {
            font-size: 0.9375rem;
          }
        }

        .task-card-footer {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--app-border);
        }

        .task-deadline {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.6875rem;
          color: var(--app-text-muted);
          margin-left: auto;

          mat-icon {
            font-size: 12px;
            width: 12px;
            height: 12px;
            opacity: 0.85;
          }
        }

        &.kanban-card .task-card-content {
          padding-top: 0.625rem;
        }

        &.task-card-list {
          background: var(--app-surface);
          box-shadow: var(--shadow-sm);
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

  @Output() onCardClick = new EventEmitter<Task>();
  @Output() onEdit = new EventEmitter<Task>();
  @Output() onDelete = new EventEmitter<string>();
}
