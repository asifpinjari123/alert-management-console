import { describe, expect, it } from 'vitest';
import { OPEN_STATUS, SEVERITIES, SOURCES, STATUSES } from '../models/alert.model';
import { generateMockAlerts } from './mock-alert-generator';

describe('generateMockAlerts', () => {
  it('creates 60 deterministic alerts with valid IDs, sources, severities, and statuses', () => {
    const alerts = generateMockAlerts();

    expect(alerts).toHaveLength(60);
    expect(alerts[0].id).toBe('AL-001');
    expect(alerts.at(-1)?.id).toBe('AL-060');
    expect(alerts).toEqual(generateMockAlerts());
    expect(new Set(alerts.map((alert) => alert.id)).size).toBe(60);
    expect(new Set(alerts.map((alert) => alert.source))).toEqual(new Set(SOURCES));
    expect(new Set(alerts.map((alert) => alert.severity))).toEqual(new Set(SEVERITIES));
    expect(new Set(alerts.map((alert) => alert.status))).toEqual(new Set(STATUSES));
    expect(alerts.every((alert) => alert.history[0]?.state === OPEN_STATUS)).toBe(true);
  });

  it('includes the required AL-042 billing escalation example', () => {
    const alert = generateMockAlerts().find((item) => item.id === 'AL-042');

    expect(alert).toMatchObject({
      source: 'billing-svc',
      severity: 'HIGH',
      status: 'ESCALATED',
    });
    expect(alert?.history.map((entry) => entry.state)).toEqual(['OPEN', 'ESCALATED']);
  });
});
