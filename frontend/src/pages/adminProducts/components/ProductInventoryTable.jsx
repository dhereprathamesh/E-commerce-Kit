/* eslint-disable react/prop-types */

export default function ProductInventoryTable({
  products,
  categories,
  deleteLoading,
  openEditModal,
  handleDeleteProduct,
  page,
  setPage,
  pagination,
  // openCreateModal,
}) {
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Inventory Scroll-Bound Table Card */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse text-sm text-slate-600 table-fixed">
            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b sticky top-0 select-none">
              <tr>
                <th className="px-6 py-3 w-24">Thumbnail</th>
                <th className="px-6 py-3 min-w-[200px]">Product Name</th>
                <th className="px-6 py-3 w-48">Category</th>
                <th className="px-6 py-3 w-32">Price</th>
                <th className="px-6 py-3 w-36">Stock Units</th>
                <th className="px-6 py-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400 font-normal"
                  >
                    No items found inside catalog dataset.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const targetCategoryName =
                    categories.find((c) => c.id === product.categoryId)?.name ||
                    "Uncategorized";

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      {/* Image Thumbnail Container */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={
                            product.images?.[0] ||
                            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60"
                          }
                          alt=""
                          className="h-10 w-10 object-cover rounded border bg-slate-50"
                        />
                      </td>

                      {/* Product Structural Text Identifiers */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                          <p
                            className="font-semibold text-slate-900 truncate"
                            title={product.name}
                          >
                            {product.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                            ID: {product.id?.slice(0, 8)}
                          </p>
                        </div>
                      </td>

                      {/* Explicit Fixed Category Block */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-[150px]">
                          <span
                            className="inline-block max-w-full bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded font-medium truncate align-middle"
                            title={targetCategoryName}
                          >
                            {targetCategoryName}
                          </span>
                        </div>
                      </td>

                      {/* Normalized Pricing Frame */}
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <span className="tabular-nums">
                          ${" "}
                          {typeof window !== "undefined" && navigator.userAgent
                            ? Number(product.price || 0).toFixed(2)
                            : product.price}
                        </span>
                      </td>

                      {/* Normalized Fixed Stock Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24">
                          <span
                            className={`inline-flex items-center justify-center w-full rounded-full p-1 text-xs font-semibold border tabular-nums ${
                              Number(product.stock) === 0
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </div>
                      </td>

                      {/* Persistent Interaction Controls Layout */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
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
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteLoading === product.id}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                            title="Delete Product"
                          >
                            {deleteLoading === product.id ? (
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
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium">
                {pagination?.total === 0 ? 0 : (page - 1) * limit + 1}
              </span>{" "}
              -
              <span className="font-medium">
                {" "}
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> products
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>

              {Array.from({ length: pagination?.totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`h-9 w-9 rounded text-sm font-medium ${
                    page === index + 1
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={page >= totalPages || products.length < limit}
                onClick={() => setPage(page + 1)}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
