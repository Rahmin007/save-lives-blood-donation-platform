import express from "express";
import {
  createPost, getAllPosts, getUserPosts, updatePost,
  deletePost, getPostStatusofUser, cancelPost,
} from "../controllers/post.controller.js";
import { authenticateUser } from "../utils/auth.middleware.js";
import { wrap } from "../utils/http.js";

const router = express.Router();

router.post("/createPost", authenticateUser, wrap(createPost));
router.get("/getAllPosts", authenticateUser, wrap(getAllPosts));
router.get("/getUserPosts/:userId", authenticateUser, wrap(getUserPosts));
router.get("/getPostStatusofUser", authenticateUser, wrap(getPostStatusofUser));
router.patch("/updatePost/:postid", authenticateUser, wrap(updatePost));
router.patch("/:postid/cancel", authenticateUser, wrap(cancelPost));
router.delete("/deletePost/:postid", authenticateUser, wrap(deletePost));

export default router;
