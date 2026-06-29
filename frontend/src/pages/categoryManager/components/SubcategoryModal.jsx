/* eslint-disable react/prop-types */
import { useState } from "react";
import api from "../../../services/api";

export default function SubcategoryModal({
  isOpen,
  onClose,
  activeCategory,
  onSubcategoryAdded,
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError("");

      // Calls your endpoint passing the active parent category ID
      const { data } = await api.post("/categories/subcategory", {
        name: name.trim(),
        categoryId: activeCategory.id,
      });

      onSubcategoryAdded(data.data); // Updates parent state view
      setName("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Add New Subcategory
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Adding inside node:{" "}
          <span className="font-semibold text-indigo-600">
            {activeCategory?.name}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subcategory Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Laptops, Smartphones, T-Shirts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Save Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
