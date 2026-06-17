import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Initialize your foundational Axios instance base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Matches your local server development port configuration
  headers: {
    "Content-Type": "application/json",
  },
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

export default api;
