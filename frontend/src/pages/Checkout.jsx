import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import api from "../services/api";

// Helper function to dynamically pull Razorpay SDK checkout scripts safely inside windows DOM scope
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  // 1. Redirect if shopping cart items count hits zero bounds
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // 2. Fetch customer saved shipping locations array parameters
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("/addresses");
        const addressData = response.data.data || response.data.addresses || [];
        setAddresses(addressData);

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

  // 3. Handle Coupon Applied Validation logic updates
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
        calculatedDiscount = discountValue;
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

  // 4. Main Gateway Execution Orchestration Engine
  const handlePlaceOrder = async () => {
    setCheckoutError("");
    if (!selectedAddressId) {
      setCheckoutError(
        "Please select a shipping address before completing checkout.",
      );
      return;
    }

    setLoading(true);

    // Verify script dependencies are ready
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setCheckoutError(
        "Razorpay SDK failed to load. Check your internet connection.",
      );
      setLoading(false);
      return;
    }

    const chosenAddress = addresses.find(
      (addr) => addr.id === selectedAddressId,
    );

    try {
      // Step A: Create application database core tracking reference shell instance
      const orderResponse = await api.post("/orders", {
        addressId: selectedAddressId,
        couponCode: appliedCoupon,
      });

      // FIX: Safely pull the id from orderResponse.data.data depending on your controller wrap structures
      const createdOrderData = orderResponse.data.data || orderResponse.data;
      const targetOrderId = createdOrderData.id;

      if (!targetOrderId) {
        throw new Error(
          "Backend response model did not expose a valid Order UUID reference key identifier.",
        );
      }

      // Step B: Initialize Payment Pipeline Request configuration structures
      const paymentOrderResponse = await api.post("/payments/create-order", {
        orderId: targetOrderId,
      });

      const { razorpayOrderId, keyId, amount } = paymentOrderResponse.data;

      // Step C: Construct configurations options array parameters mapping structure rules
      const options = {
        key: keyId || "rzp_test_xkbNMDy3tEih9d",
        amount: amount,
        currency: "INR",
        name: "STOREKIT Commerce",
        description: `Payment for Order #${targetOrderId.substring(0, 8)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            setLoading(true);
            // Explicitly map properties back to payment router hooks matching verify endpoint properties
            await api.post("/payments/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: targetOrderId,
            });

            clearCart();
            navigate(`/order-confirmation/${targetOrderId}`);
          } catch (verifyErr) {
            console.error(
              "Verification processing endpoint rejected execution payload:",
              verifyErr,
            );
            setCheckoutError(
              verifyErr.response?.data?.message ||
                "Payment verification failed. Contact support.",
            );
            setLoading(false);
          }
        },
        prefill: {
          name: chosenAddress?.fullName || "",
          contact: chosenAddress?.phone || "",
        },
        theme: {
          color: "#0f172a",
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
      console.error("Checkout system failure exception context:", err);
      setCheckoutError(
        err.response?.data?.message ||
          err.message ||
          "Failed to finalize workflow transactions processing.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {checkoutError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {checkoutError}
        </div>
      )}

      {/* SAVED ADDRESS SELECTOR INTERFACE */}
      <section className="mb-6">
        <h2 className="text-lg font-medium mb-3">Select Shipping Address</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => setSelectedAddressId(addr.id)}
              className={`border p-4 rounded-lg cursor-pointer transition ${
                selectedAddressId === addr.id
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold">{addr.fullName}</div>
              <div className="text-sm text-gray-600 mt-1">
                {addr.line1}, {addr.city}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                Phone: {addr.phone}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DISCOUNT COUPON CODE SECTION CONTAINER */}
      <section className="border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-md font-medium mb-2">Have a Promo Coupon?</h2>
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="COUPONCODE"
            className="border border-gray-300 p-2 rounded flex-1 uppercase text-sm"
            disabled={loading || !!appliedCoupon}
          />
          <button
            type="submit"
            className="bg-slate-900 text-white px-4 py-2 rounded text-sm hover:bg-slate-800 disabled:opacity-50"
            disabled={loading || !couponCode || !!appliedCoupon}
          >
            Apply
          </button>
        </form>
        {couponError && (
          <p className="text-red-600 text-xs mt-2">{couponError}</p>
        )}
        {couponSuccess && (
          <p className="text-green-600 text-xs mt-2">{couponSuccess}</p>
        )}
      </section>

      {/* ACCOUNT TRANSACTIONAL STATS SUMMARY SUMMARY */}
      <section className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
        <h2 className="text-md font-semibold border-b pb-2 mb-3">
          Pricing Breakdown
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Cart Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount:</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2 text-slate-900">
            <span>Total Due:</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <button
        onClick={handlePlaceOrder}
        disabled={loading || items.length === 0}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Processing Secure Gateway Transaction..."
          : "Authorize and Place Order"}
      </button>
    </div>
  );
}
