import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminPurchaseOrders() {
  const [poList, setPoList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    supplierId: "",
    items: [{ productId: "", quantity: 1, purchasePrice: 0 }],
  });

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const [poRes, supRes, prodRes] = await Promise.all([
        api.get("/purchase-orders"),
        api.get("/suppliers"),
        api.get("/products"),
      ]);

      setPoList(poRes.data || []);
      setSuppliers(supRes.data || []);
      setProducts(prodRes.data?.data || prodRes.data || []);
    };

    fetchData();
  }, []);

  // ADD ITEM ROW
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, purchasePrice: 0 }],
    }));
  };

  // UPDATE ITEM
  const updateItem = (index, key, value) => {
    const updated = [...form.items];
    updated[index][key] = value;
    setForm({ ...form, items: updated });
  };

  // SUBMIT PO
  const createPO = async () => {
    try {
      await api.post("/purchase-orders", form);

      alert("Purchase Order Created");

      const res = await api.get("/purchase-orders");
      setPoList(res.data || []);

      setForm({
        supplierId: "",
        items: [{ productId: "", quantity: 1, purchasePrice: 0 }],
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create PO");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Purchase Orders</h1>

      {/* CREATE PO */}
      <div className="border p-4 rounded-lg space-y-4 bg-white">
        <h2 className="font-semibold">Create Purchase Order</h2>

        <select
          value={form.supplierId}
          onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          className="border p-2 w-full"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* ITEMS */}
        {form.items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <select
              value={item.productId}
              onChange={(e) => updateItem(index, "productId", e.target.value)}
              className="border p-2 flex-1"
            >
              <option value="">Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", Number(e.target.value))
              }
              className="border p-2 w-24"
            />

            <input
              type="number"
              placeholder="Price"
              value={item.purchasePrice}
              onChange={(e) =>
                updateItem(index, "purchasePrice", Number(e.target.value))
              }
              className="border p-2 w-28"
            />
          </div>
        ))}

        <button onClick={addItem} className="text-blue-600">
          + Add Item
        </button>

        <button
          onClick={createPO}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create PO
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {poList.map((po) => (
          <div key={po.id} className="border p-3 rounded bg-white">
            <div className="flex justify-between">
              <p className="font-semibold">PO #{po.id.slice(0, 6)}</p>
              <span className="text-sm">{po.status}</span>
            </div>

            <p className="text-sm text-gray-500">
              Supplier: {po.supplier?.name}
            </p>

            <p className="text-sm">Total: ${po.totalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
