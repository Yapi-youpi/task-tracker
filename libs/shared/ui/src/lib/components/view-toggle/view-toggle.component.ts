import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ViewMode = 'list' | 'kanban';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="view-toggle">
      <button
        mat-button
        [class.active]="currentMode() === 'kanban'"
        (click)="onModeChange('kanban')"
        title="Kanban board"
      >
        <mat-icon>view_kanban</mat-icon>
        <span>Kanban</span>
      </button>
      <button
        mat-button
        [class.active]="currentMode() === 'list'"
        (click)="onModeChange('list')"
        title="List view"
      >
        <mat-icon>view_list</mat-icon>
        <span>List</span>
      </button>
    </div>
  `,
  styles: [
    `
      .view-toggle {
        display: flex;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--app-border);
        background: var(--app-surface);
        box-shadow: var(--shadow-sm);

        button {
          min-width: auto;
          padding: 0 1rem;
          gap: 0.4rem;
          transition: background-color var(--transition-fast), color var(--transition-fast);

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          &.active {
            background: var(--app-primary-soft);
            color: var(--app-primary);
            font-weight: 600;
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewToggleComponent {
  currentMode = input.required<ViewMode>();
  @Output() modeChange = new EventEmitter<ViewMode>();

  onModeChange(mode: ViewMode): void {
    this.modeChange.emit(mode);
  }
}
