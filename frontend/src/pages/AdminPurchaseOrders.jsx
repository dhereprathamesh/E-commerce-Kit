import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminPurchaseOrders() {
  const [poList, setPoList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // This state holds ALL products linked to the currently selected supplier
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    notes: "",
    items: [{ productId: "", quantity: 1, purchasePrice: 0 }],
  });

  // 1. FETCH INITIAL DATA (Purchase Orders & Suppliers Registry)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poRes, supRes] = await Promise.all([
          api.get("/purchase-orders"),
          api.get("/suppliers"),
        ]);

        setPoList(poRes.data || poRes.data?.data || []);
        setSuppliers(supRes.data || supRes.data?.data || []);
      } catch (err) {
        console.error(
          "Failed to load initial purchase order dependencies:",
          err,
        );
      }
    };

    fetchData();
  }, []);

  // 2. TRIGGER ON SUPPLIER CHANGE: Fix selection lock and parse dynamic array payload
  const handleSupplierChange = async (e) => {
    const selectedId = e.target.value;

    // CRITICAL FIX: Update the form state immediately so the HTML element unlocks visually
    setForm((prev) => ({
      ...prev,
      supplierId: selectedId,
      items: [{ productId: "", quantity: 1, purchasePrice: 0 }], // Clear old line items safely
    }));

    // Clear variations if selector resets to empty option
    if (!selectedId) {
      setFilteredProducts([]);
      return;
    }

    try {
      // Fetch matching items from your backend route setup
      const res = await api.get(`/purchase-orders/products/${selectedId}`);
      console.log("Response data stream raw check:", res);

      // Extract variations matching both nested and structural response objects
      const itemsPayload = res.data?.data || res.data || [];
      setFilteredProducts(itemsPayload);
    } catch (err) {
      console.error("Could not fetch filtered supplier inventory", err);
      setFilteredProducts([]);
    }
  };

  // ADD NEW ITEM ROW
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, purchasePrice: 0 }],
    }));
  };

  // REMOVE AN ITEM ROW
  const removeItem = (index) => {
    if (form.items.length === 1) return;
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  // UPDATE CONTROLLED INPUT FIELD VALUES
  const updateItem = (index, key, value) => {
    const updated = [...form.items];
    updated[index][key] = value;
    setForm({ ...form, items: updated });
  };

  // LIVE RUNTIME CALCULATIONS FOR FINANCIAL LAYOUT REVIEW
  const calculateLiveTotal = () => {
    return form.items.reduce(
      (sum, item) => sum + item.quantity * item.purchasePrice,
      0,
    );
  };

  // SUBMIT COMPLETED FORM TO BACKEND API
  const createPO = async (e) => {
    e.preventDefault();
    if (!form.supplierId) return alert("Please select a supplier first.");

    setLoading(true);
    try {
      await api.post("/purchase-orders", form);
      alert("Purchase Order successfully generated!");

      // Refresh historic tracking data safely
      const res = await api.get("/purchase-orders");
      setPoList(res.data || res.data?.data || []);

      // Clear layout elements
      setForm({
        supplierId: "",
        notes: "",
        items: [{ productId: "", quantity: 1, purchasePrice: 0 }],
      });
      setFilteredProducts([]);
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit PO",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">
          Create Purchase Order
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a vendor to dynamically unlock their mapped catalog products.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: INTERACTIVE CREATION MECHANISM */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 space-y-6 shadow-sm">
          <form onSubmit={createPO} className="space-y-6">
            {/* VENDOR PROFILE SELECTOR */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Supplier Profile
              </label>
              <select
                value={form.supplierId}
                onChange={handleSupplierChange}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Choose registered catalog supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DYNAMIC LINE ITEMS MANAGEMENT REGISTRY */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Catalog Line Items
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!form.supplierId}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-40"
                >
                  + Add Item Line
                </button>
              </div>

              {!form.supplierId ? (
                <div className="text-center text-xs text-slate-400 border border-dashed rounded-lg p-6 bg-slate-50/50">
                  Choose a supplier profile above to build line distributions.
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center text-xs text-amber-600 border border-amber-100 rounded-lg p-6 bg-amber-50/30">
                  This supplier does not have any authorized products linked in
                  the registry matrix.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50/60 p-3 rounded-md border border-slate-200"
                    >
                      {/* FILTERED PRODUCTS DROP-DOWN MENU CONTAINER */}
                      <div className="w-full sm:flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          required
                        >
                          <option value="">
                            Select mapped catalog variation...
                          </option>
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex w-full sm:w-auto gap-3">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Math.max(1, Number(e.target.value)),
                            )
                          }
                          className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-center focus:border-blue-500 focus:outline-none"
                          required
                        />

                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={item.purchasePrice || ""}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "purchasePrice",
                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded-md border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-slate-400 hover:text-red-500 text-xs px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADDITIONAL DOCUMENT CORRESPONDENCE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional internal workflow notes..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* ACTION DISPATCH CONTROLS STRATUM */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Gross Outlay
                </p>
                <p className="text-2xl font-black text-slate-900">
                  ${calculateLiveTotal().toFixed(2)}
                </p>
              </div>
              <button
                type="submit"
                disabled={
                  loading || !form.supplierId || filteredProducts.length === 0
                }
                className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-40 transition"
              >
                {loading ? "Processing..." : "Generate Purchase Order"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: RECENT DISPATCH RECORDS VIEW */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Dispatched Records Log ({poList.length})
          </h2>

          <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
            {poList.length === 0 ? (
              <div className="text-center p-8 bg-white border border-slate-200 rounded-lg text-slate-400 text-xs">
                No entries stored.
              </div>
            ) : (
              poList.map((po) => (
                <div
                  key={po.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-[10px] text-slate-400">
                        ID: #{po.id.slice(0, 8).toUpperCase()}
                      </p>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                        {po.supplier?.name || "System Vendor"}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getStatusBadge(po.status)}`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-slate-400">Total:</span>
                    <span className="font-bold text-slate-900">
                      ${po.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
