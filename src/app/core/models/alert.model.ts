/* Shared alert types and dropdown options for the console.
   The generator, API service, store, and UI use these definitions. */
export const OPEN_STATUS = 'OPEN' as const;
export const ESCALATED_STATUS = 'ESCALATED' as const;
export const AUTO_CLOSED_STATUS = 'AUTO_CLOSED' as const;
export const RESOLVED_STATUS = 'RESOLVED' as const;

export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const STATUSES = [
  OPEN_STATUS,
  ESCALATED_STATUS,
  AUTO_CLOSED_STATUS,
  RESOLVED_STATUS,
] as const;
export const SOURCES = ['tracking-svc', 'billing-svc', 'auth-svc'] as const;
export const ALL_FILTER_VALUE = 'ALL' as const;

export type AlertSeverity = (typeof SEVERITIES)[number];
export type AlertStatus = (typeof STATUSES)[number];
export type AlertSource = (typeof SOURCES)[number];

export interface AlertHistoryEntry {
  state: AlertStatus;
  ts: string;
  note?: string;
}

export interface Alert {
  id: string;
  source: AlertSource;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  history: AlertHistoryEntry[];
}
