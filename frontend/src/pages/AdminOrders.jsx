import { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Reusing your active customer route directly for the active profile sessions
      const res = await api.get("/orders/my");
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not safely download order records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusTransition = async (orderId, currentStatus, newStatus) => {
    try {
      // Connects directly to router.put("/status", ...) body expectations
      await api.put("/orders/status", {
        orderId: orderId,
        status: newStatus,
        message: `Fulfillment changed from ${currentStatus} to ${newStatus} via backoffice console actions.`,
      });

      // Update state arrays locally immediately to optimize rendering reactivity
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      // Catches and renders your backend error models (like: "Invalid status transition: PENDING → SHIPPED")
      alert(`Transition error: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-sm text-slate-500 animate-pulse">
        Accessing centralized records...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-sm text-rose-600 bg-rose-50 border rounded-lg m-6">
        {error}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Order Management Core
      </h1>
      <div className="border bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b font-semibold text-slate-700">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Total Price</th>
              <th className="p-4">Current Stage</th>
              <th className="p-4">Modify Pipeline Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-600">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-slate-400 text-xs"
                >
                  No transaction records found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30">
                  <td className="p-4 font-mono text-xs text-slate-900 font-semibold">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    ${order.finalAmount?.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {/* Status lifecycle drop management selector element */}
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusTransition(
                          order.id,
                          order.status,
                          e.target.value,
                        )
                      }
                      className="border rounded text-xs p-1 bg-white cursor-pointer focus:ring-1 focus:ring-blue-500"
                    >
                      {[
                        "PENDING",
                        "CONFIRMED",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                      ].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
