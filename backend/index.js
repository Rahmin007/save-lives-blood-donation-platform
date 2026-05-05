import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import path from "path";

// routes
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import bankRoute from "./routes/bank.route.js";
import searchFilterRoute from "./routes/searchFilter.route.js";
import messageRoute from "./routes/message.route.js";
import notificationRoute from "./routes/notification.route.js";

dotenv.config();

// Resolve __dirname for ES modules (works on Windows/macOS/Linux)
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
const server = http.createServer(app);

// 🔑 CORS & cookies MUST be set BEFORE routes
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? (process.env.FRONTEND_ORIGIN || "https://save-lives-9yue.onrender.com")
    : (process.env.FRONTEND_ORIGIN || "http://localhost:5173");

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Socket.io with same origin policy
const io = new Server(server, {
  cors: { origin: allowedOrigin, credentials: true },
});

// API routes
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/bank", bankRoute);
app.use("/api/searchFilter", searchFilterRoute);
app.use("/api/messages", messageRoute);
app.use("/api/notification", notificationRoute);

// Serve static frontend files ONLY in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// --- socket users map ---
const users = new Map();
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    users.set(userId, socket.id);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        text,
        createdAt: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// Start server and connect DB
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
