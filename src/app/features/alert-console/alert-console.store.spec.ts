import { DestroyableInjector, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Alert, AlertStatus } from '../../core/models/alert.model';
import { AlertApiService } from '../../core/services/alert-api.service';
import { AlertConsoleStore } from './alert-console.store';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function createAlert(id: string, status: AlertStatus = 'ESCALATED'): Alert {
  const createdAt = '2026-08-17T20:00:00.000Z';
  return {
    id,
    source: 'billing-svc',
    severity: 'HIGH',
    status,
    createdAt,
    history: [
      { state: 'OPEN', ts: createdAt },
      ...(status === 'ESCALATED'
        ? [{ state: 'ESCALATED' as const, ts: '2026-08-17T20:05:00.000Z' }]
        : []),
    ],
  };
}

describe('AlertConsoleStore resolution', () => {
  let store: AlertConsoleStore;
  let alerts: Alert[];
  let saveCalls: Array<{ id: string; note: string }>;
  let saveImplementation: (id: string, note: string) => Promise<void>;
  let injector: DestroyableInjector;

  beforeEach(() => {
    alerts = [createAlert('AL-001'), createAlert('AL-002', 'OPEN')];
    saveCalls = [];
    saveImplementation = () => Promise.resolve();

    const api: Pick<AlertApiService, 'loadAlerts' | 'saveResolution'> = {
      loadAlerts: () => alerts,
      saveResolution: (id, note) => {
        saveCalls.push({ id, note });
        return saveImplementation(id, note);
      },
    };

    injector = Injector.create({
      providers: [{ provide: AlertApiService, useValue: api }],
    });
    store = runInInjectionContext(injector, () => new AlertConsoleStore());
  });

  afterEach(() => {
    injector.destroy();
  });

  it('optimistically resolves an alert and retains its resolution history after success', async () => {
    store.selectAlert('AL-001');
    store.openResolveForm('AL-001');

    await store.resolveAlert('AL-001', '  Restarted consumer  ');

    expect(store.alerts()[0].status).toBe('RESOLVED');
    expect(store.alerts()[0].history.at(-1)).toMatchObject({
      state: 'RESOLVED',
      note: 'Restarted consumer',
    });
    expect(store.selectedAlert()?.status).toBe('RESOLVED');
    expect(store.selectedAlertIsSaving()).toBe(false);
    expect(store.resolutionError()).toBeNull();
    expect(store.resolveFormAlertId()).toBeNull();
    expect(saveCalls).toEqual([{ id: 'AL-001', note: 'Restarted consumer' }]);
  });

  it('rejects whitespace-only notes without calling the save service', async () => {
    await expect(store.resolveAlert('AL-001', '   ')).rejects.toThrow(
      'A resolution note is required.',
    );

    expect(saveCalls).toHaveLength(0);
    expect(store.alerts()[0].status).toBe('ESCALATED');
  });

  it.each(['AUTO_CLOSED', 'RESOLVED'] as const)(
    'does not resolve an alert already in %s status',
    async (status) => {
      store.alerts.update((current) => [createAlert('AL-001', status), current[1]]);

      await store.resolveAlert('AL-001', 'A valid note');

      expect(saveCalls).toHaveLength(0);
      expect(store.alerts()[0].status).toBe(status);
    },
  );

  it('prevents duplicate submissions and clears saving state after success', async () => {
    const pending = createDeferred<void>();
    saveImplementation = () => pending.promise;
    store.selectAlert('AL-001');

    const firstSave = store.resolveAlert('AL-001', 'A valid note');
    expect(store.alerts()[0].status).toBe('RESOLVED');
    expect(store.selectedAlertIsSaving()).toBe(true);
    expect(store.savingAlertIds().has('AL-001')).toBe(true);

    await store.resolveAlert('AL-001', 'A duplicate note');
    expect(saveCalls).toHaveLength(1);

    pending.resolve();
    await firstSave;
    expect(store.savingAlertIds().has('AL-001')).toBe(false);
  });

  it('rolls back only its optimistic status and history entry after failure', async () => {
    const pending = createDeferred<void>();
    saveImplementation = () => pending.promise;
    const previousAlert = store.alerts()[0];
    const previousHistory = previousAlert.history;
    const unrelatedAlert = store.alerts()[1];
    store.selectAlert('AL-001');
    store.openResolveForm('AL-001');

    const save = store.resolveAlert('AL-001', 'A valid note');
    expect(store.alerts()[0].status).toBe('RESOLVED');
    expect(store.alerts()[0].history).toHaveLength(previousHistory.length + 1);

    store.alerts.update((current) =>
      current.map((alert) => (alert.id === 'AL-002' ? { ...alert, source: 'auth-svc' } : alert)),
    );
    pending.reject(new Error('Simulated save failure'));
    await expect(save).rejects.toThrow('Simulated save failure');

    expect(store.alerts()[0].status).toBe(previousAlert.status);
    expect(store.alerts()[0].history).toEqual(previousHistory);
    expect(store.alerts()[1].source).toBe('auth-svc');
    expect(store.savingAlertIds().has('AL-001')).toBe(false);
    expect(store.resolutionError()).toBe('Simulated save failure');
    expect(store.resolveFormAlertId()).toBe('AL-001');
    expect(unrelatedAlert.status).toBe(store.alerts()[1].status);
  });

  it('preserves a concurrent same-alert update while removing its failed optimistic history entry', async () => {
    const pending = createDeferred<void>();
    saveImplementation = () => pending.promise;
    const save = store.resolveAlert('AL-001', 'Temporary resolution note');

    store.alerts.update((current) =>
      current.map((alert) =>
        alert.id === 'AL-001'
          ? {
              ...alert,
              status: 'AUTO_CLOSED',
              history: [...alert.history, { state: 'AUTO_CLOSED', ts: '2026-08-17T20:10:00Z' }],
            }
          : alert,
      ),
    );
    pending.reject(new Error('Save failed'));
    await expect(save).rejects.toThrow('Save failed');

    expect(store.alerts()[0].status).toBe('AUTO_CLOSED');
    expect(store.alerts()[0].history.map((entry) => entry.state)).toEqual([
      'OPEN',
      'ESCALATED',
      'AUTO_CLOSED',
    ]);
  });

  it('keeps the resolution when filters change during a pending save', async () => {
    const pending = createDeferred<void>();
    saveImplementation = () => pending.promise;
    store.selectAlert('AL-001');

    const save = store.resolveAlert('AL-001', 'A valid note');
    store.setStatusFilter('RESOLVED');
    expect(store.filteredAlerts().map((alert) => alert.id)).toEqual(['AL-001']);

    pending.resolve();
    await save;

    expect(store.alerts()[0].status).toBe('RESOLVED');
    expect(store.filteredAlerts().map((alert) => alert.id)).toEqual(['AL-001']);
    expect(store.selectedAlert()?.status).toBe('RESOLVED');
  });

  it('clears a failed-save error and permits a successful retry', async () => {
    let attempt = 0;
    saveImplementation = () => {
      attempt += 1;
      return attempt === 1 ? Promise.reject(new Error('Temporary failure')) : Promise.resolve();
    };
    store.selectAlert('AL-001');
    store.openResolveForm('AL-001');

    await expect(store.resolveAlert('AL-001', 'Retry note')).rejects.toThrow('Temporary failure');
    expect(store.resolutionError()).toBe('Temporary failure');
    expect(store.alerts()[0].status).toBe('ESCALATED');
    expect(store.savingAlertIds().has('AL-001')).toBe(false);

    await store.resolveAlert('AL-001', 'Retry note');

    expect(store.resolutionError()).toBeNull();
    expect(store.alerts()[0].status).toBe('RESOLVED');
    expect(store.alerts()[0].history.at(-1)?.note).toBe('Retry note');
  });

  it('clears stale resolution errors when the form closes or another alert is selected', async () => {
    store.selectAlert('AL-001');
    store.openResolveForm('AL-001');
    saveImplementation = () => Promise.reject(new Error('Save failure'));
    await expect(store.resolveAlert('AL-001', 'A note')).rejects.toThrow('Save failure');
    expect(store.resolutionError()).toBe('Save failure');

    store.selectAlert('AL-002');
    expect(store.resolutionError()).toBeNull();
    store.openResolveForm('AL-002');
    store.closeResolveForm();
    expect(store.resolutionError()).toBeNull();
  });
});
