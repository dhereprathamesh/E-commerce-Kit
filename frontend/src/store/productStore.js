/* eslint-disable react/prop-types */

import { create } from "zustand";
import { z } from "zod";
import api from "../services/api";

// Client-side validation schema matching your backend rules
const frontendProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),

  description: z.string().min(10, "Description must be at least 10 characters"),

  // Using z.preprocess handles empty strings from forms gracefully before checking number rules
  price: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z
      .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
      })
      .positive("Price must be greater than 0"),
  ),

  comparePrice: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().positive("Compare price must be greater than 0").optional(),
  ),

  stock: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z
      .number({
        required_error: "Stock is required",
        invalid_type_error: "Stock must be a number",
      })
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
  ),

  categoryId: z
    .string({ required_error: "Category is required" })
    .min(1, "Category is required"),
});

export const useProductStore = create((set) => ({
  products: [],
  categories: [],
  loading: false,
  submitLoading: false,
  globalError: null,
  fieldErrors: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  clearErrors: () => set({ globalError: null, fieldErrors: {} }),

  // fetchCatalog: async () => {
  //   set({ loading: true, globalError: null });
  //   try {
  //     const [productsRes, categoriesRes] = await Promise.all([
  //       api.get("/products"),
  //       api.get("/categories"),
  //     ]);
  //     console.log("productsRes", productsRes);

  //     set({
  //       products: productsRes.data?.data?.products || productsRes.data || [],
  //       categories: categoriesRes.data?.data || categoriesRes.data || [],
  //       loading: false,
  //     });
  //   } catch (err) {
  //     console.log(err);

  //     set({
  //       globalError: "Could not download system catalog dashboards.",
  //       loading: false,
  //     });
  //   }
  // },

  fetchCatalog: async (page = 1, limit = 10) => {
    set({ loading: true, globalError: null });

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get(`/products?page=${page}&limit=${limit}`),
        api.get("/categories"),
      ]);

      set({
        products: productsRes.data.data.products,
        pagination: productsRes.data.data.pagination,
        categories: categoriesRes.data.data,
        loading: false,
      });
    } catch (err) {
      console.log(err);

      set({
        loading: false,
        globalError: "Could not download system catalog dashboards.",
      });
    }
  },

  createProduct: async (payload) => {
    set({ submitLoading: true, fieldErrors: {}, globalError: null });

    // 1. Run Frontend Zod Validation Interceptor
    const validation = frontendProductSchema.safeParse(payload);
    if (!validation.success) {
      const errorsMap = {};
      validation.error.issues.forEach((issue) => {
        const fieldKey = issue.path[0];
        if (!errorsMap[fieldKey]) {
          errorsMap[fieldKey] = issue.message; // Capture the first error message for each field
        }
      });
      set({ fieldErrors: errorsMap, submitLoading: false });
      return { success: false };
    }

    // 2. If valid, proceed to API Call
    try {
      const response = await api.post("/products", payload);
      const created = response.data?.data || response.data;
      set((state) => ({
        products: [created, ...state.products],
        submitLoading: false,
      }));
      return { success: true };
    } catch (err) {
      return handleAxiosValidationError(err, set);
    }
  },

  updateProduct: async (id, payload) => {
    set({ submitLoading: true, fieldErrors: {}, globalError: null });

    // 1. Run Frontend Zod Validation Interceptor
    const validation = frontendProductSchema.safeParse(payload);
    if (!validation.success) {
      const errorsMap = {};
      validation.error.issues.forEach((issue) => {
        const fieldKey = issue.path[0];
        if (!errorsMap[fieldKey]) {
          errorsMap[fieldKey] = issue.message;
        }
      });
      set({ fieldErrors: errorsMap, submitLoading: false });
      return { success: false };
    }

    // 2. If valid, proceed to API Call
    try {
      const response = await api.put(`/products/${id}`, payload);
      const updated = response.data?.data || response.data;
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        submitLoading: false,
      }));
      return { success: true };
    } catch (err) {
      return handleAxiosValidationError(err, set);
    }
  },

  createCategory: async (name) => {
    set({ fieldErrors: {}, globalError: null });
    try {
      const response = await api.post("/categories", { name });
      const created = response.data?.data || response.data;
      set((state) => ({ categories: [...state.categories, created] }));
      return { success: true };
    } catch (err) {
      return handleAxiosValidationError(err, set);
    }
  },
}));

// Fallback error parser for any server-side validation or connection drops
function handleAxiosValidationError(err, set) {
  const serverMessage = err.response?.data?.message;
  const validationDetails = err.response?.data?.errors;

  if (Array.isArray(validationDetails)) {
    const errorsMap = {};
    validationDetails.forEach((item) => {
      const fieldKey = item.path[0];
      errorsMap[fieldKey] = item.message;
    });
    set({ fieldErrors: errorsMap, submitLoading: false });
  } else if (validationDetails && typeof validationDetails === "object") {
    set({ fieldErrors: validationDetails, submitLoading: false });
  } else {
    set({
      globalError: serverMessage || "Action execution failed.",
      submitLoading: false,
    });
  }
  return { success: false };
}
