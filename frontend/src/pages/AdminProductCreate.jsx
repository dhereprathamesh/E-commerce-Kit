import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminProductCreate() {
  const navigate = useNavigate();

  // Primary State Models
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // Stores raw Cloudinary secure URLs
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categorized relationships on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data || []);
      } catch (err) {
        console.error(
          "Failed downloading backoffice catalog classification maps:",
          err,
        );
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Direct asynchronous asset ingestion processing to Cloudinary API
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const imgData = new FormData();
        imgData.append("file", file);
        // Replace with your designated backend multiform handler target configuration route
        const res = await api.post("/admin/upload", imgData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.url; // Target returns public secure secure_url access paths
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Asset storage gateway cancellation:", err);
      setError("Media optimization asset ingestion failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Simple Validation
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.categoryId
    ) {
      setError(
        "Please populate all mandatory schema constraints highlighted with asterisks (*).",
      );
      setSubmitting(false);
      return;
    }

    try {
      const productPayload = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice
          ? parseFloat(formData.comparePrice)
          : null,
        stock: parseInt(formData.stock, 10),
        images: images, // Attaches serialized string array references
      };

      await api.post("/admin/products", productPayload);
      navigate("/admin/products"); // Redirect smoothly back to inventory table
    } catch (err) {
      console.error("Data engine catalog commit rejection:", err);
      setError(
        err.response?.data?.message || "Database rejected entity insertion.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Add New Catalog Product
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Publish a completely unique master catalog entity block.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmitForm}
        className="space-y-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
      >
        {/* Title Name row */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Title *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Text Description area */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Detailed Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Specify materials, features, dimensional constraints..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Financial Numbers row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Retail Price ($) *
            </label>
            <input
              type="number"
              name="price"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Strikethrough Price ($)
            </label>
            <input
              type="number"
              name="comparePrice"
              step="0.01"
              value={formData.comparePrice}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Inventory Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="100"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category mapping relationship drop list */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Catalog Category Placement *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Choose Category Target --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cloudinary Asset Attachment Interface */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Media Imagery
          </label>
          <div className="mt-1 flex items-center gap-4">
            <input
              type="file"
              multiple
              accept="image/*"
              id="file-upload-raw"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
            <label
              htmlFor="file-upload-raw"
              className={`rounded-md border border-dashed border-slate-300 px-4 py-3 text-sm font-medium cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {uploadingImage
                ? "Streaming to Cloudinary..."
                : "Upload Image Assets"}
            </label>
          </div>

          {/* Render Active Image Previews stack */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square border border-slate-200 rounded overflow-hidden group"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-slate-950/70 p-1 text-white hover:bg-slate-950 transition-colors opacity-0 group-hover:opacity-100 text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Execution Actions footer block */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-slate-400 transition-colors"
          >
            {submitting ? "Creating Entity record..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
