import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import ProductList from "../pages/ProductList";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderConfirmation from "../pages/OrderConfirmation";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />

      {/* Checkout */}
      <Route path="/checkout" element={<Checkout />} />

      {/* Order success page */}
      <Route
        path="/order-confirmation/:orderId"
        element={<OrderConfirmation />}
      />
    </Routes>
  );
}
