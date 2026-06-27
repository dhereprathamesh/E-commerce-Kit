import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Initialize your foundational Axios instance base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Matches your local server development port configuration
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// --- THE FIX: AUTOMATIC TOKEN INJECTION INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // Dynamically retrieve the active token from your existing Zustand authentication store state
    const token = useAuthStore.getState().token;

    if (token) {
      // Append the Bearer Authorization credentials structure directly to header blocks
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Variables to handle multiple concurrent failing requests during a token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Response Interceptor: Handle expired tokens gracefully
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If the request itself was the refresh endpoint failing, clear state and boot user to login
      if (originalRequest.url.includes('/auth/refresh')) {
        useAuthStore.getState().logout(); // Clears memory state
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request while another request handles the refresh operation
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Hit your silent refresh endpoint. The browser automatically appends the HttpOnly cookie.
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;

        // Update the access token inside your Zustand or state memory
        useAuthStore.setState({ token: accessToken });

        // Process any other requests that were queued up while this refresh was running
        processQueue(null, accessToken);

        // Retry the original request that failed
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout(); // Refresh token is dead or expired, force re-login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
