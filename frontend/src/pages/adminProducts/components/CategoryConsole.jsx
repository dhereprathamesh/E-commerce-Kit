/* eslint-disable react/prop-types */

// import { useState, useEffect } from "react";
// import api from "../services/api";

// export default function CategoryConsole({
//   categories,
//   categoryLoading,
//   setCategoryLoading,
//   createCategory,
//   fieldErrors,
//   RenderFieldError,
// }) {
//   const [categoryInput, setCategoryInput] = useState("");
//   const [editingCategory, setEditingCategory] = useState(null);

//   // Local mutable state copy of categories to prevent root-level screen refreshes
//   const [localCategories, setLocalCategories] = useState(categories);

//   // Sync internal layout if parent store changes independently
//   useEffect(() => {
//     setLocalCategories(categories);
//   }, [categories]);

//   useEffect(() => {
//     if (editingCategory) {
//       setCategoryInput(editingCategory.name);
//     } else {
//       setCategoryInput("");
//     }
//   }, [editingCategory]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!categoryInput.trim()) return;

//     setCategoryLoading(true);

//     if (editingCategory) {
//       try {
//         const updatedName = categoryInput.trim();
//         await api.put(`/categories/${editingCategory.id}`, {
//           name: updatedName,
//         });

//         // Optimistically update locally instead of refetching the whole catalog
//         setLocalCategories((prev) =>
//           prev.map((cat) =>
//             cat.id === editingCategory.id ? { ...cat, name: updatedName } : cat,
//           ),
//         );
//         setEditingCategory(null);
//       } catch (err) {
//         alert(err.response?.data?.message || "Failed to update category");
//       }
//     } else {
//       await createCategory(categoryInput.trim());
//       setCategoryInput("");
//     }
//     setCategoryLoading(false);
//   };

//   const handleDeleteCategory = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this category?"))
//       return;

//     try {
//       await api.delete(`/categories/${id}`);

//       // Filter category list out dynamically without global refresh triggers
//       setLocalCategories((prev) => prev.filter((cat) => cat.id !== id));
//       if (editingCategory?.id === id) {
//         setEditingCategory(null);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to delete category");
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       <div className="md:col-span-1 space-y-2">
//         <h2 className="text-xl font-bold text-slate-900">
//           Category Assortment Console
//         </h2>
//         <p className="text-xs text-slate-500">
//           Inject or review product structural classifications applied inside
//           client-side shopping menus.
//         </p>

//         <form onSubmit={handleSubmit} className="pt-3 flex flex-col gap-1">
//           <div className="flex gap-2">
//             <input
//               type="text"
//               maxLength={30}
//               placeholder={
//                 editingCategory
//                   ? "Update category name..."
//                   : "e.g., Winter Apparel"
//               }
//               value={categoryInput}
//               onChange={(e) => setCategoryInput(e.target.value)}
//               className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
//                 fieldErrors?.name ? "border-rose-400 focus:ring-rose-500" : ""
//               }`}
//             />
//             <button
//               type="submit"
//               disabled={categoryLoading}
//               className="bg-slate-900 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors disabled:bg-slate-400 whitespace-nowrap"
//             >
//               {categoryLoading
//                 ? "Saving..."
//                 : editingCategory
//                   ? "Update"
//                   : "Add"}
//             </button>
//             {editingCategory && (
//               <button
//                 type="button"
//                 onClick={() => setEditingCategory(null)}
//                 className="border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//           <RenderFieldError fieldName="name" />
//         </form>
//       </div>

//       {/* Available Classifications Grid Elements */}
//       <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto">
//         <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
//           Active Taxonomy Nodes
//         </label>
//         <div className="flex flex-wrap gap-2">
//           {localCategories.length === 0 ? (
//             <p className="text-xs text-slate-400 p-2">
//               No product categories currently deployed.
//             </p>
//           ) : (
//             localCategories.map((cat) => (
//               <div
//                 key={cat.id}
//                 className={`relative w-44 text-xs font-medium border pl-3 pr-16 py-2 rounded-md shadow-sm transition-colors min-h-[46px] flex flex-col justify-center ${
//                   editingCategory?.id === cat.id
//                     ? "bg-blue-50/50 border-blue-300 text-slate-900"
//                     : "bg-slate-50 border-slate-200 text-slate-700"
//                 }`}
//               >
//                 <div className="truncate font-semibold" title={cat.name}>
//                   {cat.name}
//                 </div>
//                 <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
//                   ID: {cat.id?.slice(0, 6)}
//                 </span>

//                 {/* Absolute Positioning Top Right Corner Wrapper */}
//                 <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5">
//                   <button
//                     type="button"
//                     onClick={() => setEditingCategory(cat)}
//                     className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all"
//                     title="Edit Category Name"
//                   >
//                     <svg
//                       className="h-3 w-3"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="2.5"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
//                       />
//                     </svg>
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => handleDeleteCategory(cat.id)}
//                     className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-50 transition-all"
//                     title="Delete Category"
//                   >
//                     <svg
//                       className="h-3 w-3"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="2.5"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import api from "../../../services/api";

export default function CategoryConsole({
  categories,
  categoryLoading,
  setCategoryLoading,
  createCategory,
  fieldErrors,
  RenderFieldError,
  setConfirmModal,
  setStatusModal,
}) {
  const [categoryInput, setCategoryInput] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (editingCategory) {
      setCategoryInput(editingCategory.name);
    } else {
      setCategoryInput("");
    }
  }, [editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side local check so it doesn't pollute global store state on empty submission
    if (!categoryInput.trim()) {
      // eslint-disable-next-line no-undef
      useProductStore.setState({
        fieldErrors: {
          ...fieldErrors,
          categoryName: "Category name cannot be empty.",
        },
      });
      return;
    }

    setCategoryLoading(true);

    if (editingCategory) {
      try {
        const updatedName = categoryInput.trim();
        await api.put(`/categories/${editingCategory.id}`, {
          name: updatedName,
        });

        setLocalCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? { ...cat, name: updatedName } : cat,
          ),
        );
        setEditingCategory(null);
        // Clear category error explicitly on success
        // eslint-disable-next-line no-undef
        useProductStore.setState({
          fieldErrors: { ...fieldErrors, categoryName: null },
        });
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Category Updated",
          message:
            "The taxonomy node classification records have been successfully renamed.",
          onConfirm: () =>
            setStatusModal((prev) => ({ ...prev, isOpen: false })),
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      await createCategory(categoryInput.trim());
      setCategoryInput("");
    }
    setCategoryLoading(false);
  };

  const executeCategoryDeletion = async (id) => {
    // Instantly mask the open confirmation backdrop frame
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      await api.delete(`/categories/${id}`);
      setLocalCategories((prev) => prev.filter((cat) => cat.id !== id));

      if (editingCategory?.id === id) {
        setEditingCategory(null);
      }

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Category Deleted",
        message:
          "The classification category was completely scrubbed from active storage records.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Purge Blocked",
        message:
          err.response?.data?.message ||
          "Could not decouple category. Check structural integrity hooks.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  //   const handleDeleteCategory = async (id) => {
  //     if (!window.confirm("Are you sure you want to delete this category?"))
  //       return;

  //     try {
  //       await api.delete(`/categories/${id}`);
  //       setLocalCategories((prev) => prev.filter((cat) => cat.id !== id));
  //       if (editingCategory?.id === id) {
  //         setEditingCategory(null);
  //       }
  //     } catch (err) {
  //       alert(err.response?.data?.message || "Failed to delete category");
  //     }
  //   };

  const handleDeleteCategory = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Category Assignment?",
      message:
        "Are you sure you want to completely erase this category taxonomy configuration node? This cannot be undone.",
      confirmText: "Yes, Purge Node",
      onConfirm: () => executeCategoryDeletion(id),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-2">
        <h2 className="text-xl font-bold text-slate-900">
          Category Assortment Console
        </h2>
        <p className="text-xs text-slate-500">
          Inject or review product structural classifications applied inside
          client-side shopping menus.
        </p>

        <form onSubmit={handleSubmit} className="pt-3 flex flex-col gap-1">
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={30}
              placeholder={
                editingCategory
                  ? "Update category name..."
                  : "e.g., Winter Apparel"
              }
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
                fieldErrors?.categoryName
                  ? "border-rose-400 focus:ring-rose-500"
                  : ""
              }`}
            />
            <button
              type="submit"
              disabled={categoryLoading}
              className="bg-slate-900 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors disabled:bg-slate-400 whitespace-nowrap"
            >
              {categoryLoading
                ? "Saving..."
                : editingCategory
                  ? "Update"
                  : "Add"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
          {/* Change fieldName hook to avoid catching Product form title errors */}
          <RenderFieldError fieldName="categoryName" />
        </form>
      </div>

      <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto scrollbar-hide">
        <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
          Active Taxonomy Nodes
        </label>
        <div className="flex flex-wrap gap-2">
          {localCategories.length === 0 ? (
            <p className="text-xs text-slate-400 p-2">
              No product categories currently deployed.
            </p>
          ) : (
            localCategories.map((cat) => (
              <div
                key={cat.id}
                className={`relative w-44 text-xs font-medium border pl-3 pr-16 py-2 rounded-md shadow-sm transition-colors min-h-[46px] flex flex-col justify-center ${
                  editingCategory?.id === cat.id
                    ? "bg-blue-50/50 border-blue-300 text-slate-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div className="truncate font-semibold" title={cat.name}>
                  {cat.name}
                </div>
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                  ID: {cat.id?.slice(0, 6)}
                </span>

                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(cat)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                    title="Edit Category Name"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
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
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-50 transition-all"
                    title="Delete Category"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
