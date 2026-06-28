// /* eslint-disable react/prop-types */
// import { useState } from "react";
// import api from "../../../services/api";

// const ProductModal = ({
//   isOpen,
//   onClose,
//   modalMode,
//   form,
//   setForm,
//   categories = [],
//   fieldErrors = {},
//   submitLoading = false,
//   onSubmit,
//   RenderFieldError = ({ fieldName }) =>
//     fieldErrors[fieldName] ? (
//       <p className="text-rose-500 text-[10px] mt-1">{fieldErrors[fieldName]}</p>
//     ) : null,
// }) => {
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [imageUploadError, setImageUploadError] = useState("");

//   if (!isOpen) return null;

//   // Handles raw image uploads directly to the backend endpoint
//   const handleImageFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setImageUploadError("");
//     setUploadingImage(true);

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       // Calls your router.post("/upload-image", auth, admin, upload.single("image"), uploadProductImage)
//       const { data } = await api.post("/products/upload-image", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       // Expecting your controller to return the uploaded file URL string (e.g., data.url or data.imageUrl)
//       const newImageUrl = data.url || data.imageUrl;

//       if (newImageUrl) {
//         // Appends the newly uploaded image string cleanly into the current comma-separated state text field
//         const fallbackCurrentImages = form.images ? form.images.trim() : "";
//         const divider =
//           fallbackCurrentImages && !fallbackCurrentImages.endsWith(",")
//             ? ", "
//             : " ";

//         setForm({
//           ...form,
//           images: `${fallbackCurrentImages}${divider}${newImageUrl}`,
//         });
//       }
//     } catch (err) {
//       console.error("Image uploading context failure:", err);
//       setImageUploadError(
//         err.response?.data?.message ||
//           "File upload failed. Please verify asset type dimensions.",
//       );
//     } finally {
//       setUploadingImage(false);
//       e.target.value = ""; // Flushes file target memory for sequential duplicate selections
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm !mt-0">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
//         {/* Header */}
//         <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
//           <h3 className="font-bold text-slate-900 text-lg">
//             {modalMode === "create"
//               ? "Add New Product"
//               : "Modify Product Specifications"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-slate-400 text-xl font-semibold hover:text-slate-600"
//           >
//             &times;
//           </button>
//         </div>

//         {/* Form Body */}
//         <form
//           id="product-form"
//           onSubmit={onSubmit}
//           className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-hide"
//         >
//           {/* Product Title Input Block */}
//           <div>
//             <label className="block font-semibold text-slate-700 mb-1">
//               Product Title *
//             </label>
//             <input
//               type="text"
//               value={form.name || ""}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
//                 fieldErrors?.name ? "border-rose-400 focus:ring-rose-500" : ""
//               }`}
//             />
//             <RenderFieldError fieldName="name" />
//           </div>

//           {/* Description Input Block */}
//           <div>
//             <label className="block font-semibold text-slate-700 mb-1">
//               Description *
//             </label>
//             <textarea
//               rows="3"
//               value={form.description || ""}
//               onChange={(e) =>
//                 setForm({ ...form, description: e.target.value })
//               }
//               className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
//                 fieldErrors?.description
//                   ? "border-rose-400 focus:ring-rose-500"
//                   : ""
//               }`}
//             />
//             <RenderFieldError fieldName="description" />
//           </div>

//           {/* Category Links Input Block */}
//           <div>
//             <label className="block font-semibold text-slate-700 mb-1">
//               Assigned Merchandising Category *
//             </label>
//             <select
//               value={form.categoryId || ""}
//               onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
//               className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer ${
//                 fieldErrors?.categoryId
//                   ? "border-rose-400 focus:ring-rose-500"
//                   : ""
//               }`}
//             >
//               <option value="">-- Choose Category Linkage Node --</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id}>
//                   {cat.name}
//                 </option>
//               ))}
//             </select>
//             <RenderFieldError fieldName="categoryId" />
//           </div>

//           {/* Pricing Double Column Layout Block */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block font-semibold text-slate-700 mb-1">
//                 Price ($) *
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={form.price || ""}
//                 onChange={(e) => setForm({ ...form, price: e.target.value })}
//                 className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
//                   fieldErrors?.price
//                     ? "border-rose-400 focus:ring-rose-500"
//                     : ""
//                 }`}
//               />
//               <RenderFieldError fieldName="price" />
//             </div>
//             <div>
//               <label className="block font-semibold text-slate-700 mb-1">
//                 Compare Price ($)
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={form.comparePrice || ""}
//                 onChange={(e) =>
//                   setForm({ ...form, comparePrice: e.target.value })
//                 }
//                 className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
//                   fieldErrors?.comparePrice
//                     ? "border-rose-400 focus:ring-rose-500"
//                     : ""
//                 }`}
//               />
//               <RenderFieldError fieldName="comparePrice" />
//             </div>
//           </div>

//           {/* Stock Input Block */}
//           <div>
//             <label className="block font-semibold text-slate-700 mb-1">
//               Available Stock *
//             </label>
//             <input
//               type="number"
//               value={form.stock || ""}
//               onChange={(e) => setForm({ ...form, stock: e.target.value })}
//               className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
//                 fieldErrors?.stock ? "border-rose-400 focus:ring-rose-500" : ""
//               }`}
//             />
//             <RenderFieldError fieldName="stock" />
//           </div>

//           {/* Hybrid Images Management System Block */}
//           <div className="space-y-2 border-t pt-3 border-slate-100">
//             <div className="flex justify-between items-center">
//               <label className="block font-semibold text-slate-700">
//                 Product Image Links (Comma Separated)
//               </label>
//               {uploadingImage && (
//                 <span className="text-[10px] text-blue-600 font-medium animate-pulse flex items-center gap-1">
//                   <div className="h-2 w-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
//                   Uploading file...
//                 </span>
//               )}
//             </div>

//             <input
//               type="text"
//               value={form.images || ""}
//               onChange={(e) => setForm({ ...form, images: e.target.value })}
//               className={`w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-1 focus:ring-blue-500 outline-none ${
//                 fieldErrors?.images ? "border-rose-400 focus:ring-rose-500" : ""
//               }`}
//               placeholder="https://site.com/img1.png, https://site.com/img2.png"
//             />

//             <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4">
//               <div>
//                 <p className="font-semibold text-slate-700 text-[11px]">
//                   Or upload directly from local storage
//                 </p>
//                 <p className="text-[10px] text-slate-400">
//                   Supported formats: PNG, JPG, WEBP
//                 </p>
//               </div>
//               <label className="cursor-pointer bg-white border shadow-sm rounded-md px-3 py-1.5 font-semibold text-slate-700 text-xs hover:bg-slate-50 shrink-0 transition-colors">
//                 Choose File
//                 <input
//                   type="file"
//                   accept="image/*"
//                   disabled={uploadingImage}
//                   onChange={handleImageFileChange}
//                   className="hidden"
//                 />
//               </label>
//             </div>

//             {imageUploadError && (
//               <p className="text-rose-500 text-[10px] font-medium mt-1">
//                 {imageUploadError}
//               </p>
//             )}
//             <RenderFieldError fieldName="images" />
//           </div>
//         </form>

//         {/* Action Operations Footer Container */}
//         <div className="px-6 py-4 border-t bg-white rounded-b-xl flex justify-end gap-3 shrink-0">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             form="product-form"
//             disabled={submitLoading || uploadingImage}
//             className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
//           >
//             {submitLoading && (
//               <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//             )}
//             {modalMode === "create" ? "Add Product" : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductModal;
/* eslint-disable react/prop-types */
import { useState } from "react";
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

  if (!isOpen) return null;

  // Helper: Parses comma-separated string URLs from the form state into a safe array
  const getImageUrlsArray = () => {
    if (!form.images) return [];
    if (Array.isArray(form.images)) return form.images;
    return form.images
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  };

  // Extract file names cleanly from the Cloudinary URL strings
  const getFileNameFromUrl = (url) => {
    try {
      const segments = url.split("/");
      return segments[segments.length - 1]; // Grabs 'image_name.jpg' from the URL
    } catch {
      return "Uploaded Image Asset";
    }
  };

  // Handles raw image uploads directly to the backend endpoint
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploadError("");
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/products/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newImageUrl = data.url || data.imageUrl;

      if (newImageUrl) {
        const currentUrls = getImageUrlsArray();
        // Append the new URL asset to the list
        const updatedUrls = [...currentUrls, newImageUrl];

        setForm({
          ...form,
          // We save it back as a comma-separated string to match your frontend form system setup
          images: updatedUrls.join(", "),
        });
      }
    } catch (err) {
      console.error("Image uploading context failure:", err);
      setImageUploadError(
        err.response?.data?.message ||
          "File upload failed. Please verify asset type.",
      );
    } finally {
      setUploadingImage(false);
      e.target.value = ""; // Flushes file target memory
    }
  };

  // Allows removing an uploaded file by clicking an "x" button
  const handleRemoveImage = (indexToRemove) => {
    const currentUrls = getImageUrlsArray();
    const updatedUrls = currentUrls.filter(
      (_, index) => index !== indexToRemove,
    );
    setForm({
      ...form,
      images: updatedUrls.join(", "),
    });
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
          {/* Product Title Input Block */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
                fieldErrors?.name ? "border-rose-400 focus:ring-rose-500" : ""
              }`}
            />
            <RenderFieldError fieldName="name" />
          </div>

          {/* Description Input Block */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows="3"
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
                fieldErrors?.description
                  ? "border-rose-400 focus:ring-rose-500"
                  : ""
              }`}
            />
            <RenderFieldError fieldName="description" />
          </div>

          {/* Category Links Input Block */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assigned Merchandising Category *
            </label>
            <select
              value={form.categoryId || ""}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer ${
                fieldErrors?.categoryId
                  ? "border-rose-400 focus:ring-rose-500"
                  : ""
              }`}
            >
              <option value="">-- Choose Category Linkage Node --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <RenderFieldError fieldName="categoryId" />
          </div>

          {/* Pricing Double Column Layout Block */}
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
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
                  fieldErrors?.price
                    ? "border-rose-400 focus:ring-rose-500"
                    : ""
                }`}
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
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
                  fieldErrors?.comparePrice
                    ? "border-rose-400 focus:ring-rose-500"
                    : ""
                }`}
              />
              <RenderFieldError fieldName="comparePrice" />
            </div>
          </div>

          {/* Stock Input Block */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Available Stock *
            </label>
            <input
              type="number"
              value={form.stock || ""}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none ${
                fieldErrors?.stock ? "border-rose-400 focus:ring-rose-500" : ""
              }`}
            />
            <RenderFieldError fieldName="stock" />
          </div>

          {/* Clean File List Images Management Block */}
          <div className="space-y-2 border-t pt-3 border-slate-100">
            <div className="flex justify-between items-center">
              <label className="block font-semibold text-slate-700">
                Product Images
              </label>
              {uploadingImage && (
                <span className="text-[10px] text-blue-600 font-medium animate-pulse flex items-center gap-1">
                  <div className="h-2 w-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Uploading file...
                </span>
              )}
            </div>

            {/* Render file list instead of a text input box */}
            {uploadedImages.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-hide">
                {uploadedImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-50 border rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-xs text-slate-600 truncate max-w-[85%]">
                      {getFileNameFromUrl(url)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="text-rose-500 hover:text-rose-700 font-bold text-sm px-1"
                      title="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
                No images uploaded yet for this product.
              </p>
            )}

            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4 mt-2">
              <div>
                <p className="font-semibold text-slate-700 text-[11px]">
                  Upload images from your computer
                </p>
                <p className="text-[10px] text-slate-400">
                  Supported formats: PNG, JPG, WEBP
                </p>
              </div>
              <label className="cursor-pointer bg-white border shadow-sm rounded-md px-3 py-1.5 font-semibold text-slate-700 text-xs hover:bg-slate-50 shrink-0 transition-colors">
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

        {/* Action Operations Footer Container */}
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
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
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
