import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TasksStore } from '@features/tasks/store/tasks.store';
import { TasksService } from '@features/tasks/services/tasks.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly tasksStore = inject(TasksStore);
  private readonly tasksService = inject(TasksService);

  readonly stats = this.tasksStore.stats;

  ngOnInit(): void {
    this.tasksService.load();
  }
}
