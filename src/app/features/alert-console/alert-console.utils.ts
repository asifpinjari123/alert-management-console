/* Holds pure alert filtering and ordering functions.
   AlertConsoleStore uses these to derive the visible table rows. */
import {
  Alert,
  AlertHistoryEntry,
  AlertSeverity,
  AlertSource,
  AlertStatus,
  ALL_FILTER_VALUE,
  ESCALATED_STATUS,
  OPEN_STATUS,
} from '../../core/models/alert.model';

export interface AlertFilters {
  status: AlertStatus | typeof ALL_FILTER_VALUE;
  severity: AlertSeverity | typeof ALL_FILTER_VALUE;
  source: AlertSource | typeof ALL_FILTER_VALUE;
}

export function filterAlerts(alerts: Alert[], filters: AlertFilters): Alert[] {
  return alerts.filter((alert) => {
    const matchesStatus = filters.status === ALL_FILTER_VALUE || alert.status === filters.status;
    const matchesSeverity =
      filters.severity === ALL_FILTER_VALUE || alert.severity === filters.severity;
    const matchesSource = filters.source === ALL_FILTER_VALUE || alert.source === filters.source;

    return matchesStatus && matchesSeverity && matchesSource;
  });
}

export function sortNewestFirst(alerts: Alert[]): Alert[] {
  return [...alerts].sort(
    (firstAlert, secondAlert) =>
      new Date(secondAlert.createdAt).getTime() - new Date(firstAlert.createdAt).getTime(),
  );
}

export function sortHistoryChronologically(history: AlertHistoryEntry[]): AlertHistoryEntry[] {
  return history
    .map((entry, index) => ({ entry, index }))
    .sort(
      (first, second) =>
        new Date(first.entry.ts).getTime() - new Date(second.entry.ts).getTime() ||
        first.index - second.index,
    )
    .map(({ entry }) => entry);
}

export function isResolvable(alert: Alert): boolean {
  return alert.status === OPEN_STATUS || alert.status === ESCALATED_STATUS;
}
