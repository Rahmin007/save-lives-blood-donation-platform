import { io } from "socket.io-client";
import { api } from "./api";

/** One live connection per signed-in session, shared by chat and notifications. */
let socket = null;

export const connectSocket = () => {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || undefined, { withCredentials: true });
  // The server checks the login cookie; if it expired, refresh it and reconnect.
  socket.on("connect_error", async (err) => {
    if (err.message !== "unauthorized") return;
    try {
      await api.post("/auth/refreshAccessToken");
      socket?.connect();
    } catch {
      /* logged out: the auth store handles it */
    }
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
