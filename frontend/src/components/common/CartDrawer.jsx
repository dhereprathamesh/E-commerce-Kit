import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

// eslint-disable-next-line react/prop-types
export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { items, removeItem, getCartTotal } = useCartStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-modal="true"
      role="dialog"
    >
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-slate-500/75 transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-200 bg-white shadow-xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-4 py-6 sm:px-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900">
              Shopping Cart Drawer
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500 font-semibold text-sm"
            >
              Close
            </button>
          </div>

          {/* Drawer Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500">
                  Your cart drawer is completely empty.
                </p>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantId}`}
                    className="flex py-4"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="h-16 w-16 flex-shrink-0 rounded-md border object-cover"
                    />
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-slate-900">
                          <h4>{item.name}</h4>
                          <p className="ml-4">${item.price * item.quantity}</p>
                        </div>
                        {item.variantName && (
                          <p className="mt-1 text-xs text-slate-500">
                            {item.variantName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-1 items-end justify-between text-xs text-slate-500">
                        <p>Qty {item.quantity}</p>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="text-blue-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Drawer Footer Summary Action Container */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-6 sm:px-6 bg-slate-50">
              <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                <p>Subtotal</p>
                <p>${getCartTotal().toFixed(2)}</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
                className="w-full rounded-md bg-blue-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-500"
              >
                Go To Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
