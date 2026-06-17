// import { useParams } from "react-router-dom";

// export default function OrderConfirmation() {
//   const { orderId } = useParams();

//   return (
//     <div className="max-w-3xl mx-auto p-6 text-center space-y-4">
//       <h1 className="text-3xl font-bold text-green-600">
//         Order Placed Successfully 🎉
//       </h1>

//       <p>Order ID:</p>
//       <div className="font-mono">{orderId}</div>

//       <p className="text-gray-600">
//         You will receive confirmation email shortly.
//       </p>

//       <a
//         href="/"
//         className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
//       >
//         Continue Shopping
//       </a>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Error fetching confirmation order details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">
          Order tracking instantiation failed
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          We couldn&apos;t fetch details for Order ID: {orderId}
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center border-b border-slate-200 pb-8">
        {/* Success Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <svg
            className="h-6 w-6 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your payment was processed securely. A confirmation email has been
          dispatched to your account.
        </p>
        <p className="mt-4 text-xs font-mono bg-slate-100 text-slate-600 inline-block px-3 py-1 rounded-md">
          Order ID: {order.id}
        </p>
      </div>

      {/* Brief Summary Summary */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-slate-900">
          Transaction Summary
        </h2>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">
                  {item.product?.name}{" "}
                  <span className="text-xs text-slate-400">
                    x{item.quantity}
                  </span>
                </span>
                <span className="font-medium text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-base text-slate-900">
              <span>Amount Paid</span>
              <span>${order.finalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          to={`/orders/track/${order.id}`}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Track Live Status
        </Link>
        <Link
          to="/products"
          className="rounded-md bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
