/* eslint-disable react/prop-types */
import { useState } from "react";
import api from "../../../services/api";

export default function FilterValueModal({
  isOpen,
  onClose,
  activeGroup,
  onValueAdded,
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    try {
      setLoading(true);
      setError("");

      const { data } = await api.post("/filters/values", {
        value: value.trim(),
        filterGroupId: activeGroup.id,
      });

      onValueAdded(activeGroup.id, data.data);
      setValue("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create choice value");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Add Options Choice
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Adding inside Group:{" "}
          <span className="font-semibold text-indigo-600">
            {activeGroup?.name}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Value String
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Apple, 16GB, 512GB, Black"
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
              {loading ? "Adding..." : "Add Choice Option"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
