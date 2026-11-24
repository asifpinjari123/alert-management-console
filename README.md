# Alert Console — MoveInSync UI Developer Assignment

An Angular alert-management dashboard for operations teams. It presents mock system alerts in a filterable table, shows the selected alert's details and state history, and supports resolving eligible alerts with a required note.

## Features

- Generates 60 deterministic mock alerts locally at startup.
- Displays alert ID, source, severity, status, and creation time, sorted newest first.
- Provides combinable status, severity, and source filters using AND logic.
- Shows the filtered count, a clear-filters action, and an explicit empty state.
- Displays selected-alert metadata and its chronologically ordered history.
- Allows resolution only for `OPEN` and `ESCALATED` alerts.
- Requires a non-whitespace resolution note and shows a live character count.
- Simulates saving with an 800 ms delay and a 20% failure probability.
- Updates status and history optimistically; on failure, rolls back the operation's update and shows an inline error.
- Displays save progress, prevents duplicate submissions, and permits retry after a failed save.
- Uses a responsive two-panel desktop layout and stacks the panels on smaller screens.

## Technology

- Angular 21 with standalone components and TypeScript 5.9
- Angular Signals for feature state and derived values
- Angular Reactive Forms for the resolution note
- SCSS for component and global styling
- Vitest through Angular's unit-test builder
- No third-party UI component library

## Project Structure

```text
src/
├── main.ts                          # Application bootstrap
├── styles.scss                      # Global styles and design tokens
└── app/
    ├── app.component.*              # Root component
    ├── app.config.ts                # Application-wide providers
    ├── core/
    │   ├── models/alert.model.ts    # Alert types and option values
    │   ├── services/                # Mock load and simulated save service
    │   └── utils/                   # Deterministic alert generator
    ├── features/alert-console/
    │   ├── alert-console.page.*     # Main page and component composition
    │   ├── alert-console.store.ts   # Signals, filters, selection, resolution
    │   ├── alert-console.utils.ts   # Filtering, sorting, eligibility helpers
    │   └── components/              # Filter, table, detail, history, resolve form
    └── shared/
        ├── components/              # Empty state, spinner, severity/status chips
        └── validators/              # Whitespace-only note validator
```

The application is bootstrapped as a standalone Angular application. The console state is held in `AlertConsoleStore`; there is no configured application route or backend API.

## Getting Started

### Prerequisites

- Node.js compatible with the installed Angular CLI. The project does not pin a Node.js version.
- npm 10.8.2, as specified by the `packageManager` field.

### Install and run

```bash
git clone https://github.com/asifpinjari123/alert-management-console.git
cd alert-management-console
npm ci
npm start
```

The development server uses Angular CLI's default address: `http://localhost:4200/`.

### Build

```bash
npm run build
```

### Tests

```bash
npm test -- --watch=false
```

Tests are located beside the store, utility functions, mock API service, resolution form, and whitespace validator. They cover filtering and sorting, history ordering, resolution success/failure and rollback, simulated save outcomes, form validation, and resolution-form states.

## Architecture and Data Flow

1. `main.ts` bootstraps the standalone `AppComponent` with providers from `app.config.ts`.
2. `AlertConsoleStore` loads alerts through `AlertApiService`; the service calls `generateMockAlerts()`.
3. Store signals hold alerts, filters, selected alert, active saves, and form/error state. Computed signals derive filtered/sorted rows, counts, and selected-alert data.
4. `AlertConsolePageComponent` passes state to the filter bar, table, and detail panel, and forwards their events to the store.
5. Selecting a table row updates the selected alert ID; the detail panel reads the corresponding alert and displays its metadata and ordered history.
6. Resolving an alert immediately updates its status and adds a `RESOLVED` history entry. `AlertApiService` then simulates the save.
7. A successful save closes the form. A failed save removes that operation's optimistic history entry, restores the prior status when appropriate, and provides an inline error for retry.

### Alert model

An alert has an `id`, `source`, `severity`, `status`, ISO `createdAt` timestamp, and `history` array. Each history entry contains a state and timestamp, with an optional resolution note. The supported sources, severities, and statuses are defined in `src/app/core/models/alert.model.ts`.

## Implementation Notes

- Mock alerts are generated in memory from a seeded generator and are regenerated on page reload; they are not persisted.
- `AlertApiService` is a local mock service, not an HTTP API. The 800 ms delay and random failure are simulated in the browser.
- The resolution note's character count is informational; no maximum length is enforced.
- There is no authentication, backend, database, or external data persistence.
- The responsive table keeps its own horizontal scrolling area on narrow screens.

## Assignment

**Role:** UI Developer · **Company:** MoveInSync · **Assignment:** Alert Console — Filterable Table with Detail Panel
