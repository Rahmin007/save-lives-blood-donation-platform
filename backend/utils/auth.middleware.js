import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Reads the access-token cookie and attaches the user to req.user.
 * Expired or invalid tokens return 401, which tells the frontend to refresh
 * the session (the old code returned 403, so refresh never happened).
 */
const authenticateUser = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Please log in." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Please log in." });
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired." });
  }
};

/** Same as authenticateUser, but only lets admins through. */
const authenticateAdmin = (req, res, next) =>
  authenticateUser(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only." });
    }
    next();
  });

export { authenticateUser, authenticateAdmin };
