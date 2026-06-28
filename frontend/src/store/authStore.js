import { create } from "zustand";
import api from "../services/api";

// Safe JSON parser fallback
const getSafeLocalStorageUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getSafeLocalStorageUser(),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/auth/login", { email, password });

      console.log("LOGIN RESPONSE:", response.data);

      const { user, accessToken } = response.data;

      if (!user || !accessToken) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);

      set({
        user: { ...user }, // important spread (forces reactivity)
        token: accessToken,
        loading: false,
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      set({
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  verifyOtp: async (email, code) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/verify-email", {
        email,
        code,
      });

      // If your backend returns an updated verified user object or new tokens:
      const { user, accessToken } = response.data;

      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (accessToken) localStorage.setItem("token", accessToken);

      set((state) => ({
        user: user ? { ...user } : state.user,
        token: accessToken ? accessToken : state.token,
        loading: false,
      }));

      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Verification failed.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  sendVerificationOtp: async (email) => {
    set({ loading: true, error: null });
    try {
      // Assuming your backend endpoint for resending or initiating OTP is /auth/resend-otp
      await api.post("/auth/resend-verification", { email });
      
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send verification code.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, token: null, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
