import Post from "../models/post.model.js";
import { sendNotifications } from "./notification.controller.js";
import { BLOOD_GROUPS, URGENCY_LEVELS, canModify, fail, intInRange, isId, validCoords } from "../utils/http.js";

const AUTHOR_FIELDS = "name bloodGroup";

/** Loads a post and checks the current user may change it (owner or admin). */
const loadOwnPost = async (req, res) => {
  const { postid } = req.params;
  if (!isId(postid)) {
    fail(res, 400, "Invalid post.");
    return null;
  }
  const post = await Post.findById(postid);
  if (!post) {
    fail(res, 404, "Post not found.");
    return null;
  }
  if (!canModify(req.user, post.user)) {
    fail(res, 403, "You can only change your own posts.");
    return null;
  }
  return post;
};

export const createPost = async (req, res) => {
  const { description, bloodGroup, location, quantity, urgency = "Low" } = req.body;
  if (!String(description ?? "").trim()) return fail(res, 400, "Please describe the situation.");
  if (!BLOOD_GROUPS.includes(bloodGroup)) return fail(res, 400, "Please choose a valid blood group.");
  const bags = intInRange(quantity, 1, 10);
  if (bags === null) return fail(res, 400, "Quantity must be between 1 and 10 bags.");
  if (!URGENCY_LEVELS.includes(urgency)) return fail(res, 400, "Please choose an urgency level.");
  if (!validCoords(location?.latitude, location?.longitude)) return fail(res, 400, "Please choose a location on the map.");

  try {
    const post = await Post.create({
      description: String(description).trim(),
      bloodGroup,
      quantity: bags,
      urgency,
      location: { latitude: Number(location.latitude), longitude: Number(location.longitude) },
      user: req.user._id,
    });
    const notified = await sendNotifications(post);
    await post.populate("user", AUTHOR_FIELDS);
    res.status(201).json({ post, notifiedDonors: notified.length });
  } catch (error) {
    console.error("createPost", error);
    fail(res, 500, "Could not create the post. Please try again.");
  }
};

/** Main feed: open requests first, newest first. */
export const getAllPosts = async (_req, res) => {
  const posts = await Post.find({ canceled: false })
    .sort({ pending: -1, createdAt: -1 })
    .limit(200)
    .populate("user", AUTHOR_FIELDS);
  res.json(posts);
};

/** A user's own posts (profile page). Other people's cancelled posts stay private. */
export const getUserPosts = async (req, res) => {
  const { userId } = req.params;
  if (!isId(userId)) return fail(res, 400, "Invalid user.");
  const filter = { user: userId };
  if (!canModify(req.user, userId)) filter.canceled = false;
  const posts = await Post.find(filter).sort({ createdAt: -1 }).populate("user", AUTHOR_FIELDS);
  res.json(posts);
};

/** Edit description/quantity, or mark the request fulfilled (pending: false). */
export const updatePost = async (req, res) => {
  const post = await loadOwnPost(req, res);
  if (!post) return;
  const { description, pending, quantity } = req.body;

  if (description !== undefined) {
    if (!String(description).trim()) return fail(res, 400, "Description cannot be empty.");
    post.description = String(description).trim();
  }
  if (quantity !== undefined) {
    const bags = intInRange(quantity, 1, 10);
    if (bags === null) return fail(res, 400, "Quantity must be between 1 and 10 bags.");
    post.quantity = bags;
  }
  if (pending !== undefined) post.pending = Boolean(pending);

  await post.save();
  await post.populate("user", AUTHOR_FIELDS);
  res.json({ message: "Post updated", post });
};

export const deletePost = async (req, res) => {
  const post = await loadOwnPost(req, res);
  if (!post) return;
  await post.deleteOne();
  res.json({ message: "Post deleted" });
};

export const getPostStatusofUser = async (req, res) => {
  const posts = await Post.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("description pending canceled quantity bloodGroup urgency createdAt");
  res.json(posts);
};

export const cancelPost = async (req, res) => {
  const post = await loadOwnPost(req, res);
  if (!post) return;
  if (post.canceled) return fail(res, 400, "This post is already cancelled.");
  post.canceled = true;
  post.canceledAt = new Date();
  await post.save();
  res.json({ message: "Post cancelled", post });
};
