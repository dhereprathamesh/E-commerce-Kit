import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function AdminSupplierCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // <-- Added email state
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        if (Array.isArray(res.data)) {
          setAvailableProducts(res.data);
        } else if (res.data && Array.isArray(res.data.data?.products)) {
          setAvailableProducts(res.data.data?.products);
        } else {
          setAvailableProducts([]);
        }
      } catch (err) {
        console.error("Failed to compile available inventory.", err);
      }
    };

    const fetchSupplierData = async () => {
      if (!editId) return;
      try {
        setLoading(true);
        const res = await api.get(`/suppliers/${editId}`);
        const supplierData = res.data?.data || res.data;

        if (supplierData) {
          setName(supplierData.name || "");
          setEmail(supplierData.email || ""); // <-- Populate email on edit
          const mappedIds =
            supplierData.products?.map((p) => p.product.id) || [];
          setSelectedProductIds(mappedIds);
        }
      } catch (err) {
        console.log(err);
        setError("Failed to fetch target supplier profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchSupplierData();
  }, [editId]);

  const handleCheckboxChange = (productId) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== productId),
      );
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const MAX_NAME_LENGTH = 50; // Define your character limit here

    // Validation checks
    if (!name.trim()) return setError("Supplier name required.");
    if (name.length > MAX_NAME_LENGTH) {
      return setError(
        `Supplier name cannot exceed ${MAX_NAME_LENGTH} characters.`,
      );
    }
    if (!email.trim()) return setError("Supplier email required.");

    try {
      setLoading(true);
      const payload = { name, email, product_ids: selectedProductIds }; // <-- Added email to payload

      if (editId) {
        await api.put(`/suppliers/${editId}`, payload);
      } else {
        await api.post("/suppliers", payload);
      }

      navigate("/admin/suppliers");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Transaction execution failure.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">
          {editId ? "Modify Supplier" : "Create New Supplier"}
        </h1>
        <p className="text-sm text-slate-500">
          Configure catalog permissions and junction table links.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
      >
        {/* Name input field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company / Supplier Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="e.g. Apex Global Trading"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Email input field (ADDED) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Supplier Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. vendor@apexglobal.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Dynamic relational product checklist array */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Assign Authorized Catalog Items
          </label>
          <div className="max-h-60 overflow-y-auto rounded-md border border-slate-200 p-3 divide-y divide-slate-50 bg-slate-50/50">
            {availableProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No items found in global product registry.
              </p>
            ) : (
              availableProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-slate-50 px-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => handleCheckboxChange(product.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div className="text-sm">
                    <p className="font-medium text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      SKU ID: #{product.id}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Execution Actions Stack */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/admin/suppliers")}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : editId
                ? "Update Registry"
                : "Save Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}
