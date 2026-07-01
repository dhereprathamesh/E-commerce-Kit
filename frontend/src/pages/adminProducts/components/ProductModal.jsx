/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import api from "../../../services/api";

const ProductModal = ({
  isOpen,
  onClose,
  modalMode,
  form,
  setForm,
  categories = [],
  fieldErrors = {},
  submitLoading = false,
  onSubmit,
  RenderFieldError = ({ fieldName }) =>
    fieldErrors[fieldName] ? (
      <p className="text-rose-500 text-[10px] mt-1">{fieldErrors[fieldName]}</p>
    ) : null,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");

  // Dynamic dropdown and filter groups state
  const [fetchedSubcategories, setFetchedSubcategories] = useState([]);
  const [fetchedFilterGroups, setFetchedFilterGroups] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Initialize filterValueIds safely as an array
  useEffect(() => {
    if (isOpen && !Array.isArray(form.filterValueIds)) {
      setForm((prev) => ({
        ...prev,
        filterValueIds: prev.filterValueIds
          ? String(prev.filterValueIds).split(",").filter(Boolean)
          : [],
      }));
    }
  }, [isOpen]);

  // 1. Fetch Subcategories when Category changes
  useEffect(() => {
    if (!form.categoryId) {
      setFetchedSubcategories([]);
      return;
    }

    const fetchSubcategories = async () => {
      setLoadingSubcats(true);
      try {
        const response = await api.get(
          `/categories/subcategory?categoryId=${form.categoryId}`,
        );
        const subcatData = response.data?.data || [];
        setFetchedSubcategories(Array.isArray(subcatData) ? subcatData : []);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setFetchedSubcategories([]);
      } finally {
        setLoadingSubcats(false);
      }
    };

    fetchSubcategories();
  }, [form.categoryId]);

  // 2. Fetch Structured Filters when Subcategory changes
  useEffect(() => {
    if (!form.subCategoryId) {
      setFetchedFilterGroups([]);
      return;
    }

    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const response = await api.get(
          `/filters/subcategory/${form.subCategoryId}`,
        );
        const filterData = response.data?.data || [];
        setFetchedFilterGroups(Array.isArray(filterData) ? filterData : []);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
        setFetchedFilterGroups([]);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, [form.subCategoryId]);

  if (!isOpen) return null;

  // Smart Checkbox Toggle logic
  const handleCheckboxChange = (valueId, group) => {
    const currentSelections = Array.isArray(form.filterValueIds)
      ? form.filterValueIds
      : [];
    let updatedSelections;

    const isBrandGroup = group.name.toLowerCase() === "brand";

    if (isBrandGroup) {
      // If it's a Brand group, remove any other values that belong to this group first (Single Select)
      const brandValueIds = group.filterValues?.map((v) => String(v.id)) || [];
      const cleanSelections = currentSelections.filter(
        (id) => !brandValueIds.includes(id),
      );

      if (currentSelections.includes(valueId)) {
        updatedSelections = cleanSelections; // Uncheck if clicked again
      } else {
        updatedSelections = [...cleanSelections, valueId]; // Check new brand option exclusively
      }
    } else {
      // Standard multi-select behavior for RAM, Capacity, Color etc.
      if (currentSelections.includes(valueId)) {
        updatedSelections = currentSelections.filter((id) => id !== valueId);
      } else {
        updatedSelections = [...currentSelections, valueId];
      }
    }

    setForm({
      ...form,
      filterValueIds: updatedSelections,
    });
  };

  // Parses comma-separated string URLs from form state into a clean array
  const getImageUrlsArray = () => {
    if (!form.images) return [];
    if (Array.isArray(form.images)) return form.images;
    return form.images
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  };

  const getFileNameFromUrl = (url) => {
    try {
      const segments = url.split("/");
      return segments[segments.length - 1];
    } catch {
      return "Uploaded Image Asset";
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploadError("");
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImageUrl = data.url || data.imageUrl;
      if (newImageUrl) {
        const currentUrls = getImageUrlsArray();
        const updatedUrls = [...currentUrls, newImageUrl];
        setForm({ ...form, images: updatedUrls.join(", ") });
      }
    } catch (err) {
      console.error("Image uploading failed:", err);
      setImageUploadError(err.response?.data?.message || "File upload failed.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentUrls = getImageUrlsArray();
    const updatedUrls = currentUrls.filter(
      (_, index) => index !== indexToRemove,
    );
    setForm({ ...form, images: updatedUrls.join(", ") });
  };

  const handleMoveImage = (index, direction) => {
    const currentUrls = getImageUrlsArray();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentUrls.length) return;

    const updatedUrls = [...currentUrls];
    [updatedUrls[index], updatedUrls[targetIndex]] = [
      updatedUrls[targetIndex],
      updatedUrls[index],
    ];
    setForm({ ...form, images: updatedUrls.join(", ") });
  };

  const uploadedImages = getImageUrlsArray();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm !mt-0">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
          <h3 className="font-bold text-slate-900 text-lg">
            {modalMode === "create"
              ? "Add New Product"
              : "Modify Product Specifications"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 text-xl font-semibold hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form
          id="product-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-hide"
        >
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${fieldErrors?.name ? "border-rose-400 focus:ring-rose-500" : ""}`}
            />
            <RenderFieldError fieldName="name" />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows="2"
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${fieldErrors?.description ? "border-rose-400 focus:ring-rose-500" : ""}`}
            />
            <RenderFieldError fieldName="description" />
          </div>

          {/* Dynamic Category/Subcategory and Custom Spec Filters */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Category *
              </label>
              <select
                value={form.categoryId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoryId: e.target.value,
                    subCategoryId: "",
                    filterValueIds: [],
                  })
                }
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer ${fieldErrors?.categoryId ? "border-rose-400 focus:ring-rose-500" : ""}`}
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <RenderFieldError fieldName="categoryId" />
            </div>

            {/* Subcategory */}
            {form.categoryId && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-slate-700">
                    Subcategory *
                  </label>
                  {loadingSubcats && (
                    <span className="text-[10px] text-blue-600 animate-pulse">
                      Loading...
                    </span>
                  )}
                </div>
                <select
                  value={form.subCategoryId || ""}
                  disabled={loadingSubcats || fetchedSubcategories.length === 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subCategoryId: e.target.value,
                      filterValueIds: [],
                    })
                  }
                  className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${fieldErrors?.subCategoryId ? "border-rose-400 focus:ring-rose-500" : ""}`}
                >
                  <option value="">
                    {loadingSubcats
                      ? "-- Fetching Options --"
                      : fetchedSubcategories.length === 0
                        ? "No subcategories found"
                        : "-- Choose Subcategory --"}
                  </option>
                  {fetchedSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <RenderFieldError fieldName="subCategoryId" />
              </div>
            )}

            {/* Filters / Specifications Field Rendering Blocks */}
            {form.subCategoryId && (
              <div className="border-t pt-3 mt-2 border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-semibold text-slate-800 text-[13px]">
                    Product Technical Specifications / Filters
                  </label>
                  {loadingFilters && (
                    <span className="text-[10px] text-blue-600 animate-pulse">
                      Loading specs...
                    </span>
                  )}
                </div>

                {fetchedFilterGroups.length === 0 && !loadingFilters ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No specific property filters tied to this subcategory
                    layout.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-56 overflow-y-auto pr-1 scrollbar-hide">
                    {fetchedFilterGroups.map((group) => {
                      const isBrand = group.name.toLowerCase() === "brand";
                      return (
                        <div
                          key={group.id}
                          className="bg-white border rounded-lg p-2.5 shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              {group.name}
                            </span>
                            {isBrand && (
                              <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                                Choose 1 Brand Only
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {group.filterValues?.map((val) => {
                              const isChecked =
                                Array.isArray(form.filterValueIds) &&
                                form.filterValueIds.includes(String(val.id));
                              return (
                                <label
                                  key={val.id}
                                  className={`flex items-center gap-2 p-1.5 rounded-md border cursor-pointer select-none transition-all text-xs ${
                                    isChecked
                                      ? "bg-blue-50/50 border-blue-200 text-blue-700 font-medium"
                                      : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        String(val.id),
                                        group,
                                      )
                                    }
                                    className={`h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer ${isBrand ? "rounded-full" : "rounded"}`}
                                  />
                                  <span className="truncate">{val.value}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <RenderFieldError fieldName="filterValueIds" />
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${fieldErrors?.price ? "border-rose-400 focus:ring-rose-500" : ""}`}
              />
              <RenderFieldError fieldName="price" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Compare Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.comparePrice || ""}
                onChange={(e) =>
                  setForm({ ...form, comparePrice: e.target.value })
                }
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${fieldErrors?.comparePrice ? "border-rose-400 focus:ring-rose-500" : ""}`}
              />
              <RenderFieldError fieldName="comparePrice" />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Available Stock *
            </label>
            <input
              type="number"
              value={form.stock || ""}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${fieldErrors?.stock ? "border-rose-400 focus:ring-rose-500" : ""}`}
            />
            <RenderFieldError fieldName="stock" />
          </div>

          {/* Images Asset Row List */}
          <div className="space-y-2 border-t pt-3 border-slate-100">
            <div className="flex justify-between items-center">
              <label className="block font-semibold text-slate-700">
                Product Images
              </label>
              {uploadingImage && (
                <span className="text-[10px] text-blue-600 font-medium animate-pulse">
                  Uploading...
                </span>
              )}
            </div>

            {uploadedImages.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-hide">
                {uploadedImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 border rounded-lg px-3 py-1.5 text-sm gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={url}
                        alt="Variant"
                        className="w-7 h-7 object-cover rounded border bg-white shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span className="font-mono text-xs text-slate-600 truncate">
                        {getFileNameFromUrl(url)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, "up")}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === uploadedImages.length - 1}
                        onClick={() => handleMoveImage(idx, "down")}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold text-sm px-1 ml-1"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                No images uploaded.
              </p>
            )}

            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4 mt-2">
              <div>
                <p className="font-semibold text-slate-700 text-[11px]">
                  Upload images
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP</p>
              </div>
              <label className="cursor-pointer bg-white border shadow-sm rounded-md px-3 py-1.5 font-semibold text-slate-700 text-xs hover:bg-slate-50 transition-colors">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {imageUploadError && (
              <p className="text-rose-500 text-[10px] font-medium mt-1">
                {imageUploadError}
              </p>
            )}
            <RenderFieldError fieldName="images" />
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t bg-white rounded-b-xl flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={submitLoading || uploadingImage}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 flex items-center gap-2 disabled:bg-blue-400 transition-colors"
          >
            {submitLoading && (
              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {modalMode === "create" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
