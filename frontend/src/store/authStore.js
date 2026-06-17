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

  //   login: async (email, password) => {
  //     set({ loading: true, error: null });
  //     try {
  //       const response = await api.post("/auth/login", { email, password });
  //       console.log("responseresponseresponseresponse", response);

  //       const { user, accessToken } = response.data;

  //       localStorage.setItem("user", JSON.stringify(user));
  //       localStorage.setItem("token", accessToken);

  //       set({ user, token: accessToken, loading: false });
  //       return { success: true };
  //     } catch (err) {
  //       const errorMsg = err.response?.data?.message || "Login failed.";
  //       set({ error: errorMsg, loading: false });
  //       return { success: false, error: errorMsg };
  //     }
  //   },

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
      const { user, accessToken } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", accessToken);

      set({
        user: { ...user },
        token: accessToken,
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed.";
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
