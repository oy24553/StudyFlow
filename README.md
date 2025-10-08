# StudyFlow

![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)


## Project Overview
A modern full-stack study tracker built with Node.js, Express, MongoDB, and React.It supports both **normal timing** and **Pomodoro sessions**, provides detailed weekly trends and heatmaps, and stores all your data securely in MongoDB.

## Tech stack
- **Backend**: Node.js, Express.js, MongoDB (Atlas), Mongoose, JWT, bcrypt
- **Frontend**: React (Vite)
- **Tooling**: dotenv, helmet
---

## Features

- **Auth**: email + password (JWT)
- **Two study modes**:
   - Normal Timer — start & stop freely 
   - Pomodoro Timer — automatic focus and break cycles

- **Course Management**: Create, edit, and select courses. Link every study session to a specific course

- **Dashboard Analytics**: Weekly total time & continuous streaks. 7-day line chart of study minutes. 7×24 heatmap showing your most productive hours


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