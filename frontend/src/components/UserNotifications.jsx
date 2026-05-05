import React, { useEffect } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";
import Loading from "./Loading";

const UserNotification = () => {
  const {
    notifications,
    loadingNotifications,

    markAllNotificationsAsRead,
    deleteSingleNotification,
    deleteAllNotification,
  } = useNotificationStore();

  useEffect(() => {
    useNotificationStore.getState().getNotifications();
  }, []);

  if (loadingNotifications) {
    return (
      <>
        <Loading />
      </>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end gap-4">
        <button
          onClick={markAllNotificationsAsRead}
          disabled={notifications.length === 0}
          className={`px-4 py-2 rounded text-white transition ${
            notifications.length === 0
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Mark All as Read
        </button>
        <button
          onClick={deleteAllNotification}
          disabled={notifications.length === 0}
          className={`px-4 py-2 rounded text-white transition ${
            notifications.length === 0
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          Delete All Notifications
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications found.</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`flex justify-between items-center border p-4 rounded ${
              notification.isRead
                ? "bg-gray-300 text-gray-700"
                : "bg-white text-black"
            }`}
          >
            <div>
              <p className="font-medium">{notification.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => deleteSingleNotification(notification._id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default UserNotification;
