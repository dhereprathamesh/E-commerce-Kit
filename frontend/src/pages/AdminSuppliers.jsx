// // src/pages/AdminSuppliers.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";
// import StatusModal from "../components/common/StatusModal";

// export default function AdminSuppliers() {
//   const [suppliers, setSuppliers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 10;
//   const [deleteLoading, setDeleteLoading] = useState(null);
//   const [statusModal, setStatusModal] = useState({
//     isOpen: false,
//     type: "success", // 'success' | 'error'
//     title: "",
//     message: "",
//     onConfirm: () => {},
//   });
//   const navigate = useNavigate();

//   // Fetch all suppliers from our structured backend endpoint
//   const fetchSuppliers = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/suppliers?page=${page}&limit=${limit}`);

//       // Extract data array and pagination metadata from backend response
//       setSuppliers(res.data.data || []);
//       setTotalItems(res.data.pagination?.total || 0);
//       setTotalPages(res.data.pagination?.totalPages || 1);
//       setError("");
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to load suppliers.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSuppliers();
//   }, []);

//   // Handle Supplier Removal
//   const handleDelete = async (id) => {
//     // if (
//     //   !window.confirm(
//     //     "Are you sure you want to delete this supplier? This will also wipe out product mappings.",
//     //   )
//     // )
//     //   return;

//     try {
//       setDeleteLoading(id);
//       await api.delete(`/suppliers/${id}`);

//       setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
//     } catch (err) {
//       setStatusModal({
//         isOpen: true,
//         type: "error",
//         title: "Purge Failed",
//         message: err.response?.data?.error || "Failed to delete supplier.",
//         onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
//       });
//     } finally {
//       setDeleteLoading(null);
//     }
//   };

//   const startIndex = (page - 1) * limit;

//   if (loading)
//     return (
//       <div className="p-8 text-center text-sm text-slate-500">
//         Loading supplier registry...
//       </div>
//     );

//   return (
//     <div className="mx-auto max-w-7xl p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-950">Suppliers</h1>
//           <p className="text-sm text-slate-500">
//             Manage vendor catalogs and external purchase streams.
//           </p>
//         </div>
//         <button
//           onClick={(e) => {
//             (e.preventDefault(), navigate("/admin/suppliers/create"));
//           }}
//           className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
//         >
//           Add Supplier
//         </button>
//       </div>

//       {error && (
//         <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse text-sm text-slate-600 table-fixed">
//             <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b sticky top-0 select-none">
//               <tr>
//                 <th className="px-6 py-3 w-20">Sr No.</th>
//                 <th className="px-6 py-3 min-w-[220px]">Supplier Name</th>
//                 <th className="px-6 py-3 min-w-[300px]">Associated Products</th>
//                 <th className="px-6 py-3 text-center w-28">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {suppliers.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="4"
//                     className="px-6 py-12 text-center text-slate-400 font-normal"
//                   >
//                     No suppliers registered in system matrix.
//                   </td>
//                 </tr>
//               ) : (
//                 suppliers.map((supplier, index) => {
//                   const validProducts = Array.isArray(supplier.products)
//                     ? supplier.products.filter(
//                         (prod) => prod && prod.id && prod.product?.name,
//                       )
//                     : [];

//                   const serialNumber = startIndex + index + 1;

//                   return (
//                     <tr
//                       key={supplier.id}
//                       className="hover:bg-slate-50/40 transition-colors"
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400 tabular-nums">
//                         {serialNumber}
//                       </td>

//                       <td className="px-6 py-4">
//                         <p
//                           className="font-semibold text-slate-900 truncate"
//                           title={supplier.name}
//                         >
//                           {supplier.name}
//                         </p>
//                       </td>

//                       <td className="px-6 py-4">
//                         {validProducts.length > 0 ? (
//                           <div className="flex flex-wrap gap-1.5 max-w-full">
//                             {validProducts.map((prod) => (
//                               <span
//                                 key={prod.id}
//                                 title={prod.product.name}
//                                 className="inline-block max-w-[180px] truncate rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 align-middle"
//                               >
//                                 {prod.product.name}
//                               </span>
//                             ))}
//                           </div>
//                         ) : (
//                           <span className="text-xs text-slate-400 italic whitespace-nowrap">
//                             No products linked
//                           </span>
//                         )}
//                       </td>

//                       <td className="px-6 py-4 text-center whitespace-nowrap">
//                         <div className="inline-flex items-center gap-3">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               navigate(
//                                 `/admin/suppliers/create?edit=${supplier.id}`,
//                               )
//                             }
//                             className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
//                             title="Edit Supplier"
//                           >
//                             <svg
//                               className="h-4 w-4"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               strokeWidth="2"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
//                               />
//                             </svg>
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => handleDelete(supplier.id)}
//                             className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
//                             title="Delete Supplier"
//                           >
//                             <svg
//                               className="h-4 w-4"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               strokeWidth="2"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>

//           {/* Pagination Footer */}
//           {totalItems > 0 && (
//             <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
//               <p className="text-sm text-slate-500">
//                 Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
//                 <span className="font-medium">
//                   {Math.min(page * limit, totalItems)}
//                 </span>{" "}
//                 of <span className="font-medium">{totalItems}</span> suppliers
//               </p>

//               <div className="flex items-center gap-2">
//                 <button
//                   disabled={page === 1}
//                   onClick={() => setPage(page - 1)}
//                   className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 transition-colors"
//                 >
//                   Previous
//                 </button>

//                 {Array.from({ length: totalPages }, (_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setPage(index + 1)}
//                     className={`h-9 w-9 rounded text-sm font-medium transition-colors ${
//                       page === index + 1
//                         ? "bg-blue-600 text-white"
//                         : "border border-slate-300 text-slate-700 hover:bg-slate-50"
//                     }`}
//                   >
//                     {index + 1}
//                   </button>
//                 ))}

//                 <button
//                   disabled={page >= totalPages}
//                   onClick={() => setPage(page + 1)}
//                   className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 transition-colors"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <StatusModal {...statusModal} />
//     </div>
//   );
// }
// src/pages/AdminSuppliers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StatusModal from "../components/common/StatusModal";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // New States for Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const navigate = useNavigate();

  // 1. Debounce Search Input
  // Delays the actual query by 300ms so we don't spam the server while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 whenever search query changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Fetch Suppliers (Updated to include debouncedSearch)
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      // Append the search parameter to your existing paginated request
      const res = await api.get(
        `/suppliers?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
      );

      setSuppliers(res.data.data || []);
      setTotalItems(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run whenever page or the debounced search value changes
  useEffect(() => {
    fetchSuppliers();
  }, [page, debouncedSearch]);

  // Handle Supplier Removal
  const handleDelete = async (id) => {
    // If you want to use your StatusModal for a confirmation flow instead of window.confirm:
    setStatusModal({
      isOpen: true,
      type: "error", // stylized for a destructive action
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this supplier? This will also wipe out product mappings.",
      onConfirm: async () => {
        // Close modal first
        setStatusModal((prev) => ({ ...prev, isOpen: false }));

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
            onConfirm: () =>
              setStatusModal((prev) => ({ ...prev, isOpen: false })),
          });
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  const startIndex = (page - 1) * limit;

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Suppliers</h1>
          <p className="text-sm text-slate-500">
            Manage vendor catalogs and external purchase streams.
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate("/admin/suppliers/create");
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 self-start sm:self-center"
        >
          Add Supplier
        </button>
      </div>

      {/* New Search and Filter Control Utility Strip */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by supplier name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-600 table-fixed">
            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b sticky top-0 select-none">
              <tr>
                <th className="px-6 py-3 w-20">Sr No.</th>
                <th className="px-6 py-3 min-w-[220px]">Supplier Name</th>
                <th className="px-6 py-3 min-w-[300px]">Associated Products</th>
                <th className="px-6 py-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    Loading filtered registry records...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-400 font-normal"
                  >
                    {debouncedSearch
                      ? "No suppliers match your search filter."
                      : "No suppliers registered in system matrix."}
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier, index) => {
                  const validProducts = Array.isArray(supplier.products)
                    ? supplier.products.filter(
                        (prod) => prod && prod.id && prod.product?.name,
                      )
                    : [];

                  const serialNumber = startIndex + index + 1;

                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400 tabular-nums">
                        {serialNumber}
                      </td>

                      <td className="px-6 py-4">
                        <p
                          className="font-semibold text-slate-900 truncate"
                          title={supplier.name}
                        >
                          {supplier.name}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {validProducts.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-full">
                            {validProducts.map((prod) => (
                              <span
                                key={prod.id}
                                title={prod.product.name}
                                className="inline-block max-w-[180px] truncate rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 align-middle"
                              >
                                {prod.product.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic whitespace-nowrap">
                            No products linked
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
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
                            type="button"
                            disabled={deleteLoading === supplier.id}
                            onClick={() => handleDelete(supplier.id)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                            title="Delete Supplier"
                          >
                            {deleteLoading === supplier.id ? (
                              <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" />
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
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {!loading && totalItems > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> suppliers
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(index + 1)}
                    className={`h-9 w-9 rounded text-sm font-medium transition-colors ${
                      page === index + 1
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <StatusModal {...statusModal} />
    </div>
  );
}
