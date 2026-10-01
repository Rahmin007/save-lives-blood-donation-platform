// Small helpers shared by the controllers.
import mongoose from "mongoose";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const URGENCY_LEVELS = ["High", "Medium", "Low"];

/** Sends a JSON error with a consistent shape. */
export const fail = (res, status, message) => res.status(status).json({ message });

/** True when `id` is a valid MongoDB ObjectId string. */
export const isId = (id) => mongoose.isValidObjectId(id);

/** Parses a whole number within [min, max]; returns null if invalid. */
export const intInRange = (value, min, max) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/** True when (lat, lng) are real coordinates. */
export const validCoords = (lat, lng) =>
  Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) &&
  Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;

/** Owner of a document, or an admin. */
export const canModify = (user, ownerId) =>
  user.role === "admin" || String(ownerId) === String(user._id);

/** Express 4 doesn't catch errors from async handlers (they would crash the server).
 *  Wrapping a handler forwards any error to the app's error handler instead. */
export const wrap = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
