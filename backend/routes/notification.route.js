import express from "express";
import { authenticateUser } from "../utils/auth.middleware.js";

import {
  getNotifications,
  markAllNotificationsAsRead,
  deleteSingleNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/getNotifications", authenticateUser, getNotifications);
router.patch(
  "/markAllNotificationsAsRead",
  authenticateUser,
  markAllNotificationsAsRead
);
router.delete(
  "/deleteSingleNotification/:notificationId",
  authenticateUser,
  deleteSingleNotification
);
router.delete(
  "/deleteAllNotifications",
  authenticateUser,
  deleteAllNotifications
);

export default router;
