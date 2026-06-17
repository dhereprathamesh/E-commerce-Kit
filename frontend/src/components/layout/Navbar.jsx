import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          STORE<span className="text-blue-600">KIT</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link to="/products" className="hover:text-slate-900">
            Shop
          </Link>
          <Link to="/cart" className="hover:text-slate-900">
            Cart
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="hover:text-slate-900">
                Hi, {user.name}
              </Link>
              <button
                onClick={logout}
                className="rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-slate-900">
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
