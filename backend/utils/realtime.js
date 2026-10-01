// Socket.io helpers: each signed-in user joins a private room named after their id,
// so the server (not the browser) decides who receives what.
import jwt from "jsonwebtoken";

let io = null;

const readCookie = (header = "", name) => {
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

export const initRealtime = (server) => {
  io = server;
  io.use((socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, "accessToken");
      const { id } = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.data.userId = String(id);
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });
  io.on("connection", (socket) => {
    socket.join(socket.data.userId);
  });
};

/** Sends an event to every open tab of one user. */
export const emitToUser = (userId, event, payload) => {
  if (io) io.to(String(userId)).emit(event, payload);
};
