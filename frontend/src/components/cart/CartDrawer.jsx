import { Link } from "react-router-dom";

export default function CartDrawer() {
  const cart = []; // later Zustand

  return (
    <div className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg p-4">
      <h2 className="text-lg font-semibold">Cart</h2>

      <div className="mt-4 space-y-3">
        {cart.length === 0 && <p className="text-gray-500">Cart is empty</p>}
      </div>

      <Link
        to="/cart"
        className="block mt-4 bg-black text-white text-center p-2 rounded"
      >
        Go to Cart
      </Link>
    </div>
  );
}
