import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import bankRoute from "./routes/bank.route.js";
import searchFilterRoute from "./routes/searchFilter.route.js";
import messageRoute from "./routes/message.route.js";
import notificationRoute from "./routes/notification.route.js";

// Works on Windows, macOS and Linux (the old URL().pathname broke on Windows).
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Builds the Express app (kept separate from the server so tests can import it). */
export const createApp = () => {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";

  app.set("trust proxy", 1); // Render/Heroku-style proxies: real client IPs for rate limiting
  app.disable("x-powered-by");

  // In production the frontend is served by this same server, so CORS is only needed in dev.
  if (!isProd) {
    app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173", credentials: true }));
  }
  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));

  // Slow down password guessing and sign-up spam.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT || 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please wait a few minutes and try again." },
  });
  app.use(["/api/auth/login", "/api/auth/signup"], authLimiter);

  app.get("/api/health", (_req, res) => {
    const up = mongoose.connection.readyState === 1;
    res.status(up ? 200 : 503).json({ status: up ? "ok" : "degraded", database: up ? "connected" : "disconnected" });
  });

  app.use("/api/auth", authRoute);
  app.use("/api/post", postRoute);
  app.use("/api/bank", bankRoute);
  app.use("/api/searchFilter", searchFilterRoute);
  app.use("/api/messages", messageRoute);
  app.use("/api/notification", notificationRoute);

  // Unknown API routes get JSON, not the React page.
  app.use("/api", (_req, res) => res.status(404).json({ message: "Not found" }));

  if (isProd) {
    const dist = path.join(__dirname, "../frontend/dist");
    app.use(express.static(dist, { maxAge: "1h", index: false }));
    app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }

  // Last-resort error handler: never leak stack traces to users.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body." });
    res.status(500).json({ message: "Something went wrong. Please try again." });
  });

  return app;
};
