// // import { Routes, Route } from "react-router-dom";

// // import Home from "../pages/Home";
// // import ProductList from "../pages/ProductList";
// // import ProductDetail from "../pages/ProductDetail";
// // import Cart from "../pages/Cart";
// // import Checkout from "../pages/Checkout";
// // import OrderConfirmation from "../pages/OrderConfirmation";

// // export default function AppRoutes() {
// //   return (
// //     <Routes>
// //       <Route path="/" element={<Home />} />
// //       <Route path="/products" element={<ProductList />} />
// //       <Route path="/products/:slug" element={<ProductDetail />} />
// //       <Route path="/cart" element={<Cart />} />

// //       {/* Checkout */}
// //       <Route path="/checkout" element={<Checkout />} />

// //       {/* Order success page */}
// //       <Route
// //         path="/order-confirmation/:orderId"
// //         element={<OrderConfirmation />}
// //       />
// //     </Routes>
// //   );
// // }

// import { Routes, Route } from "react-router-dom";

// // Public Pages
// import Home from "../pages/Home";
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import ProductList from "../pages/ProductList";
// import ProductDetail from "../pages/ProductDetail";
// import Cart from "../pages/Cart";

// // Protected Customer Pages

// // Protected Admin Pages (SAP Hybris Backoffice counterparts)
// // import AdminDashboard from "./pages/admin/AdminDashboard";
// // import AdminProducts from "./pages/admin/AdminProducts";

// // Guard
// import ProtectedRoute from "./ProtectedRoute";
// import Profile from "../pages/Profile";
// import OrderHistory from "../pages/OrderHistory";
// import Checkout from "../pages/Checkout";

// export default function AppRoutes() {
//   console.log("AppRoutes.js file");
//   return (
//     <>
//       <Routes>
//         {/* --- PUBLIC ROUTES --- */}
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/products" element={<ProductList />} />
//         <Route path="/products/:slug" element={<ProductDetail />} />
//         <Route path="/cart" element={<Cart />} />

//         {/* --- PROTECTED CUSTOMER ROUTES --- */}
//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/orders"
//           element={
//             <ProtectedRoute>
//               <OrderHistory />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/checkout"
//           element={
//             <ProtectedRoute>
//               <Checkout />
//             </ProtectedRoute>
//           }
//         />

//         {/* --- PROTECTED ADMIN ROUTES --- */}
//         {/* <Route
//           path="/admin/dashboard"
//           element={
//             <ProtectedRoute adminOnly={true}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/admin/products"
//           element={
//             <ProtectedRoute adminOnly={true}>
//               <AdminProducts />
//             </ProtectedRoute>
//           }
//         /> */}
//       </Routes>
//     </>
//   );
// }
import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductList from "../pages/ProductList";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";

// Protected Customer Pages
import Profile from "../pages/Profile";
import OrderHistory from "../pages/OrderHistory";
import Checkout from "../pages/Checkout";

// Protected Admin Pages (SAP Hybris Backoffice counterparts)

// Guard Rule Module
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard";
import AdminProducts from "../pages/AdminProducts";
import AdminProductCreate from "../pages/AdminProductCreate";
import AdminOrders from "../pages/AdminOrders";
import OrderConfirmation from "../pages/OrderConfirmation";
import OrderTracking from "../pages/OrderTracking";
import AdminPurchaseOrders from "../pages/AdminPurchaseOrders";
import AdminSuppliers from "../pages/AdminSuppliers";
import AdminSupplierCreate from "../pages/AdminSupplierCreate";

export default function AppRoutes() {
  console.log(
    "AppRoutes file parsed successfully with role segregation active.",
  );

  return (
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
        path="/order-confirmation/:orderId"
        element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-tracking/:orderId"
        element={
          <ProtectedRoute>
            <OrderTracking />
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

      {/* --- PROTECTED ADMIN ROUTES (adminOnly={true}) --- */}
      <Route
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
      />
      <Route
        path="/admin/products/create"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminProductCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/purchase-orders"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPurchaseOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/suppliers"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminSuppliers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/suppliers/create"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminSupplierCreate />
          </ProtectedRoute>
        }
      />
      {/* --- CATCH-ALL FALLBACK REDIRECT --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
