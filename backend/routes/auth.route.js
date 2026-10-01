import express from "express";
import {
  signup, login, logout, getUserProfile,
  getAllUser, updateUser, refreshAccessToken, calculateBMI,
} from "../controllers/auth.controller.js";
import { authenticateAdmin, authenticateUser } from "../utils/auth.middleware.js";
import { wrap } from "../utils/http.js";

const router = express.Router();

router.post("/signup", wrap(signup));
router.post("/login", wrap(login));
router.post("/logout", logout);
router.post("/refreshAccessToken", wrap(refreshAccessToken));
router.get("/getUserProfile", authenticateUser, getUserProfile);
router.get("/getAllUser", authenticateAdmin, wrap(getAllUser)); // was open to every user
router.patch("/updateUser", authenticateUser, wrap(updateUser));
router.get("/calculateBmi", authenticateUser, calculateBMI);

export default router;
