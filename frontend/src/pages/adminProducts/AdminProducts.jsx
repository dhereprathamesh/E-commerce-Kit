import { useState, useEffect } from "react";
import api from "../../services/api";
import { useProductStore } from "../../store/productStore";
import StatusModal from "../../components/common/StatusModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ProductInventoryTable from "./components/ProductInventoryTable";
import CategoryConsole from "./components/CategoryConsole";
import ProductModal from "./components/ProductModal";

export default function AdminProducts() {
  const {
    products,
    pagination,
    categories,
    loading,
    globalError,
    fieldErrors,
    submitLoading,
    clearErrors,
    fetchCatalog,
    createProduct,
    updateProduct,
    createCategory,
  } = useProductStore();
  console.log("pagination", pagination);

  const [deleteLoading, setDeleteLoading] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error'
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: () => {},
  });

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
  useEffect(() => {
    fetchCatalog(page, limit);
  }, [page]);

  const openCreateModal = () => {
    clearErrors();
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
    clearErrors();
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
    clearErrors(); // Reset previous errors before validating again

    const errors = {};

    // 1. Product Title Validation (< 50 chars)
    if (!form.name || form.name.trim() === "") {
      errors.name = "Product title is required.";
    } else if (form.name.length > 50) {
      errors.name = `Title cannot exceed 50 characters (currently ${form.name.length}).`;
    }

    // 2. Description Validation (optional, but limited to 50 chars if provided)
    if (!form.description || form.description.trim() === "") {
      errors.description = "Description is required.";
    } else if (form.description && form.description.length > 50) {
      errors.description = `Description cannot exceed 50 characters (currently ${form.description.length}).`;
    }
    if (!form.categoryId || form.categoryId === "") {
      errors.categoryId = "Please select a merchandising category.";
    }

    // 3. Price Validation (> 0)
    const priceValue = form.price ? Number(form.price) : 0;
    if (!form.price || priceValue <= 0) {
      errors.price = "Price must be a number greater than 0.";
    }

    // 4. Stock Validation (> 0)
    const stockValue = form.stock ? Number(form.stock) : 0;
    if (!form.stock || stockValue <= 0) {
      errors.stock = "Stock must be a number greater than 0.";
    }

    // If there are any validation errors, inject them into the store and stop execution
    if (Object.keys(errors).length > 0) {
      useProductStore.setState({ fieldErrors: errors });
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: form.price ? Number(form.price) : "",
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: form.stock ? Number(form.stock) : "",
      categoryId: form.categoryId || null,
      images: form.images
        ? form.images.split(",").map((img) => img.trim())
        : [],
    };

    let result;
    if (modalMode === "create") {
      result = await createProduct(payload);
    } else {
      result = await updateProduct(form.id, payload);
    }

    if (result.success) {
      setIsModalOpen(false);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: modalMode === "create" ? "Product Created!" : "Product Updated!",
        message:
          modalMode === "create"
            ? "The item has been successfully added to your catalog listing."
            : "The item records have been updated flawlessly.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    } else {
      setIsModalOpen(false);
    }
  };

  const executeProductDeletion = async (id) => {
    // Instantly close the confirmation modal framework
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      setDeleteLoading(id);
      await api.delete(`/products/${id}`);
      fetchCatalog();

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Product Deleted",
        message:
          "The requested object context has been expunged from the active database records.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Purge Failed",
        message:
          err.response?.data?.message ||
          "Execution engine failed to purge target.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteProduct = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product?",
      message:
        "Are you sure you want to delete this product? This action cannot be reverted.",
      confirmText: "Yes, Delete",
      onConfirm: () => executeProductDeletion(id), // Link the execution callback right here
    });
  };
  // Reusable inline input message component helper
  // eslint-disable-next-line react/prop-types
  const RenderFieldError = ({ fieldName }) => {
    if (!fieldErrors || !fieldErrors[fieldName]) return null;

    return (
      <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-start gap-1 animate-fadeIn whitespace-nowrap">
        <svg
          className="h-3 w-3 flex-shrink-0 mt-0.5" /* Aligns icon with the top of the text line */
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {fieldErrors[fieldName]}
      </p>
    );
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "CSV Required",
        message: "Please choose a CSV file first.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setBulkUploading(true);

      const formData = new FormData();
      formData.append("file", csvFile);

      const { data } = await api.post("/products/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchCatalog();

      setIsBulkModalOpen(false);
      setCsvFile(null);

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Bulk Upload Completed",
        message: `${data.summary.successCount} products imported successfully.`,
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Upload Failed",
        message: err.response?.data?.message || "Unable to upload CSV.",
        onConfirm: () => setStatusModal((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setBulkUploading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-sm font-medium text-slate-500 animate-pulse">
        Syncing catalog files...
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* GLOBAL ERROR DASHBOARD BANNER */}
      {globalError && (
        <div className="p-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
          <span>{globalError}</span>
          <button onClick={clearErrors} className="font-bold hover:opacity-70">
            &times;
          </button>
        </div>
      )}

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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Bulk Upload
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all shrink-0"
            >
              + Add New Product
            </button>
          </div>
        </div>
        <ProductInventoryTable
          products={products}
          categories={categories}
          deleteLoading={deleteLoading}
          openEditModal={openEditModal}
          handleDeleteProduct={handleDeleteProduct}
          page={page}
          setPage={setPage}
          pagination={pagination}
        />
      </div>

      <hr className="border-slate-200" />

      {/* SECTION 2: CATEGORIES QUICK MANAGEMENT DESK */}
      <CategoryConsole
        categories={categories}
        categoryLoading={categoryLoading}
        setCategoryLoading={setCategoryLoading}
        createCategory={createCategory}
        fieldErrors={fieldErrors}
        RenderFieldError={RenderFieldError}
        setConfirmModal={setConfirmModal}
        setStatusModal={setStatusModal}
      />

      {/* PRODUCT DEFINITION MODAL OVERLAY */}
      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          modalMode={modalMode}
          form={form}
          setForm={setForm}
          categories={categories}
          fieldErrors={fieldErrors}
          submitLoading={submitLoading}
          onSubmit={handleFormSubmit}
          // RenderFieldError is optional; it defaults to a built-in handler if not provided
        />
      )}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 !mt-0">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                Bulk Product Upload
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload a CSV file to import multiple products at once.
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <label
                htmlFor="csv-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-10 transition hover:border-blue-500 hover:bg-blue-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-3 h-14 w-14 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0l-4 4m4-4l4 4M5 20h14"
                  />
                </svg>

                <p className="font-semibold text-slate-700">
                  Click to choose CSV
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Only .csv files are supported
                </p>

                {csvFile && (
                  <div className="mt-4 rounded bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                    {csvFile.name}
                  </div>
                )}
              </label>

              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files[0])}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setCsvFile(null);
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                disabled={bulkUploading}
                onClick={handleBulkUpload}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {bulkUploading ? "Uploading..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
      <StatusModal {...statusModal} />
    </div>
  );
}
