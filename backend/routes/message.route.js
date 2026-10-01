import express from "express";
import { getUsers, getMessages, sendMessage } from "../controllers/message.controller.js";
import { authenticateUser } from "../utils/auth.middleware.js";
import { wrap } from "../utils/http.js";

const router = express.Router();

router.get("/users", authenticateUser, wrap(getUsers));
router.get("/:userId", authenticateUser, wrap(getMessages));
router.post("/", authenticateUser, wrap(sendMessage));

export default router;
