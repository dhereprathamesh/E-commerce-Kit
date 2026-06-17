import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

const ORDER_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Error fetching live order track data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderStatus();

    // Optional: Set up a polling interval every 30 seconds for live monitoring
    const interval = setInterval(fetchOrderStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading)
    return (
      <div className="text-center py-16 text-sm text-slate-500">
        Loading fulfillment milestones...
      </div>
    );
  if (!order)
    return (
      <div className="text-center py-16 text-sm text-rose-600">
        Order not found.
      </div>
    );

  // Compute active tracking stage index matching the schema enum
  const currentStepIndex = ORDER_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 pb-4 mb-6 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Fulfillment Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">ID: {order.id}</p>
          </div>
          <div className="text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full w-max">
            Status: {order.status}
          </div>
        </div>

        {/* Dynamic Visual Stepper Progress Bar */}
        <div className="py-6">
          <div className="relative flex items-center justify-between w-full">
            {/* Background Line Connector */}
            <div className="absolute left-0 top-1/2 h-0.5 w-full bg-slate-200 -translate-y-1/2 z-0" />

            {/* Filled Active Line Connector */}
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
              style={{
                width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
              }}
            />

            {/* Stepper Node Nodes */}
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <div
                  key={step}
                  className="relative flex flex-col items-center z-10"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border transition-colors duration-300 ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-300 text-slate-400"
                    } ${isActive ? "ring-4 ring-blue-100" : ""}`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`absolute top-10 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipment Details Box */}
        <div className="mt-16 border-t border-slate-100 pt-6 text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Delivery Address
            </h3>
            <p className="text-slate-700">{order.address?.fullName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {order.address?.line1}, {order.address?.city},{" "}
              {order.address?.state} - {order.address?.pincode}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Fulfillment Metadata
            </h3>
            <p>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="mt-1">
              Payment Status:{" "}
              <span className="font-medium text-slate-900">
                {order.paymentStatus}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
