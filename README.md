# StudyFlow

Badges: MongoDB · Node.js · React · Vite

## Project Overview
A modern full‑stack study tracker built with Node.js, Express, MongoDB, and React. It supports both normal timing and Pomodoro sessions, provides weekly trends and a 7×24 heatmap, and stores all data securely in MongoDB.

## Tech Stack
- Backend: Node.js, Express.js, MongoDB (Atlas), Mongoose, JWT, bcrypt, Helmet
- Frontend: React (Vite), Tailwind CSS
- Tooling: dotenv, CORS, express‑rate‑limit

## Features
- Auth: email + password (JWT)
- Two study modes: normal timer and configurable Pomodoro
- Course Management: create, edit, pick; link every session to a course
- Analytics: 7‑day line chart, 7×24 heatmap, consecutive‑days streak

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
```

- Create `frontend/.env`:
```env
VITE_API_BASE=http://localhost:4000/api
```

## Styling (Tailwind CSS)
The frontend uses Tailwind. Classes are composed via `@apply` in `src/index.css` so JSX stays minimal. Config files:
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`

