/* Tests the alert filtering and sorting helpers.
   The store depends on these pure functions for its table data. */
import { describe, expect, it } from 'vitest';
import { Alert, AlertHistoryEntry } from '../../core/models/alert.model';
import { filterAlerts, sortHistoryChronologically, sortNewestFirst } from './alert-console.utils';

const ALERTS: Alert[] = [
  {
    id: 'AL-001',
    source: 'tracking-svc',
    severity: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-08-17T20:00:00Z',
    history: [{ state: 'OPEN', ts: '2026-08-17T20:00:00Z' }],
  },
  {
    id: 'AL-002',
    source: 'billing-svc',
    severity: 'HIGH',
    status: 'ESCALATED',
    createdAt: '2026-08-17T22:00:00Z',
    history: [{ state: 'ESCALATED', ts: '2026-08-17T22:00:00Z' }],
  },
  {
    id: 'AL-003',
    source: 'auth-svc',
    severity: 'LOW',
    status: 'OPEN',
    createdAt: '2026-08-16T22:00:00Z',
    history: [{ state: 'OPEN', ts: '2026-08-16T22:00:00Z' }],
  },
];

describe('filterAlerts', () => {
  it('combines status and severity filters with AND semantics', () => {
    const results = filterAlerts(ALERTS, {
      status: 'OPEN',
      severity: 'HIGH',
      source: 'ALL',
    });

    expect(results.map((alert) => alert.id)).toEqual(['AL-001']);
  });

  it('returns all alerts when every filter is set to ALL', () => {
    const results = filterAlerts(ALERTS, {
      status: 'ALL',
      severity: 'ALL',
      source: 'ALL',
    });

    expect(results).toHaveLength(3);
  });
});

describe('sortNewestFirst', () => {
  it('orders alerts by createdAt without changing the input array', () => {
    const results = sortNewestFirst(ALERTS);

    expect(results.map((alert) => alert.id)).toEqual(['AL-002', 'AL-001', 'AL-003']);
    expect(ALERTS[0].id).toBe('AL-001');
  });

  it('returns an empty list when there are no alerts', () => {
    expect(sortNewestFirst([])).toEqual([]);
  });
});

describe('sortHistoryChronologically', () => {
  const history: AlertHistoryEntry[] = [
    { state: 'ESCALATED', ts: '2026-08-17T22:00:00Z' },
    { state: 'OPEN', ts: '2026-08-17T20:00:00Z' },
    { state: 'RESOLVED', ts: '2026-08-17T22:00:00Z', note: 'Resolved' },
  ];

  it('orders entries oldest-first without mutating the input array', () => {
    const sorted = sortHistoryChronologically(history);

    expect(sorted.map((entry) => entry.state)).toEqual(['OPEN', 'ESCALATED', 'RESOLVED']);
    expect(history[0].state).toBe('ESCALATED');
  });

  it('preserves original order for entries with equal timestamps', () => {
    const sorted = sortHistoryChronologically(history);

    expect(sorted.slice(1).map((entry) => entry.state)).toEqual(['ESCALATED', 'RESOLVED']);
  });
});
