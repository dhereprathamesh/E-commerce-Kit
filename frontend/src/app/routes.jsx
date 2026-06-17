// import { Routes, Route } from "react-router-dom";

// import Home from "../pages/Home";
// import ProductList from "../pages/ProductList";
// import ProductDetail from "../pages/ProductDetail";
// import Cart from "../pages/Cart";
// import Checkout from "../pages/Checkout";
// import OrderConfirmation from "../pages/OrderConfirmation";

// export default function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/products" element={<ProductList />} />
//       <Route path="/products/:slug" element={<ProductDetail />} />
//       <Route path="/cart" element={<Cart />} />

//       {/* Checkout */}
//       <Route path="/checkout" element={<Checkout />} />

//       {/* Order success page */}
//       <Route
//         path="/order-confirmation/:orderId"
//         element={<OrderConfirmation />}
//       />
//     </Routes>
//   );
// }

import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductList from "../pages/ProductList";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";

// Protected Customer Pages

// Protected Admin Pages (SAP Hybris Backoffice counterparts)
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import AdminProducts from "./pages/admin/AdminProducts";

// Guard
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Profile";
import OrderHistory from "../pages/OrderHistory";
import Checkout from "../pages/Checkout";

export default function AppRoutes() {
  console.log("AppRoutes.js file");
  return (
    <>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />

        {/* --- PROTECTED CUSTOMER ROUTES --- */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* --- PROTECTED ADMIN ROUTES --- */}
        {/* <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminProducts />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </>
  );
}
