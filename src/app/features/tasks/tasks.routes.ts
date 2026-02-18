import { Routes } from '@angular/router';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';

export const TASKS_ROUTES: Routes = [
  { path: '', component: TaskListPageComponent },
];
