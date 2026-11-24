/* Owns alert data, filters, selection, and resolution actions.
   AlertConsolePage reads its signals and forwards user actions. */
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Alert,
  AlertHistoryEntry,
  AlertSeverity,
  AlertSource,
  AlertStatus,
  ALL_FILTER_VALUE,
  RESOLVED_STATUS,
} from '../../core/models/alert.model';
import { AlertApiService } from '../../core/services/alert-api.service';
import { AlertFilters, filterAlerts, isResolvable, sortNewestFirst } from './alert-console.utils';

const EMPTY_FILTERS: AlertFilters = {
  status: ALL_FILTER_VALUE,
  severity: ALL_FILTER_VALUE,
  source: ALL_FILTER_VALUE,
};

@Injectable({ providedIn: 'root' })
export class AlertConsoleStore {
  private readonly alertApi = inject(AlertApiService);
  // Distinguishes the save whose rollback may still update this alert.
  private readonly activeResolutionOperations = new Map<string, symbol>();

  // Keep source data and transient UI state canonical; the view values below are derived.
  readonly alerts = signal<Alert[]>(this.alertApi.loadAlerts());
  readonly filters = signal<AlertFilters>({ ...EMPTY_FILTERS });
  readonly selectedAlertId = signal<string | null>(null);
  readonly savingAlertIds = signal<Set<string>>(new Set());
  readonly resolveFormAlertId = signal<string | null>(null);
  readonly resolutionError = signal<string | null>(null);

  // Derive table and detail values rather than maintaining duplicate state.
  readonly filteredAlerts = computed(() =>
    sortNewestFirst(filterAlerts(this.alerts(), this.filters())),
  );
  readonly totalCount = computed(() => this.alerts().length);
  readonly filteredCount = computed(() => this.filteredAlerts().length);
  readonly selectedAlert = computed(
    () => this.alerts().find((alert) => alert.id === this.selectedAlertId()) ?? null,
  );
  readonly selectedAlertIsSaving = computed(() => {
    const alert = this.selectedAlert();
    return alert ? this.savingAlertIds().has(alert.id) : false;
  });
  readonly hasActiveFilters = computed(() => {
    const filters = this.filters();
    return (
      filters.status !== ALL_FILTER_VALUE ||
      filters.severity !== ALL_FILTER_VALUE ||
      filters.source !== ALL_FILTER_VALUE
    );
  });

  setFilter<K extends keyof AlertFilters>(filter: K, value: AlertFilters[K]): void {
    this.filters.update((currentFilters) => ({ ...currentFilters, [filter]: value }));
  }

  clearFilters(): void {
    this.filters.set({ ...EMPTY_FILTERS });
  }

  selectAlert(id: string): void {
    this.selectedAlertId.set(id);
    this.resolveFormAlertId.set(null);
    this.resolutionError.set(null);
  }

  openResolveForm(id: string): void {
    this.resolveFormAlertId.set(id);
    this.resolutionError.set(null);
  }

  closeResolveForm(): void {
    this.resolveFormAlertId.set(null);
    this.resolutionError.set(null);
  }

  async resolveAlert(id: string, note: string): Promise<void> {
    const trimmedNote = note.trim();
    if (!trimmedNote) {
      throw new Error('A resolution note is required.');
    }

    const previousAlert = this.alerts().find((currentAlert) => currentAlert.id === id);
    if (!previousAlert || !isResolvable(previousAlert)) {
      return;
    }

    if (this.savingAlertIds().has(id)) {
      return;
    }

    // Apply the optimistic status and history entry before awaiting the simulated save.
    const operationToken = Symbol(id);
    const resolutionEntry: AlertHistoryEntry = {
      state: RESOLVED_STATUS,
      ts: new Date().toISOString(),
      note: trimmedNote,
    };

    this.activeResolutionOperations.set(id, operationToken);
    this.savingAlertIds.update((savingIds) => new Set(savingIds).add(id));
    if (this.resolveFormAlertId() === id) {
      this.resolutionError.set(null);
    }

    this.alerts.update((alerts) =>
      alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status: RESOLVED_STATUS,
              history: [...alert.history, resolutionEntry],
            }
          : alert,
      ),
    );

    try {
      await this.alertApi.saveResolution(id, trimmedNote);
      if (this.resolveFormAlertId() === id) {
        this.closeResolveForm();
      }
    } catch (error: unknown) {
      const isCurrentOperation = this.activeResolutionOperations.get(id) === operationToken;
      this.alerts.update((alerts) =>
        alerts.map((currentAlert) => {
          if (currentAlert.id !== id) {
            return currentAlert;
          }

          const stillHasOptimisticEntry = currentAlert.history.includes(resolutionEntry);
          // Remove only this attempt's entry, and do not overwrite a newer status transition.
          return {
            ...currentAlert,
            status:
              isCurrentOperation &&
              currentAlert.status === RESOLVED_STATUS &&
              stillHasOptimisticEntry
                ? previousAlert.status
                : currentAlert.status,
            history: stillHasOptimisticEntry
              ? currentAlert.history.filter((entry) => entry !== resolutionEntry)
              : currentAlert.history,
          };
        }),
      );

      if (this.selectedAlertId() === id && this.resolveFormAlertId() === id) {
        this.resolutionError.set(
          error instanceof Error ? error.message : 'The alert could not be resolved.',
        );
      }
      throw error;
    } finally {
      if (this.activeResolutionOperations.get(id) === operationToken) {
        this.activeResolutionOperations.delete(id);
      }
      this.savingAlertIds.update((savingIds) => {
        const remainingIds = new Set(savingIds);
        remainingIds.delete(id);
        return remainingIds;
      });
    }
  }

  setStatusFilter(value: AlertStatus | typeof ALL_FILTER_VALUE): void {
    this.setFilter('status', value);
  }

  setSeverityFilter(value: AlertSeverity | typeof ALL_FILTER_VALUE): void {
    this.setFilter('severity', value);
  }

  setSourceFilter(value: AlertSource | typeof ALL_FILTER_VALUE): void {
    this.setFilter('source', value);
  }
}
