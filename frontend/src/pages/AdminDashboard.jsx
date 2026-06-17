import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Execute analytics calls concurrently via promise orchestration
        const [statsRes, ordersRes] = await Promise.all([
          api.get("/admin/analytics/summary"),
          api.get("/admin/orders?limit=5"),
        ]);

        setStats(statsRes.data);
        setRecentOrders(ordersRes.data?.orders || ordersRes.data || []);
      } catch (err) {
        console.error("Error fetching admin cockpit data structure:", err);
        setError("Failed to fetch store metrics. Verify admin token claims.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-sm font-medium text-slate-500 animate-pulse">
        Loading Backoffice Analytics Engine...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg m-6">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Info Block */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Backoffice Commerce Cockpit
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time aggregate performance insights and fulfillment data
          pipelines.
        </p>
      </div>

      {/* KPI Cards Performance Row Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Metric */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Revenue
          </dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            ${stats?.totalRevenue?.toFixed(2) || "0.00"}
          </dd>
        </div>

        {/* Total Orders Metric */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
            Orders Processed
          </dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {stats?.totalOrders || 0}
          </dd>
        </div>

        {/* Total Customers Metric */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Customers
          </dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {stats?.totalCustomers || 0}
          </dd>
        </div>

        {/* Low Stock Warning Alert Counter */}
        <div
          className={`overflow-hidden rounded-lg border p-5 shadow-sm ${stats?.lowStockCount > 0 ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-200"}`}
        >
          <dt className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
            Inventory Warnings
          </dt>
          <dd
            className={`mt-2 text-3xl font-bold tracking-tight ${stats?.lowStockCount > 0 ? "text-amber-700" : "text-slate-900"}`}
          >
            {stats?.lowStockCount || 0} items
          </dd>
        </div>
      </div>

      {/* Core Audit Log Management Table View */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Order Submissions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest consumer checkout actions pending batch sync processing.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-400 text-xs"
                  >
                    No transaction items found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-900">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {order.user?.name || "Guest/Deleted"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : order.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${order.finalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
