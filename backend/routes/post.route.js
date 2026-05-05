import express from "express";
import {
  createPost,
  getAllPosts,
  getUserPosts,
  updatePost,
  deletePost,
  getPostStatusofUser,
  cancelPost,
} from "../controllers/post.controller.js";

import { authenticateUser } from "../utils/auth.middleware.js";

const router = express.Router();

router.post("/createPost", authenticateUser, createPost);
router.get("/getAllPosts", authenticateUser, getAllPosts);
router.get("/getUserPosts/:userId", authenticateUser, getUserPosts);
router.patch("/updatePost/:postid", authenticateUser, updatePost);
router.delete("/deletePost/:postid", authenticateUser, deletePost);
router.get("/getPostStatusofUser", authenticateUser, getPostStatusofUser); //raz
router.patch("/:postid/cancel", authenticateUser, cancelPost); //hjb
export default router;
