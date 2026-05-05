import { create } from "zustand";

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loadingNotifications: false,

  getNotifications: async () => {
    set({ loadingNotifications: true });
    try {
      const res = await axiosInstance.get("/notification/getNotifications");
      set({ notifications: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.log("error fetching notifications", error.response?.data);
    } finally {
      set({ loadingNotifications: false });
    }
  },

  markAllNotificationsAsRead: async () => {
    set({ loadingNotifications: true });
    try {
      const res = await axiosInstance.patch(
        "/notification/markAllNotificationsAsRead"
      );
      set({
        notifications: Array.isArray(res.data) ? res.data : get().notifications,
      });
      get().getNotifications();
    } catch (error) {
      console.log("error updating notifications as Read", error.response?.data);
    } finally {
      set({ loadingNotifications: false });
    }
  },
  deleteSingleNotification: async (notificationId) => {
    set({ loadingNotifications: true });
    try {
      const res = await axiosInstance.delete(
        `/notification/deleteSingleNotification/${notificationId}`
      );
      set({
        notifications: Array.isArray(res.data) ? res.data : get().notifications,
      });
      get().getNotifications();
    } catch (error) {
      console.log("error deleting notification", error.response?.data);
    } finally {
      set({ loadingNotifications: false });
    }
  },
  deleteAllNotification: async () => {
    set({ loadingNotifications: true });
    try {
      const res = await axiosInstance.delete(
        "/notification/deleteAllNotifications"
      );
      set({
        notifications: Array.isArray(res.data) ? res.data : get().notifications,
      });
      get().getNotifications();
    } catch (error) {
      console.log("error deleting notification", error.response?.data);
    } finally {
      set({ loadingNotifications: false });
    }
  },
}));
