# Save Lives — Blood Donation Platform

[![CI](https://github.com/Rahmin007/save-lives-blood-donation-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Rahmin007/save-lives-blood-donation-platform/actions)

**▶ Live demo: _add your Render URL here_**

> Hosted on a free server that sleeps when unused, so the first visit can take about 50 seconds to wake up.

A full-stack web app that connects blood donors with people who need blood:
- Post a blood request; nearby donors with a matching blood group are notified instantly.
- Find donors near you and chat with them in real time.
- Request blood from blood banks, which admins approve or reject.

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4 + DaisyUI, Zustand, React Router, Leaflet maps |
| Backend | Node.js, Express, Socket.io, JWT in httpOnly cookies, bcrypt, rate limiting |
| Database | MongoDB with Mongoose (geospatial queries for "nearby donors") |
| Tests | Node test runner + Supertest (21 API tests), GitHub Actions CI with MongoDB |

## Features

- **Blood requests:** a step-by-step form with blood group, bags, urgency and location on a map (or "Use my location").
  - Matching donors within 5 km get a live notification.
  - Owners can mark a request **fulfilled**, cancel it or edit it.
- **Donor search:** by blood group and distance (1–25 km), nearest first, with call and message buttons.
- **Real-time chat:**
  - Conversations sorted by latest message, with unread counts.
  - Messages are delivered instantly to every open tab.
  - Socket connections are authenticated with the login cookie.
- **Blood banks:**
  - A map with the stock for each blood group.
  - Users request blood; admins approve (stock is reduced atomically) or reject.
  - Users see the status and get a notification.
- **Admin dashboard:** request queue, stock editor, search by blood group, bank map, notifications.
- **Accounts:**
  - Secure cookies with automatic session refresh.
  - Validated sign-up and profile editing.
  - BMI shown on the profile.

## Security

- Users can only change or delete **their own** posts and notifications (admins can moderate).
- Password hashes are never sent to the browser. User listings are admin-only.
- Login and sign-up are rate-limited, and errors don't reveal whether an email is registered.
- All input is validated on the server; API errors never expose stack traces.

## Project structure

```
backend/
  index.js            starts the server (DB connection, Socket.io, startup tasks)
  app.js              Express app: routes, rate limits, serves the React build in production
  controllers/        request handlers (auth, posts, banks, messages, notifications, search)
  models/             Mongoose schemas
  utils/              auth middleware, realtime (Socket.io rooms), validation helpers, startup seeding
  tests/              API tests
frontend/src/
  lib/                shared API client (auto session refresh), socket, map + format helpers
  stores/             Zustand stores
  pages/ components/  UI
render.yaml           one-click deploy on Render
```

## Run locally

You need **Node.js 20+** and a **MongoDB** connection string (a free Atlas cluster works, or a local MongoDB).

```bash
# 1. Backend (terminal 1)
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ADMIN_EMAILS
npm run dev                 # http://localhost:3000

# 2. Frontend (terminal 2)
cd frontend
npm install
npm run dev                 # http://localhost:5173 (API calls are proxied to :3000)
```

Blood banks are added automatically on first start. Sign up with an email listed in `ADMIN_EMAILS` to get the admin dashboard.

**Tests:** run `npm test` in `backend/`. It needs MongoDB; set `MONGO_URI_TEST` if it isn't on localhost.

## Deploy

One Render web service builds the React app and serves it together with the API (same domain, so login cookies just work). See **[docs/DEPLOY.md](docs/DEPLOY.md)**.
