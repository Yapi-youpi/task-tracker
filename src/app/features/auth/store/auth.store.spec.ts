import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: AuthStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuthStore] });
    store = TestBed.inject(AuthStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.initialized()).toBe(false);
  });

  it('should set user', () => {
    const user = { id: '1', email: 'a@b.com', name: 'Test' };
    store.setUser(user);
    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
  });

  it('should set initialized', () => {
    store.setInitialized();
    expect(store.initialized()).toBe(true);
  });

  it('should clear state on logout', () => {
    store.setUser({ id: '1', email: 'a@b.com', name: 'Test' });
    store.logout();
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });
});
