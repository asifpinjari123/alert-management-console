/* Creates the deterministic mock alerts used by the console.
   AlertApiService calls this when the store loads its data. */
import {
  Alert,
  AlertHistoryEntry,
  AlertSeverity,
  AlertSource,
  AlertStatus,
  AUTO_CLOSED_STATUS,
  ESCALATED_STATUS,
  OPEN_STATUS,
  RESOLVED_STATUS,
  SEVERITIES,
  SOURCES,
  STATUSES,
} from '../models/alert.model';

const ALERT_COUNT = 60;
const RANDOM_SEED = 42042;
const DAYS_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const MOCK_REFERENCE_TIME = Date.UTC(2026, 10, 23, 12, 0, 0);

export function generateMockAlerts(): Alert[] {
  const random = createSeededRandom(RANDOM_SEED);

  return Array.from({ length: ALERT_COUNT }, (_, index) => {
    const alertNumber = index + 1;
    const id = `AL-${String(alertNumber).padStart(3, '0')}`;
    const createdAt = new Date(
      MOCK_REFERENCE_TIME - DAYS_IN_MILLISECONDS * (random() * 14),
    ).toISOString();
    const severity = SEVERITIES[index % SEVERITIES.length];
    const status = STATUSES[Math.floor(index / SEVERITIES.length) % STATUSES.length];
    const source = SOURCES[Math.floor(random() * SOURCES.length)];

    if (alertNumber === 42) {
      return createAlert(id, 'billing-svc', 'HIGH', ESCALATED_STATUS, createdAt, random);
    }

    return createAlert(id, source, severity, status, createdAt, random);
  });
}

function createAlert(
  id: string,
  source: AlertSource,
  severity: AlertSeverity,
  status: AlertStatus,
  createdAt: string,
  random: () => number,
): Alert {
  return {
    id,
    source,
    severity,
    status,
    createdAt,
    history: createHistory(status, createdAt, random),
  };
}

function createHistory(
  status: AlertStatus,
  createdAt: string,
  random: () => number,
): AlertHistoryEntry[] {
  const history: AlertHistoryEntry[] = [{ state: OPEN_STATUS, ts: createdAt }];
  const openedAt = new Date(createdAt).getTime();
  const transitionAt = new Date(openedAt + 5 * 60 * 1000).toISOString();
  const resolvedAt = new Date(openedAt + 15 * 60 * 1000).toISOString();

  if (status === ESCALATED_STATUS || (status === RESOLVED_STATUS && random() > 0.5)) {
    history.push({ state: ESCALATED_STATUS, ts: transitionAt });
  }

  if (status === AUTO_CLOSED_STATUS) {
    history.push({ state: AUTO_CLOSED_STATUS, ts: transitionAt });
  }

  if (status === RESOLVED_STATUS) {
    history.push({
      state: RESOLVED_STATUS,
      ts: resolvedAt,
      note: 'Resolved during mock data generation',
    });
  }

  return history;
}

function createSeededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
