/* Provides mock alert loading and resolution saving.
   AlertConsoleStore uses it instead of a backend API. */
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Alert } from '../models/alert.model';
import { generateMockAlerts } from '../utils/mock-alert-generator';

export const SAVE_DELAY_MS = 800;
export const FAILURE_RATE = 0.2;
export const ALERT_SAVE_RANDOM = new InjectionToken<() => number>('ALERT_SAVE_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random,
});

@Injectable({ providedIn: 'root' })
export class AlertApiService {
  private readonly random = inject(ALERT_SAVE_RANDOM);

  loadAlerts(): Alert[] {
    return generateMockAlerts();
  }

  saveResolution(id: string, note: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!note.trim()) {
          reject(new Error(`A resolution note is required for ${id}.`));
          return;
        }

        if (this.random() < FAILURE_RATE) {
          reject(new Error(`Could not resolve alert ${id}.`));
          return;
        }

        resolve();
      }, SAVE_DELAY_MS);
    });
  }
}
