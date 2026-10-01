import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Bank from "../models/bank.model.js";
import { emitToUser } from "../utils/realtime.js";
import { fail, isId } from "../utils/http.js";

const NEARBY_KM = 5;

/** Saves notifications and pushes them live to anyone who is online. */
const notify = async (docs) => {
  if (!docs.length) return [];
  const saved = await Notification.insertMany(docs);
  saved.forEach((n) => emitToUser(n.user, "notification:new", n));
  return saved;
};

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("post", "description");
  res.json(notifications);
};

export const markAllNotificationsAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: "Notifications marked as read" });
};

export const deleteSingleNotification = async (req, res) => {
  const { notificationId } = req.params;
  if (!isId(notificationId)) return fail(res, 400, "Invalid notification.");
  // Only the owner can delete it (the old code let anyone delete anyone's notification).
  const result = await Notification.deleteOne({ _id: notificationId, user: req.user._id });
  if (!result.deletedCount) return fail(res, 404, "Notification not found.");
  res.json({ message: "Notification deleted" });
};

export const deleteAllNotifications = async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ message: "All notifications deleted" });
};

/** Tells nearby donors with a matching blood group about a new request. */
export const sendNotifications = async (post) => {
  try {
    const nearbyUsers = await User.find({
      location: {
        $geoWithin: { $centerSphere: [[post.location.longitude, post.location.latitude], NEARBY_KM / 6378.1] },
      },
      bloodGroup: post.bloodGroup,
      _id: { $ne: post.user },
    }).select("_id");

    return await notify(
      nearbyUsers.map((u) => ({
        user: u._id,
        message: `${post.urgency === "High" ? "Urgent: " : ""}${post.bloodGroup} blood is needed near you.`,
        post: post._id,
      })),
    );
  } catch (error) {
    console.error("Error sending notifications:", error.message);
    return [];
  }
};

/** Tells all admins about a new blood-bank request. */
export const sendAdminNotification = async (bankRequest) => {
  try {
    const [admins, bank] = await Promise.all([
      User.find({ role: "admin" }).select("_id"),
      Bank.findById(bankRequest.bank).select("name"),
    ]);
    await notify(
      admins.map((a) => ({
        user: a._id,
        message: `New request: ${bankRequest.quantity} bag(s) of ${bankRequest.bloodgroup} from ${bank?.name ?? "a blood bank"}.`,
      })),
    );
  } catch (error) {
    console.error("Error sending admin notifications:", error.message);
  }
};

/** Tells the requester whether their blood-bank request was accepted or rejected. */
export const notifyUserBankRequestStatus = async (bankRequest, status, bankName) => {
  try {
    await notify([
      {
        user: bankRequest.user,
        message: `Your request for ${bankRequest.quantity} bag(s) of ${bankRequest.bloodgroup} at ${bankName} was ${status}.`,
      },
    ]);
  } catch (error) {
    console.error("Error notifying user about request status:", error.message);
  }
};
