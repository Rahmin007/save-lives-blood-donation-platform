import { create } from "zustand";
import { api, errorMessage, setSessionExpiredHandler } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

// Shape kept as { user: {...} } because components read user.user.<field>.
export const useAuthStore = create((set) => ({
  user: null,
  checkingAuth: true,
  loading: false,

  signup: async (formData) => {
    const res = await api.post("/auth/signup", formData);
    set({ user: { user: res.data.user } });
    connectSocket();
    return res;
  },

  login: async (formData) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/login", formData);
      set({ user: { user: res.data.user } });
      connectSocket();
      return res;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      disconnectSocket();
      set({ user: null });
    }
  },

  /** Runs once on page load to restore the session from the login cookie. */
  checkAuth: async () => {
    try {
      const res = await api.get("/auth/getUserProfile");
      set({ user: { user: res.data.user }, checkingAuth: false });
      connectSocket();
    } catch {
      set({ user: null, checkingAuth: false });
    }
  },

  updateUser: async (formData) => {
    const res = await api.patch("/auth/updateUser", formData);
    set({ user: { user: res.data.user } });
    return res;
  },

  searchForDonor: async (filters) => {
    const query = new URLSearchParams(filters).toString();
    const res = await api.get(`/searchFilter/filterDonors?${query}`);
    return res.data;
  },

  calculateBMI: async () => {
    try {
      return (await api.get("/auth/calculateBmi")).data;
    } catch {
      return null;
    }
  },
}));

// If the session can't be refreshed, show the login page instead of failing silently.
setSessionExpiredHandler(() => {
  disconnectSocket();
  useAuthStore.setState({ user: null });
});

export { errorMessage };
