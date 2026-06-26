import { Link, NavLink } from "react-router-dom"; // 1. Imported NavLink here
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.userType === "ADMIN";

  // 2. Extracted the styling rule into a clean helper string
  const activeTabClass = ({ isActive }) =>
    isActive
      ? "font-semibold text-blue-600"
      : "text-slate-600 hover:text-slate-900 transition-colors";

  return (
    <nav className="relative z-0 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo - Redirects Admins to Product Panel and Customers to Home */}
        <Link
          to={isAdmin ? "/admin/products" : "/"}
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          STORE<span className="text-blue-600">KIT</span>
          {isAdmin && (
            <span className="ml-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Console
            </span>
          )}
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          {/* --- CONDITIONALLY RENDERED LINKS --- */}
          {isAdmin ? (
            <>
              {/* Admin Backoffice Navigation Links transformed to NavLinks */}
              <NavLink to="/admin/products" className={activeTabClass}>
                Products
              </NavLink>
              
              <NavLink to="/admin/orders" className={activeTabClass}>
                Orders
              </NavLink>
              
              <NavLink to="/admin/suppliers" className={activeTabClass}>
                Suppliers
              </NavLink>
              
              <NavLink to="/admin/purchase-orders" className={activeTabClass}>
                Purchase Orders
              </NavLink>
              
              <NavLink to="/admin/quotations" className={activeTabClass}>
                Quotations
              </NavLink>
            </>
          ) : (
            <>
              {/* Public Standard Shopping Links transformed to NavLinks */}
              <NavLink
                to={isAdmin ? "/admin/products" : "/products"}
                className={activeTabClass}
              >
                Shop
              </NavLink>
              <NavLink
                to={isAdmin ? "/admin/products" : "/cart"}
                className={activeTabClass}
              >
                Cart
              </NavLink>
            </>
          )}

          {/* --- AUTHENTICATION ACTION STACK --- */}
          {user ? (
            <>
              {!isAdmin && (
                <Link to="/profile" className="text-slate-600 hover:text-slate-900">
                  Hi, {user.name}
                </Link>
              )}
              {isAdmin && (
                <span className="text-slate-900 font-semibold border-l pl-3 border-slate-200">
                  Admin: {user.name}
                </span>
              )}
              <button
                onClick={logout}
                className="rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}