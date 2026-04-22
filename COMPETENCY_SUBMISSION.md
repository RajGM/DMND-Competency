# DMND Dashboard Competency Submission

This document explains what is implemented in this repository for the Summer of Bitcoin competency test, how it satisfies the stated requirements, and how it complements the main DMND miner dashboard project.

## Project Context

This repository contains a competency-focused frontend prototype built with:

- React
- TypeScript
- React Router v6
- Tailwind CSS
- Recharts
- TanStack Query

The app is structured to demonstrate production-minded frontend engineering patterns while remaining scoped to competency submission goals.

## Competency Requirements Mapping

### 1) Build a React + TypeScript web app using a public API

Implemented in:

- `src/pages/CompetencyTestPage.tsx`

Public API used:

- CoinGecko Simple Price API
- `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`

Behavior:

- Fetches current Bitcoin USD price from a public endpoint.
- Displays the latest value in a clean card-based interface.

### 2) Auto-refresh every minute without user interaction

Implemented in:

- `src/pages/CompetencyTestPage.tsx`

Mechanism:

- TanStack Query polling via `refetchInterval: 60_000`.

Result:

- Data refreshes in the background every minute automatically.

### 3) Include a chart to show changes over time

Implemented in:

- `src/pages/CompetencyTestPage.tsx`

Charting stack:

- Recharts `LineChart` with `Line`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`.

Result:

- Users can visually interpret trend direction and relative movement over time.

## Where to Access the Competency Feature

- Route: `/competency-test`
- Route wiring: `src/App.tsx`
- Navigation entry: `src/components/AppLayout.tsx` (miner menu)

## How This Complements the Main DMND Project

The competency module is intentionally aligned with the same architectural and UX patterns used by the broader DMND dashboard implementation.

### Architectural alignment

- Shared provider model for app-wide concerns:
  - `src/index.tsx` wires Query provider, theme provider, auth provider, and router.
- Typed API boundaries:
  - `src/lib/apiClient.ts`
  - `src/types/api.ts`
- Reusable UI composition:
  - `src/components/Card.tsx`
  - `src/components/AppLayout.tsx`

### Product-aligned behaviors

- Dark/light theming with persistence:
  - `src/theme/ThemeProvider.tsx`
- Role-aware protected routes:
  - `src/auth/AuthProvider.tsx`
  - `src/auth/guards.tsx`
- Background polling patterns also used in dashboard pages:
  - `src/pages/DashboardPage.tsx`
  - `src/pages/WorkersPage.tsx`
  - `src/pages/RewardsPage.tsx`

### Why this matters for DMND

The competency module validates the exact capabilities required for the full dashboard:

- integrating external APIs,
- building live-updating interfaces,
- visualizing data clearly,
- and maintaining scalable frontend architecture.

## Software Engineering Practices Used

### Type safety and API contracts

- TypeScript interfaces define request/response expectations.
- Domain models are centralized under `src/types/api.ts`.

### Separation of concerns

- API calls are centralized in `src/lib/apiClient.ts`.
- Presentation logic remains in page/components.
- Cross-cutting concerns (theme/auth/query) are in providers.

### Reusability and consistency

- Shared layout and card primitives reduce duplication.
- Standardized route guards enforce access patterns.

### Reliability and maintainability

- Polling intervals are explicit and centralized at query usage points.
- Error and loading states are handled in data pages.
- Mock backend enables stable local development and demos:
  - `mock-server/index.js`

### Environment-based configuration

- API base URL is driven by environment variables:
  - `.env.development`
  - `.env.example`

## Related Delivery Artifacts in This Repo

- Competency page implementation:
  - `src/pages/CompetencyTestPage.tsx`
- Gist-ready extracted module:
  - `submission/competency-gist-content.tsx`
- Secret gist publishing instructions:
  - `submission/GIST_INSTRUCTIONS.md`
- Feature-to-endpoint mapping and run instructions:
  - `README.md`
- Mock backend for local end-to-end auth/data flows:
  - `mock-server/index.js`

## Local Run Instructions

From repo root:

- `npm install`
- `npm start`

Services:

- Frontend: `http://localhost:3000`
- Mock backend: `http://localhost:4000`

## Conclusion

This competency implementation demonstrates the required React + TypeScript + polling + charting workflow using a public API, while fitting naturally into the broader DMND dashboard architecture. It is intentionally structured so the same patterns can be extended into full production features with minimal rework.
