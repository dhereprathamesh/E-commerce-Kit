import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        // Your backend design wraps array collections within a core 'data' object property wrapper
        setOrders(res.data.data || []);
      } catch (err) {
        console.error("Failed to parse customer order histories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading your orders...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Your Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-gray-50">
          <p className="text-gray-500 mb-4">
            You haven&apos;t placed any orders yet.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Shop Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <div className="font-semibold text-sm text-gray-500">
                  Order ID: #{order.id.substring(0, 8)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-2 flex gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                  >
                    Payment: {order.paymentStatus}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium">
                    Status: {order.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                <div className="font-bold text-lg">
                  ₹{order.finalAmount.toFixed(2)}
                </div>
                <button
                  onClick={() => navigate(`/order-confirmation/${order.id}`)}
                  className="mt-2 text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 w-full sm:w-auto text-center"
                >
                  View Details
                </button>
                {/* Find the button inside orders.map loop context inside OrderHistory.jsx */}
                <button
                  onClick={() => navigate(`/order-tracking/${order.id}`)}
                  className="mt-2 text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 w-full sm:w-auto text-center font-medium"
                >
                  Track Order Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
