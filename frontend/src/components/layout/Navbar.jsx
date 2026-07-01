// import { useState } from "react"; // 1. Added useState hook
// import { Link, NavLink } from "react-router-dom";
// import { useAuthStore } from "../../store/authStore";

// export default function Navbar() {
//   const { user, logout } = useAuthStore();
//   const isAdmin = user?.userType === "ADMIN";

//   // 2. Added state to track modal visibility
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   const activeTabClass = ({ isActive }) =>
//     isActive
//       ? "font-semibold text-blue-600"
//       : "text-slate-600 hover:text-slate-900 transition-colors";

//   // 3. Handler to finalize the logout flow
//   const handleLogoutConfirm = async () => {
//     setShowLogoutModal(false); // Close modal first
//     await logout(); // Execute your authStore logout logic
//   };

//   return (
//     <>
//       <nav className="bg-white px-6 py-4 relative z-40">
//         <div className="mx-auto flex max-w-7xl items-center justify-between">
//           {/* Brand Logo */}
//           <Link
//             to={isAdmin ? "/admin/products" : "/"}
//             className="text-xl font-bold tracking-tight text-slate-900"
//           >
//             STORE<span className="text-blue-600">KIT</span>
//             {isAdmin && (
//               <span className="ml-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
//                 Console
//               </span>
//             )}
//           </Link>

//           <div className="flex items-center gap-4 text-sm font-medium">
//             {/* --- CONDITIONALLY RENDERED LINKS --- */}
//             {isAdmin && (
//               <>
//                 <NavLink to="/admin/products" className={activeTabClass}>
//                   Products
//                 </NavLink>
//                 <NavLink to="/admin/catgeoryManager" className={activeTabClass}>
//                   Category Manager
//                 </NavLink>
//                 <NavLink to="/admin/orders" className={activeTabClass}>
//                   Orders
//                 </NavLink>
//                 <NavLink to="/admin/suppliers" className={activeTabClass}>
//                   Suppliers
//                 </NavLink>
//                 <NavLink to="/admin/purchase-orders" className={activeTabClass}>
//                   Purchase Orders
//                 </NavLink>
//                 <NavLink to="/admin/quotations" className={activeTabClass}>
//                   Quotations
//                 </NavLink>
//               </>
//             )}

//             {/* --- AUTHENTICATION ACTION STACK --- */}
//             {user ? (
//               <>
//                 {!isAdmin && (
//                   <>
//                     <NavLink to="/products" className={activeTabClass}>
//                       Shop
//                     </NavLink>
//                     <NavLink to="/cart" className={activeTabClass}>
//                       Cart
//                     </NavLink>
//                     <Link
//                       to="/profile"
//                       className="text-slate-600 hover:text-slate-900"
//                     >
//                       Hi, {user.name}
//                     </Link>
//                   </>
//                 )}
//                 {isAdmin && (
//                   <span className="text-slate-900 font-semibold border-l pl-3 border-slate-200">
//                     Admin: {user.name}
//                   </span>
//                 )}

//                 {/* 4. MODIFIED: Intercepts onClick to open the modal instead of logging out directly */}
//                 <button
//                   onClick={() => setShowLogoutModal(true)}
//                   className="rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider transition-colors"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to="/login"
//                   className="text-slate-600 hover:text-slate-900"
//                 >
//                   Sign In
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
//                 >
//                   Register
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* 5. NEW: CONFIRMATION MODAL INTERFACE */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
//           {/* Modal Backdrop Clickable to Close */}
//           <div
//             className="absolute inset-0"
//             onClick={() => setShowLogoutModal(false)}
//           />

//           {/* Modal Content Box */}
//           <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white p-6 shadow-xl border border-slate-100 transform transition-all">
//             <h3 className="text-lg font-semibold text-slate-900">
//               Confirm Logout
//             </h3>
//             <p className="mt-2 text-sm text-slate-500 leading-relaxed">
//               Are you sure you want to log out? You will need to sign back in to
//               access your dashboard and profile.
//             </p>

//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => setShowLogoutModal(false)}
//                 className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleLogoutConfirm}
//                 className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-sm transition"
//               >
//                 Sign Out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; // Added useNavigate
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.userType === "ADMIN";

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [navSearch, setNavSearch] = useState(""); // Local input state for navbar search

  const activeTabClass = ({ isActive }) =>
    isActive
      ? "font-semibold text-blue-600"
      : "text-slate-600 hover:text-slate-900 transition-colors";

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  // Triggers redirect to /products passing search data via URL params
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-100 px-6 py-4 relative z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            to={isAdmin ? "/admin/products" : "/"}
            className="text-xl font-bold tracking-tight text-slate-900 shrink-0"
          >
            STORE<span className="text-blue-600">KIT</span>
            {isAdmin && (
              <span className="ml-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Console
              </span>
            )}
          </Link>

          {/* --- CENTRAL GLOBAL SEARCH BAR --- */}
          {!isAdmin && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-md mx-4 hidden sm:block"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for items, brands, and categories..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 pl-4 pr-10 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Navigation Action Links */}
          <div className="flex items-center gap-4 text-sm font-medium shrink-0">
            {isAdmin && (
              <>
                <NavLink to="/admin/products" className={activeTabClass}>
                  Products
                </NavLink>
                <NavLink to="/admin/catgeoryManager" className={activeTabClass}>
                  Category Manager
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
            )}

            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <NavLink to="/products" className={activeTabClass}>
                      Shop
                    </NavLink>
                    <NavLink to="/cart" className={activeTabClass}>
                      Cart
                    </NavLink>
                    <Link
                      to="/profile"
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Hi, {user.name}
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <span className="text-slate-900 font-semibold border-l pl-3 border-slate-200">
                    Admin: {user.name}
                  </span>
                )}

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900"
                >
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

      {/* CONFIRMATION MODAL INTERFACE */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div
            className="absolute inset-0"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white p-6 shadow-xl border border-slate-100 transform transition-all">
            <h3 className="text-lg font-semibold text-slate-900">
              Confirm Logout
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Are you sure you want to log out? You will need to sign back in to
              access your dashboard and profile.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-sm transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
