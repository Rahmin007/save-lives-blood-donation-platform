import axios from "axios";

/**
 * One shared API client for the whole app.
 * In production the frontend and API share a domain, so the base URL is just "/api".
 * (The old code hard-coded http://localhost:3000, which can't work once deployed.)
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

let onSessionExpired = () => {};
export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

// When the 30-minute access token expires, refresh it once and retry the request.
let refreshing = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthCall = /\/auth\/(login|signup|refreshAccessToken|logout)/.test(config?.url ?? "");
    if (response?.status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true;
      refreshing = refreshing || api.post("/auth/refreshAccessToken").finally(() => (refreshing = null));
      try {
        await refreshing;
        return api(config);
      } catch {
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  },
);

/** A readable message for any failed request. */
export const errorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error?.response) return "Can't reach the server. Check your internet connection.";
  return error.response.data?.message || fallback;
};
