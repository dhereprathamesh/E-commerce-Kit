import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.data || res.data);
      } catch (err) {
        console.error("Error pulling unique record metrics context:", err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  if (loading)
    return (
      <div className="p-8 text-center">Loading order parameters summary...</div>
    );
  if (!order)
    return (
      <div className="p-8 text-center text-red-500">
        Order tracking file record target parameters index missing.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="border border-green-200 bg-green-50 rounded-xl p-6 text-center mb-6">
        <h1 className="text-xl font-bold text-green-900">
          🎉 Order Summary Verified Successfully!
        </h1>
        <p className="text-sm text-green-700 mt-1">
          Local database reference key reference hash tracking target: #
          {order.id}
        </p>
      </div>

      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4 mb-6">
        <h2 className="font-semibold text-lg border-b pb-2">
          Purchased Line Items
        </h2>
        <div className="divide-y">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="py-3 flex justify-between items-center text-sm"
            >
              <div>
                <div className="font-medium">
                  {item.product?.name || "E-Commerce Product Item"}
                </div>
                <div className="text-xs text-gray-500">
                  Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                </div>
              </div>
              <div className="font-semibold">
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-xl p-4 bg-white shadow-sm mb-6 text-sm">
        <h2 className="font-semibold text-lg border-b pb-2 mb-3">
          Delivery Address
        </h2>
        <div className="text-gray-700 space-y-0.5">
          <div className="font-medium text-slate-900">
            {order.address?.fullName}
          </div>
          <div>{order.address?.line1}</div>
          {order.address?.line2 && <div>{order.address?.line2}</div>}
          <div>
            {order.address?.city}, {order.address?.state} -{" "}
            {order.address?.pincode}
          </div>
          <div className="text-gray-500 mt-1">
            Phone: {order.address?.phone}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm font-medium text-center hover:bg-gray-50"
        >
          View All Past History Invoices
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium text-center hover:bg-slate-800"
        >
          Continue Shopping
        </button>
      </div>
      {/* --- UPDATED: REPLACED BOTTOM BUTTON BAR WITH TRACKING ENTRY --- */}
      <div className="space-y-3">
        <button
          onClick={() => navigate(`/order-tracking/${order.id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold text-center transition shadow-sm flex items-center justify-center gap-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Track Live Delivery Status
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 border border-slate-300 py-2.5 rounded-lg text-sm font-medium text-center hover:bg-gray-50 text-slate-700"
          >
            View All Invoices
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium text-center hover:bg-slate-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
