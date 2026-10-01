import { create } from "zustand";
import toast from "react-hot-toast";
import { api, errorMessage } from "../lib/api";

export const useNotificationStore = create((set) => ({
  notifications: [],
  loadingNotifications: false,

  getNotifications: async () => {
    set({ loadingNotifications: true });
    try {
      const res = await api.get("/notification/getNotifications");
      set({ notifications: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(errorMessage(error, "Could not load notifications."));
    } finally {
      set({ loadingNotifications: false });
    }
  },

  /** Called when a live notification arrives over the socket. */
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  markAllNotificationsAsRead: async () => {
    try {
      await api.patch("/notification/markAllNotificationsAsRead");
      set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, isRead: true })) }));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  },

  deleteSingleNotification: async (id) => {
    try {
      await api.delete(`/notification/deleteSingleNotification/${id}`);
      set((state) => ({ notifications: state.notifications.filter((n) => n._id !== id) }));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  },

  deleteAllNotification: async () => {
    try {
      await api.delete("/notification/deleteAllNotifications");
      set({ notifications: [] });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  },
}));
