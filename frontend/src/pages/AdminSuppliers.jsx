// src/pages/AdminSuppliers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StatusModal from "../components/common/StatusModal";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error'
    title: "",
    message: "",
    onConfirm: () => {},
  });
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
    // if (
    //   !window.confirm(
    //     "Are you sure you want to delete this supplier? This will also wipe out product mappings.",
    //   )
    // )
    //   return;

    try {
      setDeleteLoading(id);
      await api.delete(`/suppliers/${id}`);

      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
    } catch (err) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Purge Failed",
        message: err.response?.data?.error || "Failed to delete supplier.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    }finally {
      setDeleteLoading(null);
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
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/suppliers/create?edit=${supplier.id}`,
                            )
                          }
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Edit Supplier"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                          title="Delete Supplier"
                        >
                          {deleteLoading === supplier.id ? (
                              <div className="h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            )
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <StatusModal {...statusModal} />
    </div>
  );
}
