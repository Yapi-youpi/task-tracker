import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TaskStatus } from '@features/tasks/models/task.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="task-status-badge" [class]="'status-' + status()">
      {{ label() }}
    </span>
  `,
  styles: [
    `
      .task-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-full);
        letter-spacing: 0.01em;

        &.status-todo {
          background: var(--app-primary-soft);
          color: var(--app-primary);
        }

        &.status-in-progress {
          background: rgba(217, 119, 6, 0.15);
          color: var(--app-warning);
        }

        &.status-in-review {
          background: rgba(99, 102, 241, 0.15);
          color: var(--app-primary);
        }

        &.status-in-testing {
          background: rgba(14, 165, 233, 0.15);
          color: var(--app-accent, #0ea5e9);
        }

        &.status-done {
          background: rgba(5, 150, 105, 0.15);
          color: var(--app-success);
        }
      }

      .app-dark-theme .task-status-badge {
        &.status-todo {
          color: #a5b4fc;
        }
        &.status-in-progress {
          color: #fcd34d;
        }
        &.status-in-review {
          color: #a5b4fc;
        }
        &.status-in-testing {
          color: #7dd3fc;
        }
        &.status-done {
          color: #6ee7b7;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<TaskStatus>();
  label = input.required<string>();
}
