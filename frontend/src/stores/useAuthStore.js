import { create } from "zustand";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// (uses cookies; no need to push Authorization header)
const refreshAccessToken = async () => {
  try {
    const res = await axiosInstance.post("/auth/refreshAccessToken");
    return res.data.accessToken;
  } catch (error) {
    console.log("refresh Token failed", error.response?.data);
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  // IMPORTANT: keep a consistent shape everywhere → { user: <obj> }
  user: null,
  checkingAuth: true,
  loading: false,

  signup: async (formData) => {
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ user: { user: { _id: res.data._id, name: res.data.name, email: res.data.email } } });
      return res;
    } catch (error) {
      console.log("signup failed", error.response?.data);
      throw error;
    }
  },

  login: async (formData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      // server returns { message, user: {...} }
      set({ user: { user: res.data.user } });
      return res;
    } catch (error) {
      console.log("login failed", error.response?.data);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      console.log("logout failed", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      // server returns { user: {...} }
      const res = await axiosInstance.get("/auth/getUserProfile");
      set({ user: { user: res.data.user }, checkingAuth: false });
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          try {
            const res2 = await axiosInstance.get("/auth/getUserProfile");
            set({ user: { user: res2.data.user }, checkingAuth: false });
            return;
          } catch (e2) {
            console.log("Failed to get profile after refresh", e2.response?.data);
          }
        }
      }
      // 🔴 REMOVE the hard redirect (this causes the flicker/blank)
      set({ user: null, checkingAuth: false });
    }
  },

  updateUser: async (formData) => {
    try {
      const res = await axiosInstance.patch("/auth/updateUser", formData);
      // server returns { message, user: {...} }
      set({ user: { user: res.data.user } });
      return res;
    } catch (error) {
      console.log("update user failed", error.response?.data);
    }
  },

  searchForDonor: async (filters) => {
    set({ loading: true });
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axiosInstance.get(`/searchfilter/filterDonors?${query}`);
      return res.data;
    } catch (error) {
      console.log("Error searching for donors:", error.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  calculateBMI: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/auth/calculateBmi");
      return res.data;
    } catch (error) {
      console.log("BMI calculation failed", error.response?.data);
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
