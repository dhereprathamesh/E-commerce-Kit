import { useParams } from "react-router-dom";

export default function OrderConfirmation() {
  const { orderId } = useParams();

  return (
    <div className="max-w-3xl mx-auto p-6 text-center space-y-4">
      <h1 className="text-3xl font-bold text-green-600">
        Order Placed Successfully 🎉
      </h1>

      <p>Order ID:</p>
      <div className="font-mono">{orderId}</div>

      <p className="text-gray-600">
        You will receive confirmation email shortly.
      </p>

      <a
        href="/"
        className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Continue Shopping
      </a>
    </div>
  );
}
