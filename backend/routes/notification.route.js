import express from "express";
import { authenticateUser } from "../utils/auth.middleware.js";
import {
  getNotifications, markAllNotificationsAsRead,
  deleteSingleNotification, deleteAllNotifications,
} from "../controllers/notification.controller.js";
import { wrap } from "../utils/http.js";

const router = express.Router();

router.get("/getNotifications", authenticateUser, wrap(getNotifications));
router.patch("/markAllNotificationsAsRead", authenticateUser, wrap(markAllNotificationsAsRead));
router.delete("/deleteSingleNotification/:notificationId", authenticateUser, wrap(deleteSingleNotification));
router.delete("/deleteAllNotifications", authenticateUser, wrap(deleteAllNotifications));

export default router;
