# StudyFlow

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Live](https://img.shields.io/badge/Live-App-0EA5E9?logo=vercel&logoColor=white)](https://study-flow-theta.vercel.app)
[![API](https://img.shields.io/badge/API-Render-10B981?logo=render&logoColor=white)](https://studyflow-p02q.onrender.com/api)
[![Repo](https://img.shields.io/badge/GitHub-Repo-181717?logo=github&logoColor=white)](https://github.com/oy24553/StudyFlow)

## Project Overview
A modern full‑stack study tracker built with Node.js, Express, MongoDB, and React. Supports standard and Pomodoro timers, weekly trends, and a 7×24 heatmap.

## Tech Stack
- Backend: Node.js, Express.js, MongoDB (Atlas), Mongoose, JWT, bcrypt, Helmet
- Frontend: React (Vite), Tailwind CSS
- Tooling: dotenv, CORS, express‑rate‑limit

## Features
- Auth: email + password (JWT)
- Two study modes: normal timer and configurable Pomodoro
- Course Management: create, edit, pick; link every session to a course
- Analytics: 7‑day line chart, 7×24 heatmap, consecutive‑days streak
- Team rooms: create/join rooms and sync real‑time focus/break status (Socket.IO)
- Advanced analytics:
  - Longer-term trend (daily/weekly/monthly buckets)
  - Top courses by study minutes
  - Study method breakdown (deep / pomodoro / review)

### Demo Mode (one‑click)
- On the login page, click "Demo Login" to enter directly — no signup needed.
- Default credentials (also used for auto‑seed): `demo@demo.com` / `123456`.
- Env overrides (backend): `DEMO_EMAIL`, `DEMO_PASSWORD`, `DEMO_NAME`.

## Installation
```bash
# Prerequisites
# - Node.js 18+
# - A MongoDB instance (recommended: MongoDB Atlas free tier)
# - npm or pnpm

# Start backend
cd StudyFlow/backend
npm install
npm run dev

# Start frontend
cd StudyFlow/frontend
npm install
npm run dev
```

## ENV
- Create `backend/.env`:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=change_me_to_a_strong_random_value
CORS_ORIGIN=http://localhost:5173
# Optional: timezone used by some stats endpoints (default: UTC)
STATS_TZ=UTC
```

- Create `frontend/.env`:
```env
VITE_API_BASE=http://localhost:4000/api
# Optional: Socket.IO server URL (useful when frontend & backend are on different domains)
VITE_WS_URL=http://localhost:4000
```

## Endpoints (stats)
- `GET /api/stats/study-7d` — last 7 days minutes by day.
- `GET /api/stats/study-heatmap?from&to` — minutes by ISO day‑of‑week (1..7) and hour (0..23).
- `GET /api/stats/study-by-hour?from&to` — total minutes by hour.
- `GET /api/stats/course-top?from&to&limit` — top courses by minutes.
- `GET /api/stats/method-breakdown?from&to` — minutes breakdown by method.
- `GET /api/stats/study-series?from&to&bucket=day|week|month&tz` — generic time series.

## Endpoints (rooms)
- `GET /api/rooms` — list rooms you joined.
- `POST /api/rooms` — create a room `{ name }`.
- `POST /api/rooms/join` — join a room by invite code `{ inviteCode }`.
- `GET /api/rooms/:id` — room details and members (requires membership).

### Real‑time (Socket.IO)
- Connect with auth token (JWT) and join a room:
  - Event: `join_room` payload `{ roomId }`
  - Server broadcasts: `presence` array of `{ userId, status, phase, remainSec, updatedAt }`
- Presence is currently in-memory (single server instance). For multi-instance deployments, add a shared adapter (e.g. Redis) and persist presence.

## Styling (Tailwind CSS)
The frontend uses Tailwind. Classes are composed via `@apply` in `src/index.css` so JSX stays minimal. Config files:
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
