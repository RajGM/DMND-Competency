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

## Mock Backend Auth Endpoints

The mock server is implemented in `mock-server/index.js`.

- Spec-aligned:
  - `POST /api/log_user`
  - `POST /api/broker/log`
  - `GET /api/check_auth`
  - `POST /api/logout`
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
