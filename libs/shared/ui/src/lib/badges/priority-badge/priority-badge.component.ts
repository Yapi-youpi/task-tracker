import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import type { TaskPriority } from '@features/tasks/models/task.model';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [MatIconModule, MatChipsModule],
  template: `
    <span class="task-priority-badge" [class]="'priority-' + priority()">
      <mat-icon>flag</mat-icon>
      {{ label() }}
    </span>
  `,
  styles: [
    `
      .task-priority-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }

        &.priority-low {
          background: rgba(100, 116, 139, 0.2);
          color: var(--app-text-muted);
        }

        &.priority-medium {
          background: rgba(217, 119, 6, 0.2);
          color: var(--app-warning);
        }

        &.priority-high {
          background: rgba(220, 38, 38, 0.2);
          color: var(--app-error);
        }
      }

      .app-dark-theme .task-priority-badge {
        &.priority-low {
          color: #94a3b8;
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
}
