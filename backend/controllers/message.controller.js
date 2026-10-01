import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { emitToUser } from "../utils/realtime.js";
import { fail, isId } from "../utils/http.js";

/** People you can message, with whoever you talked to most recently first. */
export const getUsers = async (req, res) => {
  const me = req.user._id;
  const [users, recent] = await Promise.all([
    User.find({ _id: { $ne: me } }).select("name bloodGroup").sort({ name: 1 }).limit(500),
    Message.find({ $or: [{ sender: me }, { receiver: me }] }).sort({ createdAt: -1 }).limit(500).select("sender receiver text createdAt"),
  ]);
  const last = new Map();
  for (const m of recent) {
    const other = String(m.sender) === String(me) ? String(m.receiver) : String(m.sender);
    if (!last.has(other)) last.set(other, { text: m.text, createdAt: m.createdAt });
  }
  const list = users.map((u) => ({ _id: u._id, name: u.name, bloodGroup: u.bloodGroup, lastMessage: last.get(String(u._id)) ?? null }));
  list.sort((a, b) => (b.lastMessage?.createdAt ?? 0) - (a.lastMessage?.createdAt ?? 0));
  res.json(list);
};

export const getMessages = async (req, res) => {
  const { userId } = req.params;
  if (!isId(userId)) return fail(res, 400, "Invalid user.");
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(500);
  res.json(messages);
};

/** Saves a message and pushes it live to both people (every open tab). */
export const sendMessage = async (req, res) => {
  const { receiverId } = req.body;
  const text = String(req.body.text ?? "").trim();
  if (!isId(receiverId)) return fail(res, 400, "Invalid recipient.");
  if (String(receiverId) === String(req.user._id)) return fail(res, 400, "You can't message yourself.");
  if (!text) return fail(res, 400, "Message cannot be empty.");
  if (text.length > 1000) return fail(res, 400, "Messages can be at most 1000 characters.");
  if (!(await User.exists({ _id: receiverId }))) return fail(res, 404, "That user no longer exists.");

  const message = await Message.create({ sender: req.user._id, receiver: receiverId, text });
  const payload = { ...message.toObject(), senderName: req.user.name };
  emitToUser(receiverId, "message:new", payload);
  emitToUser(req.user._id, "message:new", payload);
  res.status(201).json(message);
};
