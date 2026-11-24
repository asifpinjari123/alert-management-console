import { DestroyableInjector, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ALERT_SAVE_RANDOM,
  AlertApiService,
  FAILURE_RATE,
  SAVE_DELAY_MS,
} from './alert-api.service';

describe('AlertApiService.saveResolution', () => {
  let injector: DestroyableInjector;

  afterEach(() => {
    vi.useRealTimers();
    injector.destroy();
  });

  it('resolves after the configured delay when the injected random value passes', async () => {
    vi.useFakeTimers();
    injector = Injector.create({
      providers: [AlertApiService, { provide: ALERT_SAVE_RANDOM, useValue: () => FAILURE_RATE }],
    });
    const service = runInInjectionContext(injector, () => injector.get(AlertApiService));
    let settled = false;
    const save = service.saveResolution('AL-001', 'A valid note').then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS - 1);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(save).resolves.toBeUndefined();
    expect(settled).toBe(true);
  });

  it('rejects deterministically when the injected random value is below the failure rate', async () => {
    vi.useFakeTimers();
    injector = Injector.create({
      providers: [
        AlertApiService,
        { provide: ALERT_SAVE_RANDOM, useValue: () => FAILURE_RATE - 0.01 },
      ],
    });
    const service = runInInjectionContext(injector, () => injector.get(AlertApiService));
    const save = service.saveResolution('AL-001', 'A valid note');
    const rejection = expect(save).rejects.toThrow('Could not resolve alert AL-001.');

    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS);

    await rejection;
  });
});
