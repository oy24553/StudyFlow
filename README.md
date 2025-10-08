# Study-Fitness APP

![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![VSCode](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## Project Overview
Track your **study** and **workout** progress in one place. Create sessions, log workouts/sets, see 7-day trends, and view course top charts. Built as a learning-friendly, production-ready template.

## Tech stack
- **Backend**: Node.js, Express.js, MongoDB (Atlas), Mongoose, JWT, bcrypt
- **Frontend**: React (Vite)
- **Tooling**: dotenv, helmet
---

## Features

- **Auth**: email + password (JWT)
- **Study**: courses, study sessions, notes, methods (deep/pomodoro/review)
- **Workout**: workouts (push/pull/legs/…), exercise logs with sets (reps/weight/RPE)
- **Dashboard**: 7-day study time line chart, weekly totals, streaks
- **Stats**: quick aggregations (7-day study minutes, weekly workout counts)
- **CSV export** (study list)
- **CORS + security** (helmet, rate-limit)


## Installation
```bash
# Prerequisites
- Node.js **18+**
- A MongoDB instance (recommended: **MongoDB Atlas** free tier)
- npm or pnpm

# Start backend
cd study-fitness-app/backend

npm install

npm run dev

# Start frontend
cd study-fitness-app/frontend

npm install

npm run dev
```
## ENV
- Create backend/.env:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=change_me_to_a_strong_random_value
CORS_ORIGIN=http://localhost:5173
```
- Create frontend/.env:
```env
VITE_API_BASE=http://localhost:4000/api