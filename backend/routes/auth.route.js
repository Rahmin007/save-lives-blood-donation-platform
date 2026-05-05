import express from "express";
import {
  signup, login, logout, getUserProfile,
  getAllUser, updateUser, refreshAccessToken,
  calculateBMI, createTestUser,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../utils/auth.middleware.js";

const router = express.Router();

router.get("/createTestUser", createTestUser); // TEMP - remove before GitHub upload

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refreshAccessToken", refreshAccessToken);
router.get("/getUserProfile", authenticateUser, getUserProfile);
router.get("/getAllUser", authenticateUser, getAllUser);
router.patch("/updateUser", authenticateUser, updateUser);
router.get("/calculateBmi", authenticateUser, calculateBMI);

export default router;
