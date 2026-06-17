import { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Master categories array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [submitLoading, setSubmitLoading] = useState(false);

  // New Category State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySubmitLoading, setCategorySubmitLoading] = useState(false);

  // Integrated Form State
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    categoryId: "",
    images: "",
  });

  // Fetch products and categories concurrently
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"), // Fetch your category API
      ]);

      setProducts(productsRes.data?.data || productsRes.data || []);
      setCategories(categoriesRes.data?.data || categoriesRes.data || []);
    } catch (err) {
      console.error("Error populating component datasets:", err);
      setError("Could not download system catalog data dashboards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Quick Category Form Submission
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setCategorySubmitLoading(true);
      const response = await api.post("/categories", { name: newCategoryName });
      const createdCategory = response.data?.data || response.data;

      // Update local dropdown choices immediately
      setCategories((prev) => [...prev, createdCategory]);
      setNewCategoryName("");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to append new item classification group.",
      );
    } finally {
      setCategorySubmitLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setForm({
      id: "",
      name: "",
      description: "",
      price: "",
      comparePrice: "",
      stock: "",
      categoryId: "",
      images: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      comparePrice: product.comparePrice || "",
      stock: product.stock || "",
      categoryId: product.categoryId || "",
      images: Array.isArray(product.images)
        ? product.images.join(", ")
        : product.images || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock),
      categoryId: form.categoryId || null, // Directly mapping the selected drop-down category value string ID
      images: form.images
        ? form.images.split(",").map((img) => img.trim())
        : [],
    };

    try {
      if (modalMode === "create") {
        const response = await api.post("/products", payload);
        const createdProduct = response.data?.data || response.data;
        setProducts((prev) => [createdProduct, ...prev]);
      } else {
        const response = await api.put(`/products/${form.id}`, payload);
        const updatedProduct = response.data?.data || response.data;
        setProducts((prev) =>
          prev.map((p) => (p.id === form.id ? updatedProduct : p)),
        );
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to finalize database changes.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      setDeleteLoading(id);
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Purge execution failed.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-sm font-medium text-slate-500 animate-pulse">
        Syncing catalog files...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg m-6">
        {error}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* SECTION 1: MASTER PRODUCTS CATALOG */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Master Catalog Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Control live operational inventory levels, pricing structures, and
              core categories.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
          >
            + Add New Product
          </button>
        </div>

        {/* Inventory Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b">
                <tr>
                  <th className="px-6 py-3 w-20">Thumbnail</th>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock Units</th>
                  <th className="px-6 py-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No items found inside catalog dataset.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={
                            product.images?.[0] ||
                            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60"
                          }
                          alt=""
                          className="h-10 w-10 object-cover rounded border bg-slate-50"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            ID: {product.id.slice(0, 8)}
                          </p>
                        </div>
                      </td>
                      {/* Dynamic category assignment rendering block */}
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded font-medium">
                          {categories.find((c) => c.id === product.categoryId)
                            ?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                            product.stock === 0
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                            title="Edit Product"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2" /* Fixed property name */
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteLoading === product.id}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                            title="Delete Product"
                          >
                            {deleteLoading === product.id ? (
                              /* Clean loading spinner matching icon proportions */
                              <div className="h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2" /* Fixed property name */
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* SECTION 2: CATEGORIES QUICK MANAGEMENT DESK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            Category Assortment Console
          </h2>
          <p className="text-xs text-slate-500">
            Inject or review product structural classifications applied inside
            client-side shopping menus.
          </p>

          <form onSubmit={handleCreateCategory} className="pt-3 flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g., Winter Apparel"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={categorySubmitLoading}
              className="bg-slate-900 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors disabled:bg-slate-400"
            >
              {categorySubmitLoading ? "Saving..." : "Add"}
            </button>
          </form>
        </div>

        {/* Render Available Classifications Grid Elements */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto">
          <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            Active Taxonomy Nodes
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">
                No product categories currently deployed.
              </p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="text-xs font-medium border border-slate-200 px-3 py-1.5 rounded-md bg-slate-50 text-slate-700 shadow-sm"
                >
                  {cat.name}{" "}
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                    ID: {cat.id.slice(0, 6)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PRODUCT DEFINITION MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-slate-900 text-lg">
                {modalMode === "create"
                  ? "Add New Product"
                  : "Modify Product Specifications"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* DYNAMIC CATEGORY DROPDOWN BOX */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Merchandising Category *
                </label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">-- Choose Category Linkage Node --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Compare Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.comparePrice}
                    onChange={(e) =>
                      setForm({ ...form, comparePrice: e.target.value })
                    }
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available Stock *
                </label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Image Links (Comma Separated)
                </label>
                <input
                  type="text"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="https://site.com/img1.png, https://site.com/img2.png"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 flex items-center gap-2"
                >
                  {submitLoading && (
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {modalMode === "create" ? "Add Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
