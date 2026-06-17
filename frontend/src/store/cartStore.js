import { create } from "zustand";

// Safe fallback utility to get items from storage on start
const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading cart items from storage:", error);
    return [];
  }
};

export const useCartStore = create((set, get) => ({
  items: getInitialCart(),

  // Add Item to Cart Action
  addItem: (newItem) => {
    const currentItems = get().items;

    // Check if the exact same item and configuration variant already exists
    const existingItemIdx = currentItems.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.variantId === newItem.variantId,
    );

    let updatedItems;

    if (existingItemIdx > -1) {
      // If it exists, merge and increment the quantity counter
      updatedItems = [...currentItems];
      updatedItems[existingItemIdx].quantity += newItem.quantity;
    } else {
      // If it is entirely unique, append it to the active stack
      updatedItems = [...currentItems, newItem];
    }

    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  // Update Item Quantity Action
  updateQuantity: (productId, variantId, newQty) => {
    if (newQty < 1) return;

    const updatedItems = get().items.map((item) => {
      if (item.productId === productId && item.variantId === variantId) {
        return { ...item, quantity: newQty };
      }
      return item;
    });

    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  // Remove Item from Cart Action
  removeItem: (productId, variantId) => {
    const updatedItems = get().items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );

    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  // Clear Cart Entirely (Post-checkout cleanup)
  clearCart: () => {
    localStorage.removeItem("cartItems");
    set({ items: [] });
  },

  // Utility Getters for computed UI calculations
  getCartTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  },

  getCartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
