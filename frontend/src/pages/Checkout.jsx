// import { useEffect, useState } from "react";
// import api from "../services/api";
// // import { useCartStore } from "../store/cartStore";

// export default function Checkout() {
//   //   const { cart, clearCart } = useCartStore();

//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [coupon, setCoupon] = useState("");
//   const [discount, setDiscount] = useState(0);

//   //   const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

//   //   const total = subtotal - discount;

//   useEffect(() => {
//     loadAddresses();
//   }, []);

//   const loadAddresses = async () => {
//     try {
//       const res = await api.get("/addresses");
//       setAddresses(res.data.addresses || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const applyCoupon = async () => {
//     try {
//       const res = await api.post("/coupons/validate", {
//         code: coupon,
//         total: 10,
//       });

//       setDiscount(res.data.discount || 0);
//     } catch (err) {
//       alert("Invalid coupon", err);
//     }
//   };

//   const placeOrder = async () => {
//     try {
//       if (!selectedAddress) {
//         alert("Select address");
//         return;
//       }

//       // STEP 1: Create order in backend
//       const orderRes = await api.post("/orders", {
//         items: 10,
//         address: selectedAddress,
//         totalAmount: 20,
//         discountAmount: discount,
//         finalAmount: 10,
//       });

//       const orderId = orderRes.data.order.id;

//       // STEP 2: Create Razorpay order
//       const payRes = await api.post("/payments/create-order", {
//         orderId,
//       });

//       const razorpayOrder = payRes.data.razorpayOrder;

//       // STEP 3: Open Razorpay
//       const options = {
//         key: "YOUR_RAZORPAY_KEY",
//         amount: razorpayOrder.amount,
//         currency: "INR",
//         order_id: razorpayOrder.id,

//         handler: async function (response) {
//           await api.post("/payments/verify", {
//             ...response,
//             orderId,
//           });

//           //   clearCart();
//           window.location.href = `/order-confirmation/${orderId}`;
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-4 space-y-6">
//       <h1 className="text-2xl font-semibold">Checkout</h1>

//       {/* ADDRESS */}
//       <section>
//         <h2 className="font-semibold mb-2">Select Address</h2>

//         <div className="space-y-2">
//           {addresses.map((a) => (
//             <div
//               key={a.id}
//               onClick={() => setSelectedAddress(a)}
//               className={`border p-3 rounded cursor-pointer ${
//                 selectedAddress?.id === a.id ? "border-black" : ""
//               }`}
//             >
//               <div className="font-medium">{a.fullName}</div>
//               <div className="text-sm text-gray-600">
//                 {a.line1}, {a.city}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* COUPON */}
//       <section>
//         <h2 className="font-semibold mb-2">Coupon</h2>

//         <div className="flex gap-2">
//           <input
//             value={coupon}
//             onChange={(e) => setCoupon(e.target.value)}
//             placeholder="Enter coupon"
//             className="border p-2 flex-1"
//           />

//           <button onClick={applyCoupon} className="bg-black text-white px-4">
//             Apply
//           </button>
//         </div>
//       </section>

//       {/* ORDER SUMMARY */}
//       <section className="border p-4 rounded">
//         <h2 className="font-semibold mb-3">Order Summary</h2>

//         <div className="space-y-1 text-sm">
//           <div>Subtotal: ₹{20}</div>
//           <div>Discount: -₹{discount}</div>
//           <div className="font-bold">Total: ₹{10}</div>
//         </div>
//       </section>

//       {/* PLACE ORDER */}
//       <button
//         onClick={placeOrder}
//         className="w-full bg-black text-white py-3 rounded"
//       >
//         Pay & Place Order
//       </button>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useCartStore } from "../store/cartStore";
import api from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();

  // State Management
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [loading, setLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const subtotal = getCartTotal();
  const finalAmount = Math.max(0, subtotal - discountAmount);

  // 1. Redirect if checkout is triggered with an empty shopping cart
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // 2. Fetch customer saved addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("/users/addresses"); // Assumed endpoint for user addresses
        const addressData = response.data || [];
        setAddresses(addressData);

        // Auto-select default address if it exists
        const defaultAddr = addressData.find((addr) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addressData.length > 0) {
          setSelectedAddressId(addressData[0].id);
        }
      } catch (err) {
        console.error("Error fetching delivery addresses:", err);
      }
    };
    fetchAddresses();
  }, []);

  // 3. Handle Coupon Validation
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponCode) return;

    try {
      const response = await api.post("/coupons/validate", {
        code: couponCode,
        orderValue: subtotal,
      });

      const { discountType, discountValue } = response.data;
      let calculatedDiscount = 0;

      if (discountType === "PERCENTAGE") {
        calculatedDiscount = (subtotal * discountValue) / 100;
      } else {
        calculatedDiscount = discountValue; // FIXED amount
      }

      setDiscountAmount(calculatedDiscount);
      setAppliedCoupon(couponCode);
      setCouponSuccess(`Coupon "${couponCode}" applied successfully!`);
    } catch (err) {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      setCouponError(
        err.response?.data?.message || "Invalid or expired coupon.",
      );
    }
  };

  // 4. Handle Order Submission and Payment Processing
  const handlePlaceOrder = async () => {
    setCheckoutError("");
    if (!selectedAddressId) {
      setCheckoutError(
        "Please select a shipping address before completing checkout.",
      );
      return;
    }

    setLoading(true);
    const chosenAddress = addresses.find(
      (addr) => addr.id === selectedAddressId,
    );

    try {
      // Step A: Create order shell instance on your Node.js backend
      const orderResponse = await api.post("/orders", {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: subtotal,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        couponCode: appliedCoupon,
        address: chosenAddress,
      });

      const createdOrder = orderResponse.data;

      // Step B: Create payment tracking reference from Razorpay endpoint
      const paymentOrderResponse = await api.post("/payments/create-order", {
        orderId: createdOrder.id,
        amount: finalAmount,
      });

      const { razorpayOrderId, keyId } = paymentOrderResponse.data;

      // Step C: Trigger Razorpay Checkout overlay window engine
      const options = {
        key: keyId,
        amount: finalAmount * 100, // Razorpay requires amounts in smaller subunits (paise)
        currency: "INR",
        name: "STOREKIT Commerce",
        description: `Payment for Order #${createdOrder.id.substring(0, 8)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Triggered on modal completion success
          try {
            setLoading(true);
            await api.post("/payments/verify", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              orderId: createdOrder.id,
            });

            clearCart();
            navigate(`/order-confirmation/${createdOrder.id}`);
            // eslint-disable-next-line no-unused-vars
          } catch (verifyErr) {
            setCheckoutError(
              "Payment verification failed. Please contact support.",
            );
            setLoading(false);
          }
        },
        prefill: {
          name: chosenAddress.fullName,
          contact: chosenAddress.phone,
        },
        theme: {
          color: "#0f172a", // Slate-900 color scheme
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout orchestration failure:", err);
      setCheckoutError(
        err.response?.data?.message || "Failed to initialize order placement.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">
        Secure Checkout
      </h1>

      {checkoutError && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
        {/* Left Column: Delivery Preferences */}
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              1. Select Shipping Address
            </h2>

            {addresses.length === 0 ? (
              <p className="text-sm text-slate-500">
                No addresses found. Please add a fulfillment delivery address in
                your profile dashboard.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">
                          {addr.fullName}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            {addr.phone}
                          </span>
                        </p>
                        <p className="mt-1">
                          {addr.line1}, {addr.line2 && `${addr.line2}, `}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Recaps & Promotions */}
        <div className="mt-8 lg:mt-0 lg:col-span-5 space-y-6">
          {/* Coupon Entry Block */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-slate-900 mb-3">
              Apply Promotional Code
            </h2>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                type="submit"
                disabled={!!appliedCoupon}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
              >
                Apply
              </button>
            </form>
            {couponError && (
              <p className="mt-2 text-xs text-rose-600">{couponError}</p>
            )}
            {couponSuccess && (
              <p className="mt-2 text-xs text-emerald-600">{couponSuccess}</p>
            )}
          </div>

          {/* Pricing Ledger Card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>
                  Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                  items)
                </span>
                <span className="font-medium text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-6 w-full rounded-md bg-blue-600 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400 transition-colors"
            >
              {loading ? "Processing Transaction..." : "Authorize & Pay Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
