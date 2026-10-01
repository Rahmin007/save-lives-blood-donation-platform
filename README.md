# Save Lives — Blood Donation Platform

[![Live demo](https://img.shields.io/badge/LIVE%20DEMO-save--lives--na0t.onrender.com-c81e1e?style=for-the-badge)](https://save-lives-na0t.onrender.com)
[![CI](https://github.com/Rahmin007/save-lives-blood-donation-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Rahmin007/save-lives-blood-donation-platform/actions)

**▶ Try it: [save-lives-na0t.onrender.com](https://save-lives-na0t.onrender.com)**. Create a free account to explore.

> The demo runs on a free server that sleeps when nobody is using it, so the first visit can take about 50 seconds to wake up.

A full-stack web app that connects blood donors with people who need blood:
- Post a blood request; nearby donors with a matching blood group are notified instantly.
- Find donors near you and chat with them in real time.
- Request blood from blood banks, which admins approve or reject.

## How to try it

1. Open the [live demo](https://save-lives-na0t.onrender.com) and click **Create an account**.
2. **Home** shows blood requests from other users (a few sample requests are included).
   - Post your own with **Need blood? Post a request**.
   - Search donors by blood group and distance in **Find a donor**.
3. Click **Message** on a request to chat with that person in real time.
4. Open **Blood banks** to see banks on a map and request blood from one.
5. **Profile** shows your requests: mark them fulfilled or cancel them, and track your blood-bank requests.

**Tip:** open the site in a second browser (or an incognito window) with another account to see live chat and notifications arrive instantly.

There are two kinds of request:

| | Blood request post | Blood bank request |
| --- | --- | --- |
| Where | Home → *Need blood? Post a request* | Blood banks → *Send request* |
| Who sees it | Everyone, in the public feed | Admins, in the dashboard |
| Who is notified | Donors within 5 km with the same blood group | Admins; then the user, when it's approved or rejected |

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4 + DaisyUI, Zustand, React Router, Leaflet maps |
| Backend | Node.js, Express, Socket.io, JWT in httpOnly cookies, bcrypt, rate limiting |
| Database | MongoDB with Mongoose (geospatial queries for "nearby donors") |
| Hosting | Render (one service serves both the API and the React site), MongoDB Atlas |
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

The live demo at **[save-lives-na0t.onrender.com](https://save-lives-na0t.onrender.com)** runs on one free Render web service. It builds the React app and serves it together with the API, so the site and API share one domain and login cookies just work. The database is a free MongoDB Atlas cluster.

To deploy your own copy, see **[docs/DEPLOY.md](docs/DEPLOY.md)**.