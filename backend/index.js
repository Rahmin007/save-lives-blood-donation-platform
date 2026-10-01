import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import { createApp } from "./app.js";
import { initRealtime } from "./utils/realtime.js";
import { runStartupTasks } from "./utils/startup.js";

dotenv.config();

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}. See backend/.env.example.`);
  process.exit(1);
}

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  // Same origin in production; the Vite dev server proxies sockets in development.
  cors: process.env.NODE_ENV === "production"
    ? undefined
    : { origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173", credentials: true },
});
initRealtime(io);

const PORT = process.env.PORT || 3000;

try {
  await connectDB(); // connect first, so the first requests never hit a missing database
  await runStartupTasks();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (error) {
  console.error("Failed to start:", error.message);
  process.exit(1);
}
