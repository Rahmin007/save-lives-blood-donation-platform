import { useEffect } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";
import { timeAgo } from "../lib/format";
import Loading from "./Loading";

const UserNotifications = () => {
  const { notifications, loadingNotifications, getNotifications, markAllNotificationsAsRead, deleteSingleNotification, deleteAllNotification } =
    useNotificationStore();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  if (loadingNotifications && !notifications.length) return <Loading fullScreen={false} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
        <button onClick={markAllNotificationsAsRead} disabled={!notifications.some((n) => !n.isRead)} className="btn btn-outline btn-sm">
          Mark all as read
        </button>
        <button
          onClick={() => window.confirm("Delete all notifications?") && deleteAllNotification()}
          disabled={!notifications.length}
          className="btn btn-ghost btn-sm text-error"
        >
          Delete all
        </button>
      </div>
      {!notifications.length ? (
        <p className="text-center text-base-content/60 py-8">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n._id} className={`flex items-start gap-3 border rounded-box p-3 ${n.isRead ? "border-base-300" : "border-primary/40 bg-primary/5"}`}>
              {!n.isRead && <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" aria-label="Unread" />}
              <div className="flex-1">
                <p className={n.isRead ? "" : "font-medium"}>{n.message}</p>
                <p className="text-xs text-base-content/60">{timeAgo(n.createdAt)}</p>
              </div>
              <button onClick={() => deleteSingleNotification(n._id)} className="btn btn-ghost btn-xs" aria-label="Delete notification">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserNotifications;
