import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.userType === "ADMIN";

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const isVerifyPoRoute = location.pathname === "/verify-po";
  // --- NOTIFICATION STATES ---
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const dropdownRef = useRef(null);

  const shouldShowSearch =
    !isAdmin &&
    !isVerifyPoRoute &&
    (location.pathname === "/" || location.pathname === "/products");

  const activeTabClass = ({ isActive }) =>
    isActive
      ? "font-semibold text-blue-600"
      : "text-slate-600 hover:text-slate-900 transition-colors";

  // Fetch admin notifications if the logged-in user is an admin
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications"); // Adjust endpoint URL as needed
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      // Optional: Polling every 30 seconds to fetch new alerts
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/products");
    }
  };

  // Mark a single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Count unread entries
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <nav className="bg-white border-b border-slate-100 px-6 py-4 relative z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            to={isVerifyPoRoute ? "#" : isAdmin ? "/admin/products" : "/"}
            className="text-xl font-bold tracking-tight text-slate-900 shrink-0"
          >
            STORE<span className="text-blue-600">KIT</span>
            {(isAdmin || isVerifyPoRoute) && (
              <span className="ml-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Console
              </span>
            )}
          </Link>
          {!isVerifyPoRoute && (
            <>
              {/* --- CENTRAL GLOBAL SEARCH BAR --- */}
              {shouldShowSearch && (
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
                    <NavLink
                      to="/admin/catgeoryManager"
                      className={activeTabClass}
                    >
                      Category Manager
                    </NavLink>
                    <NavLink to="/admin/orders" className={activeTabClass}>
                      Orders
                    </NavLink>
                    <NavLink to="/admin/suppliers" className={activeTabClass}>
                      Suppliers
                    </NavLink>
                    <NavLink
                      to="/admin/purchase-orders"
                      className={activeTabClass}
                    >
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

                    {/* --- ADMIN NOTIFICATION BELL & DROPDOWN --- */}
                    {isAdmin && (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() =>
                            setShowNotificationDropdown(
                              !showNotificationDropdown,
                            )
                          }
                          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                              {unreadCount}
                            </span>
                          )}
                        </button>

                        {/* Dropdown Container */}
                        {showNotificationDropdown && (
                          <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 z-50">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                              <h4 className="font-semibold text-slate-900">
                                Notifications
                              </h4>
                              {unreadCount > 0 && (
                                <button
                                  onClick={handleMarkAllAsRead}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                  Mark all as read
                                </button>
                              )}
                            </div>

                            {/* <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => handleMarkAsRead(item.id)}
                                className={`p-3 text-left transition-colors cursor-pointer ${
                                  !item.isRead
                                    ? "bg-blue-50/40 hover:bg-blue-50"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                      item.type === "NEW_CUSTOMER_ORDER"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-purple-100 text-purple-800"
                                    }`}
                                  >
                                    {item.type === "NEW_CUSTOMER_ORDER"
                                      ? "Order"
                                      : "Quotation"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {new Date(
                                      item.createdAt,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <h5 className="mt-1 font-medium text-xs text-slate-900">
                                  {item.title}
                                </h5>
                                <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {item.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div> */}
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 scrollbar-hide">
                              {notifications.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400">
                                  No notifications yet
                                </div>
                              ) : (
                                notifications.map((item) => {
                                  // Determine target routing URL based on notification type
                                  const targetUrl =
                                    item.type === "NEW_CUSTOMER_ORDER"
                                      ? `/admin/orders?id=${item.orderId}` // Or `/admin/orders/${item.orderId}` depending on your routing strategy
                                      : `/admin/purchase-orders?id=${item.purchaseOrderId}`;

                                  return (
                                    <div
                                      key={item.id}
                                      onClick={async () => {
                                        // 1. Mark as read on the backend
                                        await handleMarkAsRead(item.id);
                                        // 2. Close the dropdown panel
                                        setShowNotificationDropdown(false);
                                        // 3. Programmatically redirect to the target order view page
                                        navigate(targetUrl);
                                      }}
                                      className={`p-3 text-left transition-colors cursor-pointer ${
                                        !item.isRead
                                          ? "bg-blue-50/40 hover:bg-blue-50"
                                          : "hover:bg-slate-50"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <span
                                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                            item.type === "NEW_CUSTOMER_ORDER"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-purple-100 text-purple-800"
                                          }`}
                                        >
                                          {item.type === "NEW_CUSTOMER_ORDER"
                                            ? "Order"
                                            : "Quotation"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 shrink-0">
                                          {new Date(
                                            item.createdAt,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <h5 className="mt-1 font-medium text-xs text-slate-900">
                                        {item.title}
                                      </h5>
                                      {/* Displays the contextual descriptive message featuring the actual customer's name */}
                                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {item.message}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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
            </>
          )}
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
