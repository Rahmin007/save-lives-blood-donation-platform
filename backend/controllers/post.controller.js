import Post from "../models/post.model.js";

import User from "../models/user.model.js";

import { sendNotifications } from "./notification.controller.js";

export const createPost = async (req, res) => {
  try {
    const { description, bloodGroup, location, quantity, urgency } = req.body;
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: "Location is required" });
    }
    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    const newPost = await Post.create({
      description,
      bloodGroup,
      location,
      quantity,
      user: req.user._id,
      urgency,
    });

    await sendNotifications(newPost);

    res.status(201).json({ post: newPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Post creation failed", error: error.message });
  }
};

//this is for the main feed
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ canceled: false })
      .sort({ createdAt: -1 })
      .populate("user", "name");

    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};

//this is for the user profile
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userPosts = await Post.find({ user: userId }) // Find by user reference
      .sort({ createdAt: -1 });
    res.status(200).json(userPosts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user posts", error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { postid } = req.params;
    const { description, pending, quantity } = req.body;

    const post = await Post.findById(postid);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (description !== undefined) {
      post.description = description;
    }

    if (pending !== undefined) {
      post.pending = pending;
    }
    if (quantity !== undefined) {
      post.quantity = quantity;
    }

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update post",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postid } = req.params;

    const post = await Post.findById(postid);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Post.findByIdAndDelete(postid);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

//this is for tracking status
//raz
export const getPostStatusofUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userPosts = await Post.find({ user: user._id })
      .sort({
        createdAt: -1,
      })
      .select("pending description");

    res.status(200).json(userPosts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user posts", error: error.message });
  }
};

//cancelling a post
//hjb
export const cancelPost = async (req, res) => {
  try {
    const { postid } = req.params;
    const post = await Post.findById(postid);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.canceled) {
      return res.status(400).json({ message: "Post already cancelled" });
    }

    post.canceled = true;
    post.canceledAt = new Date();

    await post.save();

    res.status(200).json({ message: "Post cancelled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cancel post", error: error.message });
  }
};
