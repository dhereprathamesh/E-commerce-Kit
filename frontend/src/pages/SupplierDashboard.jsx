import { useEffect, useState } from "react";
import api from "../services/api";

export default function SupplierDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchPO();
  }, []);

  const fetchPO = async () => {
    const res = await api.get("/supplier/purchase-orders");
    setOrders(res.data || []);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/supplier/purchase-orders/${id}/status`, {
      status,
    });

    fetchPO();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Supplier Dashboard</h1>

      {orders.map((po) => (
        <div key={po.id} className="border p-4 rounded bg-white">
          <div className="flex justify-between">
            <p className="font-semibold">PO #{po.id.slice(0, 6)}</p>
            <p>{po.status}</p>
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => updateStatus(po.id, "APPROVED")}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(po.id, "REJECTED")}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Reject
            </button>

            <button
              onClick={() => updateStatus(po.id, "SHIPPED")}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Ship
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
