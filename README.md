# Save Lives — Blood Donation Platform

A full-stack web application that connects blood donors with people in need. Users can post blood requests, search for donors by blood group and location, manage blood bank requests, and communicate via real-time messaging.

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.io, JWT Authentication  
**Frontend:** React (Vite), Zustand (state management), React Router

## Features

- JWT-based authentication (access + refresh tokens via cookies)
- Create and manage blood request posts
- Search and filter donors by blood group, location, and availability
- Blood bank request management
- Real-time messaging with Socket.io
- Notification system
- Admin panel

## Project Structure

```
save-lives-blood-donation-platform/
├── backend/          # Express REST API + Socket.io server
│   ├── controllers/  # Route handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route definitions
│   └── utils/        # DB connection, auth middleware
└── frontend/         # React + Vite SPA
    └── src/
        ├── components/
        ├── pages/
        └── stores/   # Zustand state stores
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env      # Fill in your values
npm run dev               # Starts on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev               # Starts on http://localhost:5173
```

### Environment Variables (backend `.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_ORIGIN` | Allowed CORS origin |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/post` | Get all posts / Create post |
| PUT/DELETE | `/api/post/:id` | Update / Delete post |
| GET | `/api/searchFilter/donors` | Search donors by filters |
| GET/POST | `/api/bank` | Blood bank listings |
| POST | `/api/bank/request` | Submit bank request |
| GET | `/api/messages/:userId` | Get conversation |
| POST | `/api/messages/send/:userId` | Send message |
| GET | `/api/notification` | Get notifications |

## Pages

| Route | Description |
|---|---|
| `/` | Login |
| `/signup` | Register |
| `/home` | Feed with blood request posts |
| `/profile` | User profile & settings |
| `/messagepage` | Real-time chat |
| `/bankrequest` | Blood bank requests |
| `/adminpage` | Admin dashboard |
