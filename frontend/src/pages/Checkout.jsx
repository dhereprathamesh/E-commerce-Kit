import { useEffect, useState } from "react";
import api from "../services/api";
// import { useCartStore } from "../store/cartStore";

export default function Checkout() {
  //   const { cart, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  //   const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  //   const total = subtotal - discount;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.log(err);
    }
  };

  const applyCoupon = async () => {
    try {
      const res = await api.post("/coupons/validate", {
        code: coupon,
        total: 10,
      });

      setDiscount(res.data.discount || 0);
    } catch (err) {
      alert("Invalid coupon", err);
    }
  };

  const placeOrder = async () => {
    try {
      if (!selectedAddress) {
        alert("Select address");
        return;
      }

      // STEP 1: Create order in backend
      const orderRes = await api.post("/orders", {
        items: 10,
        address: selectedAddress,
        totalAmount: 20,
        discountAmount: discount,
        finalAmount: 10,
      });

      const orderId = orderRes.data.order.id;

      // STEP 2: Create Razorpay order
      const payRes = await api.post("/payments/create-order", {
        orderId,
      });

      const razorpayOrder = payRes.data.razorpayOrder;

      // STEP 3: Open Razorpay
      const options = {
        key: "YOUR_RAZORPAY_KEY",
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.id,

        handler: async function (response) {
          await api.post("/payments/verify", {
            ...response,
            orderId,
          });

          //   clearCart();
          window.location.href = `/order-confirmation/${orderId}`;
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      {/* ADDRESS */}
      <section>
        <h2 className="font-semibold mb-2">Select Address</h2>

        <div className="space-y-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelectedAddress(a)}
              className={`border p-3 rounded cursor-pointer ${
                selectedAddress?.id === a.id ? "border-black" : ""
              }`}
            >
              <div className="font-medium">{a.fullName}</div>
              <div className="text-sm text-gray-600">
                {a.line1}, {a.city}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COUPON */}
      <section>
        <h2 className="font-semibold mb-2">Coupon</h2>

        <div className="flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter coupon"
            className="border p-2 flex-1"
          />

          <button onClick={applyCoupon} className="bg-black text-white px-4">
            Apply
          </button>
        </div>
      </section>

      {/* ORDER SUMMARY */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold mb-3">Order Summary</h2>

        <div className="space-y-1 text-sm">
          <div>Subtotal: ₹{20}</div>
          <div>Discount: -₹{discount}</div>
          <div className="font-bold">Total: ₹{10}</div>
        </div>
      </section>

      {/* PLACE ORDER */}
      <button
        onClick={placeOrder}
        className="w-full bg-black text-white py-3 rounded"
      >
        Pay & Place Order
      </button>
    </div>
  );
}
