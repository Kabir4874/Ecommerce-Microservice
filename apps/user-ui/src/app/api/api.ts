import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URI}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// !handle logout and prevent infinite loops
const handleLogout = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// !handle adding a new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// !execute queued requests after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// !handle api requests
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// !handle expired tokens and refresh login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ?prevent infinite retry loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(api(originalRequest)));
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await api.post("/refresh-token");
        isRefreshing = false;
        onRefreshSuccess();
        return api(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
