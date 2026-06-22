import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useMemo } from "react";

// eslint-disable-next-line react/prop-types
export default function ProtectedRoute({ children, adminOnly = false, customerOnly = false }) {
  const { user, token, logout } = useAuthStore();
  const location = useLocation();

  // Check expiration safely without causing re-renders on every single check
  const expired = useMemo(() => isTokenExpired(token), [token]);

  // Handle the side-effect of logging the user out
  useEffect(() => {
    if (expired && token) {
      logout(); // Clears user and token from Zustand/local storage
    }
  }, [expired, token, logout]);

  // 1. If not logged in, redirect to login page and save intended location
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If it's an admin route but the user is NOT an admin, redirect to home
  if (adminOnly && user.userType !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // 3. If it's a customer route but the user is NOT a customer, redirect appropriately
  if (customerOnly && user.userType !== "CUSTOMER") {
    // Optional: If an admin accidentally hits a customer route, send them to their dashboard
    const redirectPath = user.userType === "ADMIN" ? "/admin/products" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  // 4. Authorized access granted
  return children;
}

// Helper function to check if a JWT is expired (No extra libraries needed)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // JWT exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true; // If we can't parse it, consider it invalid
  }
};