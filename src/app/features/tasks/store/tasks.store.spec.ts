import { TestBed } from '@angular/core/testing';
import { TasksStore } from './tasks.store';
import type { Task } from '../models/task.model';

const mockTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test',
  description: '',
  status: 'todo',
  priority: 'medium',
  deadline: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  order: 0,
  ...overrides,
});

describe('TasksStore', () => {
  let store: TasksStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TasksStore] });
    store = TestBed.inject(TasksStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(store.tasks()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set tasks', () => {
    const tasks = [mockTask({ id: '1' }), mockTask({ id: '2' })];
    store.setTasks(tasks);
    expect(store.tasks()).toEqual(tasks);
    expect(store.loading()).toBe(false);
  });

  it('should add task', () => {
    const task = mockTask({ id: '1' });
    store.addTask(task);
    expect(store.tasks()).toHaveLength(1);
    expect(store.tasks()[0]).toEqual(task);
  });

  it('should update task', () => {
    store.setTasks([mockTask({ id: '1', title: 'Old' })]);
    store.updateTask('1', { title: 'New' });
    expect(store.tasks()[0].title).toBe('New');
  });

  it('should remove task', () => {
    store.setTasks([mockTask({ id: '1' })]);
    store.removeTask('1');
    expect(store.tasks()).toHaveLength(0);
  });

  it('should filter by status', () => {
    store.setTasks([
      mockTask({ id: '1', status: 'todo' }),
      mockTask({ id: '2', status: 'done' }),
    ]);
    store.setFilters({ status: 'todo' });
    expect(store.filteredAndSortedTasks()).toHaveLength(1);
    expect(store.filteredAndSortedTasks()[0].status).toBe('todo');
  });

  it('should compute stats', () => {
    store.setTasks([
      mockTask({ id: '1', status: 'todo' }),
      mockTask({ id: '2', status: 'in-progress' }),
      mockTask({ id: '3', status: 'done' }),
    ]);
    const stats = store.stats();
    expect(stats.total).toBe(3);
    expect(stats.todo).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.done).toBe(1);
  });
});
