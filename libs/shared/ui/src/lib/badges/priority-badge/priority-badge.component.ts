import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { TaskPriority } from '@features/tasks/models/task.model';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span
      class="task-priority-badge"
      [class]="'priority-' + priority()"
      [attr.title]="label()"
      [attr.aria-label]="'Priority: ' + label()"
    >
      <mat-icon>{{ priorityIcon() }}</mat-icon>
    </span>
  `,
  styles: [
    `
      .task-priority-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: var(--radius-full);
        flex-shrink: 0;

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }

        &.priority-low {
          background: rgba(59, 130, 246, 0.15);
          color: #2563eb;
        }

        &.priority-medium {
          background: rgba(217, 119, 6, 0.15);
          color: var(--app-warning);
        }

        &.priority-high {
          background: rgba(220, 38, 38, 0.15);
          color: var(--app-error);
        }
      }

      .app-dark-theme .task-priority-badge {
        &.priority-low {
          color: #60a5fa;
        }
        &.priority-medium {
          color: #fcd34d;
        }
        &.priority-high {
          color: #f87171;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityBadgeComponent {
  priority = input.required<TaskPriority>();
  label = input.required<string>();

  priorityIcon(): string {
    const p = this.priority();
    if (p === 'high') return 'expand_less';
    if (p === 'medium') return 'drag_handle';
    return 'expand_more';
  }
}
