import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import type { TaskFilters, TaskPriority, TaskStatus } from '@features/tasks/models/task.model';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  template: `
    <div class="filters">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Search</mat-label>
        <input
          matInput
          [ngModel]="filters().search"
          (ngModelChange)="onSearchChange.emit($event)"
          placeholder="Title or description"
        />
      </mat-form-field>
      @if (showAdvanced()) {
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [value]="filters().status" (valueChange)="onStatusFilter.emit($event)">
            <mat-option value="">All</mat-option>
            @for (opt of statusOptions(); track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Priority</mat-label>
          <mat-select [value]="filters().priority" (valueChange)="onPriorityFilter.emit($event)">
            <mat-option value="">All</mat-option>
            @for (opt of priorityOptions(); track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Sort by</mat-label>
          <mat-select [value]="filters().sortBy" (valueChange)="onSortBy.emit($event)">
            @for (opt of sortOptions(); track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Order</mat-label>
          <mat-select [value]="filters().sortOrder" (valueChange)="onSortOrder.emit($event)">
            <mat-option value="asc">Ascending</mat-option>
            <mat-option value="desc">Descending</mat-option>
          </mat-select>
        </mat-form-field>
      }
    </div>
  `,
  styles: [
    `
      .filters {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem 1rem;
        margin-bottom: 1.25rem;
        padding: 0.875rem 1rem;
        background: var(--app-surface);
        border: 1px solid var(--app-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.05));

        .filter-field {
          min-width: 130px;
          max-width: 200px;

          ::ng-deep .mat-mdc-form-field-subscript-wrapper {
            display: none;
          }
          ::ng-deep .mat-mdc-text-field-wrapper {
            padding: 0 12px;
          }
          ::ng-deep .mat-mdc-form-field-infix {
            padding-top: 12px;
            padding-bottom: 12px;
            min-height: 44px;
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFiltersComponent {
  filters = input.required<TaskFilters>();
  showAdvanced = input(false);
  statusOptions = input.required<{ value: TaskStatus; label: string }[]>();
  priorityOptions = input.required<{ value: TaskPriority; label: string }[]>();
  sortOptions = input.required<{ value: string; label: string }[]>();

  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onStatusFilter = new EventEmitter<TaskStatus | ''>();
  @Output() onPriorityFilter = new EventEmitter<TaskPriority | ''>();
  @Output() onSortBy = new EventEmitter<string>();
  @Output() onSortOrder = new EventEmitter<'asc' | 'desc'>();
}
