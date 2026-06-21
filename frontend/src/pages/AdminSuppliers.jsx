// src/pages/AdminSuppliers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch all suppliers from our structured backend endpoint
  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/suppliers");

      setSuppliers(res.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle Supplier Removal
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this supplier? This will also wipe out product mappings.",
      )
    )
      return;

    try {
      await api.delete(`/suppliers/${id}`);

      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete supplier.");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading supplier registry...
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Suppliers</h1>
          <p className="text-sm text-slate-500">
            Manage vendor catalogs and external purchase streams.
          </p>
        </div>
        <button
          onClick={(e) => {
            (e.preventDefault(), navigate("/admin/suppliers/create"));
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
        >
          Add Supplier
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {suppliers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center text-slate-500">
          No suppliers registered in system matrix.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Supplier Name</th>
                <th className="px-6 py-3">Associated Products</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers?.map((supplier) => {
                // Filter out invalid, null, or empty product objects ahead of time
                const validProducts = Array.isArray(supplier.products)
                  ? supplier.products.filter(
                      (prod) => prod && prod.id && prod.product.name,
                    )
                  : [];

                return (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{supplier.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4">
                      {validProducts.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {validProducts.map((prod) => (
                            <span
                              key={prod.id}
                              className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                            >
                              {prod.product.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No products linked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/suppliers/create?edit=${supplier.id}`,
                          )
                        }
                        // to={`/admin/suppliers/create?edit=${supplier.id}`}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
