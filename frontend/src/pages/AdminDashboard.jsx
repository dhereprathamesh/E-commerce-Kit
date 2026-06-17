import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Concurrently call your existing backend endpoints
        const [ordersRes, productsRes] = await Promise.all([
          api.get("/orders/my"),
          api.get("/products"),
        ]);

        // Your backend returns items wrapped inside a "data" object field
        const adminSpecificOrders = ordersRes.data?.data || [];
        const masterProductsList = productsRes.data?.data || [];

        // Aggregate statistics using frontend calculation loops
        const revenueCalculated = adminSpecificOrders.reduce(
          (sum, order) => sum + (order.finalAmount || 0),
          0,
        );
        const warningInventoryCount = masterProductsList.filter(
          (p) => p.stock <= 5,
        ).length;

        setMetrics({
          totalRevenue: revenueCalculated,
          totalOrders: adminSpecificOrders.length,
          lowStockCount: warningInventoryCount,
        });

        // Slice the array to showcase the top 5 recent orders
        setRecentOrders(adminSpecificOrders.slice(0, 5));
      } catch (err) {
        console.error("Dashboard compilation failed:", err);
        setError(
          "Failed to fetch store data pipelines. Check console network panels.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-sm text-slate-500 animate-pulse">
        Loading live operational ledger...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-sm text-rose-600 bg-rose-50 border rounded-lg m-6">
        {error}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Cockpit Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time stats compiled from active store administrative profiles.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border rounded-lg shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Profile Gross Revenue
          </p>
          <p className="text-2xl font-bold mt-1">
            ${metrics.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="p-5 bg-white border rounded-lg shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Orders Logged
          </p>
          <p className="text-2xl font-bold mt-1">
            {metrics.totalOrders} checkouts
          </p>
        </div>
        <div className="p-5 bg-white border rounded-lg shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Critical Stock Warnings
          </p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {metrics.lowStockCount} items
          </p>
        </div>
      </div>

      {/* Recent Orders Log View */}
      <div className="border bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Recent Checkout Logs</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All &rarr;
          </Link>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider border-b text-slate-400">
            <tr>
              <th className="p-4">Order Code</th>
              <th className="p-4">Final Price</th>
              <th className="p-4">Fulfillment State</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="p-6 text-center text-slate-400 text-xs"
                >
                  No orders recorded for this identity.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-xs">
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    ${order.finalAmount?.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
