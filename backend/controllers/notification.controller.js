import Notification from "../models/notification.model.js";

import User from "../models/user.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("post", "description");

    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get notifications", error: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

export const deleteSingleNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete notification", error: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.status(200).json({ message: "All Notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notifications",
      error: error.message,
    });
  }
};

export const sendNotifications = async (post) => {
  try {
    const { location, bloodGroup, user: postCreatorId } = post;

    const coordinates = [location.longitude, location.latitude];

    // Find nearby users with the same blood group (within 3 km radius)
    const nearbyUsers = await User.find({
      location: {
        $geoWithin: {
          $centerSphere: [coordinates, 3 / 6378.1],
        },
      },
      bloodGroup,
      _id: { $ne: postCreatorId }, // Exclude post creator
    });

    if (nearbyUsers.length === 0) return; // No users to notify

    // Create notifications
    const notifications = nearbyUsers.map((user) => ({
      user: user._id,
      message: `Urgent: A new blood request has been made near you!`,
      post: post._id,
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    return savedNotifications;
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};

//raz
export const sendAdminNotification = async (bankRequest) => {
  try {
    // Find all admin users
    const admins = await User.find({ role: "admin" });

    if (admins.length === 0) return; // No admins found, no notifications needed

    // Create notifications for all admins
    const notifications = admins.map((admin) => ({
      user: admin._id,
      message: `New bank request for ${bankRequest.quantity} units of ${bankRequest.bloodgroup} blood at ${bankRequest.bank}.`,
      post: bankRequest._id,
    }));

    // Save notifications to the database
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Error sending admin notifications:", error);
  }
};

// Notify the user when their bank request is approved or rejected
export const notifyUserBankRequestStatus = async (bankRequest, status) => {
  try {
    const userId = bankRequest.user;
    const bankName = (await bankRequest.populate("bank", "name")).bank.name;

    const message =
      status === "accepted"
        ? `Your bank request for ${bankRequest.quantity} units of ${bankRequest.bloodgroup} blood at ${bankName} has been accepted.`
        : `Your bank request for ${bankRequest.quantity} units of ${bankRequest.bloodgroup} blood at ${bankName} has been rejected.`;

    await Notification.create({
      user: userId,
      message,
      post: bankRequest._id, // optional: helps link notification to request
    });
  } catch (error) {
    console.error("Error notifying user about request status:", error.message);
  }
};
