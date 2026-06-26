/* eslint-disable react/prop-types */

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
  if (!isOpen) return null;

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
              Description
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

          {/* Images Array Links Input Block */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Image Links (Comma Separated)
            </label>
            <input
              type="text"
              value={form.images || ""}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className={`w-full border rounded-lg p-2.5 text-sm font-mono focus:ring-1 focus:ring-blue-500 outline-none ${
                fieldErrors?.images ? "border-rose-400 focus:ring-rose-500" : ""
              }`}
              placeholder="https://site.com/img1.png, https://site.com/img2.png"
            />
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
            disabled={submitLoading}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 flex items-center gap-2 disabled:bg-blue-400"
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
