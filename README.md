# DMND Competency Dashboard

Frontend competency app for Summer of Bitcoin built with React, TypeScript, Tailwind, React Router v6, and Recharts.

## Local Development

- Run frontend + mock backend together:
  - `npm start`
- Frontend only:
  - `npm run client`
- Mock backend only:
  - `npm run server`

Frontend runs on `http://localhost:3000` and mock backend runs on `http://localhost:4000`.

## Feature Mapping to DMND Spec

### Auth and Session
- Miner login: `POST /api/log_user`
- Broker login: `POST /api/broker/log`
- Session restore: `GET /api/check_auth`
- Logout: `POST /api/logout`
- Forgot password: `POST /api/forgot_password`
- Reset password: `POST /api/reset_password`

### Dashboard and Polling
- Live hashrate: `GET /api/user/hashrate` (5 min polling)
- Hashrate history chart: `GET /api/user/hashrate/history?duration=...` (5 min polling)

### Workers
- Worker table: `GET /api/workers?from=YYYY-MM-DD&to=YYYY-MM-DD`
- CSV export: client-side export from fetched worker rows

### Rewards
- Rewards summary and history: `GET /api/user/rewards` (mock endpoint for competency slice)

### Account and Sub-Accounts
- Permissions: `GET /api/user/permissions`
- Update BTC address with 2FA input: `POST /api/bitcoin_address`
- Sub-account list: `GET /api/user/sub_account`
- Create sub-account: `POST /api/user/sub_account`
- Switch sub-account session: `POST /api/log_subaccount`

### Broker Dashboard
- Broker miners table: `GET /api/broker/miners`

### Temporary Signup Endpoints (Demo-only, non-spec)
- Miner signup: `POST /api/register_user`
- Broker signup: `POST /api/register_broker`

## Mock Backend Endpoints

The mock server is implemented in `mock-server/index.js`.

- Spec-aligned:
  - `POST /api/log_user`
  - `POST /api/broker/log`
  - `GET /api/check_auth`
  - `POST /api/logout`
  - `POST /api/forgot_password`
  - `POST /api/reset_password`
  - `GET /api/user/hashrate`
  - `GET /api/user/hashrate/history`
  - `GET /api/workers`
  - `GET /api/user/permissions`
  - `POST /api/bitcoin_address`
  - `GET /api/user/sub_account`
  - `POST /api/user/sub_account`
  - `POST /api/log_subaccount`
  - `GET /api/broker/miners`
- Temporary demo-only signup endpoints:
  - `POST /api/register_user`
  - `POST /api/register_broker`

## Demo Credentials

- Miner
  - email: `miner@dmnd.local`
  - password: `miner123`
- Broker
  - email: `broker@dmnd.local`
  - password: `broker123`

## Competency Test Module

- Route: `/competency-test` (miner area)
- Public API source: CoinGecko BTC price endpoint
- Polling interval: 60 seconds
- Visualization: Recharts line chart
- Theme support: respects app dark/light toggle
- Gist-ready module file: `submission/competency-gist-content.tsx`
- Secret gist publish steps: `submission/GIST_INSTRUCTIONS.md`

## Deployment Notes

- Runtime API config:
  - `.env.development` and `.env.example` use `REACT_APP_API_BASE_URL`
- Nginx production template:
  - `deploy/nginx.conf`
- Productionization checklist:
  - `deploy/docker-next-steps.md`
