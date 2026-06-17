// export default function Cart() {
//   const cart = [];

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-2xl font-semibold">Your Cart</h1>

//       <div className="mt-6 space-y-3">
//         {cart.length === 0 ? (
//           <p>No items in cart</p>
//         ) : (
//           cart.map((item) => (
//             <div key={item.id} className="border p-3 rounded">
//               <div>{item.name}</div>
//               <div>Qty: {item.qty}</div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();

  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <div className="mt-6">
          <Link
            to="/products"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Shopping Cart
      </h1>

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        {/* Main Items List Container */}
        <section aria-labelledby="cart-heading" className="lg:col-span-7">
          <ul
            role="list"
            className="divide-y divide-slate-200 border-t border-b border-slate-200"
          >
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId}`}
                className="flex py-6 sm:py-10"
              >
                <div className="flex-shrink-0">
                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.name}
                    className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm">
                          <Link
                            to={`/products/${item.productId}`}
                            className="font-medium text-slate-700 hover:text-slate-800"
                          >
                            {item.name}
                          </Link>
                        </h3>
                      </div>
                      {item.variantName && (
                        <p className="mt-1 text-sm text-slate-500">
                          {item.variantName}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        ${item.price}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                      {/* Quantity Toggler */}
                      <div className="flex items-center border border-slate-300 rounded w-max">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1,
                            )
                          }
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="px-3 text-sm font-medium text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <div className="absolute top-0 right-0">
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="-m-2 inline-flex p-2 text-slate-400 hover:text-slate-500 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order Pricing Summary Block */}
        <section
          aria-labelledby="summary-heading"
          className="mt-16 rounded-lg bg-slate-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
        >
          <h2
            id="summary-heading"
            className="text-lg font-medium text-slate-900"
          >
            Order Summary
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-600">Subtotal</dt>
              <dd className="text-sm font-medium text-slate-900">
                ${total.toFixed(2)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <dt className="text-base font-medium text-slate-900">
                Order Total
              </dt>
              <dd className="text-base font-medium text-slate-900">
                ${total.toFixed(2)}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <button
              onClick={() => navigate("/checkout")}
              className="w-full rounded-md border border-transparent bg-slate-900 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
