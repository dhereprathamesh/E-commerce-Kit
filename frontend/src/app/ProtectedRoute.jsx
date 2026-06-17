import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// eslint-disable-next-line react/prop-types
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  // 1. If not logged in, redirect to login page and save intended location
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If it's an admin route but the user is a standard CUSTOMER, redirect to home
  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // 3. Authorized access granted
  return children;
}
