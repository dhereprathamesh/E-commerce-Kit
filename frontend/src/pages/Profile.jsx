import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  // New Address Form State
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch Addresses on Mount
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/addresses");
      // Maps to: res.json({ success: true, data: addresses })
      setAddresses(response.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to sync your addresses file.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add New Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    // Front-End Validation Safeguards (Parallels your Backend Zod constraints)
    if (form.fullName.length < 3)
      return setError("Full name must be at least 3 characters.");
    if (form.phone.length < 10)
      return setError("Phone number must contain at least 10 digits.");
    if (form.line1.length < 3)
      return setError("Address Line 1 must be at least 3 characters.");

    try {
      const response = await api.post("/addresses", form);
      const newAddress = response.data?.data;

      if (newAddress) {
        // If it's the user's first address, your backend automatically sets isDefault: true
        if (newAddress.isDefault) {
          setAddresses([newAddress]);
        } else {
          setAddresses((prev) => [...prev, newAddress]);
        }
        // Reset form fields
        setForm({
          fullName: "",
          phone: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
        });
        // Re-fetch to guarantee sorting index defaults persist
        fetchAddresses();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not write address entry to database.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Set Address as Default
  const handleSetDefault = async (addressId) => {
    try {
      await api.put(`/addresses/default/${addressId}`);
      // Optimistically swap values across internal UI view arrays
      setAddresses(
        (prev) =>
          prev
            .map((addr) => ({
              ...addr,
              isDefault: addr.id === addressId,
            }))
            .sort((a, b) => b.isDefault - a.isDefault), // Keep default at the top
      );
    } catch (err) {
      console.log(err);

      alert("Failed to update default parameter.");
    }
  };

  // Delete Address Record
  const handleDeleteAddress = async (addressId) => {
    if (
      !window.confirm("Are you sure you want to remove this delivery address?")
    )
      return;
    try {
      await api.delete(`/addresses/${addressId}`);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    } catch (err) {
      console.log(err);

      alert("Fulfillment node elimination failed.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Account Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your profile, active contact addresses, and checkout
          configurations.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: USER METADATA CARD */}
        {/* COLUMN 1: USER METADATA CARD */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              User Identification
            </h2>
            <hr className="border-slate-100" />
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Account Name
                </label>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {user?.name || "Guest User"}
                </p>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Email Address
                </label>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {user?.email || "No email bound"}
                </p>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
                  System Role Privilege
                </label>
                <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                  {user?.role || "CUSTOMER"}
                </span>
              </div>

              {/* --- ADDED: QUICK ACTIONS NAVIGATION TRACKER PANEL --- */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/orders"
                  className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 text-center transition duration-150 shadow-sm"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  View Order History
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 & 3: ADDRESS MANAGER MANAGEMENT SYSTEM */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Saved Addresses Ledger */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Saved Shipping Destinations
            </h2>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-slate-100 rounded-lg" />
                <div className="h-20 bg-slate-100 rounded-lg" />
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 italic">
                No verified delivery points linked to this credential file.
              </p>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative rounded-lg border p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                      addr.isDefault
                        ? "border-blue-500 bg-blue-50/20"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {addr.fullName}
                        </p>
                        {addr.isDefault && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {addr.phone}
                      </p>
                      <p className="mt-2 text-slate-700">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                        {addr.state} -{" "}
                        <span className="font-semibold">{addr.pincode}</span>
                      </p>
                    </div>

                    {/* Operational Actions Container */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t pt-3 md:border-t-0 md:pt-0 border-slate-100">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Address"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Destination Node Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Register New Shipping Address
            </h2>
            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number (10+ digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  name="line1"
                  value={form.line1}
                  onChange={handleInputChange}
                  placeholder="Street address, P.O. box, company name"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="line2"
                  value={form.line2}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Postal Code (Pincode) *
                  </label>
                  <input
                    type="text"
                    required
                    name="pincode"
                    value={form.pincode}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-slate-400 transition-colors flex items-center gap-2"
                >
                  {submitLoading && (
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Location Coordinates
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
