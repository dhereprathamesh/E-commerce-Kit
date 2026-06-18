import { create } from "zustand";
import api from "../services/api";

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  // 1. Fetch cart from backend
  fetchCart: async () => {
    try {
      set({ loading: true });

      const res = await api.get("/cart");

      const cart = res.data?.data;

      set({
        items: Array.isArray(cart?.items) ? cart.items : [],
      });
    } catch (err) {
      console.error("fetchCart error:", err);
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },

  // 2. Add item (API)
  addItem: async (payload) => {
    try {
      set({ loading: true });

      await api.post("/cart/add", payload);

      const res = await api.get("/cart");
      const cart = res.data?.data;

      set({
        items: Array.isArray(cart?.items) ? cart.items : [],
      });
    } catch (err) {
      console.error("addItem error:", err);
    } finally {
      set({ loading: false });
    }
  },

  // 3. Update quantity (uses itemId from backend)
  updateQuantity: async (itemId, newQty) => {
    if (newQty < 1) return;

    try {
      await api.put(`/cart/update/${itemId}`, {
        quantity: newQty,
      });

      const res = await api.get("/cart");
      const cart = res.data?.data;

      set({
        items: Array.isArray(cart?.items) ? cart.items : [],
      });
    } catch (err) {
      console.error("updateQuantity error:", err);
    }
  },

  // 4. Remove item
  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`);

      const res = await api.get("/cart");
      const cart = res.data?.data;

      set({
        items: Array.isArray(cart?.items) ? cart.items : [],
      });
    } catch (err) {
      console.error("removeItem error:", err);
    }
  },

  // 5. Clear cart (optional if backend supports)
  clearCart: () => set({ items: [] }),

  // 6. Derived values (still OK client-side)
  getCartTotal: () => {
    const items = get().items;

    if (!Array.isArray(items)) return 0;

    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * (item.quantity || 0);
    }, 0);
  },

  getCartCount: () => {
    const items = get().items;

    if (!Array.isArray(items)) return 0;

    return items.reduce((count, item) => count + (item.quantity || 0), 0);
  },
}));
