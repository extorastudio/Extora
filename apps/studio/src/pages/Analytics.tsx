import React, { useEffect, useState } from "react";
import {
  TrendingUp, Package, DollarSign, ShoppingCart,
  AlertTriangle, BarChart3, RefreshCw,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number; totalOrders: number; totalUsers: number;
  totalRevenue: number; publishedProducts: number;
  outOfStockProducts: number; lowStockProducts: number;
}
interface TopProduct { name: string; slug: string; price: number; qty: number; revenue: number; category: string; }
interface SalesData { date: string; orders: number; revenue: number; }
interface CategorySales { category: string; count: number; revenue: number; }
interface InventoryStatus { totalProducts: number; inStock: number; outOfStock: number; lowStock: number; estimatedInventoryValue: number; }
interface RecentOrder { id: string; orderNumber: string; email: string; total: number; status: string; items: number; createdAt: string; }

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-800/30">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-gray-300">{j === 0 ? <span className="text-white font-medium">{cell}</span> : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [catSales, setCatSales] = useState<CategorySales[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const token = localStorage.getItem("at") ?? "";
    const headers = { Authorization: `Bearer ${token}` };
    const API = "/api/v1/analytics";
    try {
      const [dash, top, sales, cats, inv, orders] = await Promise.all([
        fetch(`${API}/dashboard`, { headers }).then(r => r.json()),
        fetch(`${API}/top-products?limit=10`, { headers }).then(r => r.json()),
        fetch(`${API}/sales-summary?period=${period}`, { headers }).then(r => r.json()),
        fetch(`${API}/category-sales`, { headers }).then(r => r.json()),
        fetch(`${API}/inventory-status`, { headers }).then(r => r.json()),
        fetch(`${API}/recent-orders?limit=10`, { headers }).then(r => r.json()),
      ]);
      if (dash.success) setStats(dash.data as DashboardStats);
      if (top.success) setTopProducts((top.data as TopProduct[]) ?? []);
      if (sales.success) setSalesData((sales.data as SalesData[]) ?? []);
      if (cats.success) setCatSales((cats.data as CategorySales[]) ?? []);
      if (inv.success) setInventory(inv.data as InventoryStatus);
      if (orders.success) setRecentOrders((orders.data as RecentOrder[]) ?? []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { void fetchAll(); }, [period]);

  const maxRevenue = salesData.length > 0 ? Math.max(...salesData.map(d => d.revenue)) : 0;
  const maxCatRev = catSales.length > 0 ? Math.max(...catSales.map(c => c.revenue)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-400" /> Analytics & Reports
          </h1>
          <p className="text-sm text-gray-400 mt-1">Product sales, revenue, inventory & performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={fetchAll} className="flex items-center gap-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 animate-pulse">
              <div className="h-3 bg-gray-700 rounded w-20 mb-3" />
              <div className="h-6 bg-gray-700 rounded w-28" />
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} color="text-green-400" />
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="text-blue-400" sub={`${stats.totalUsers} customers`} />
          <StatCard icon={Package} label="Products" value={`${stats.publishedProducts} / ${stats.totalProducts}`} color="text-purple-400" sub={`${stats.outOfStockProducts} out of stock · ${stats.lowStockProducts} low`} />
          <StatCard icon={AlertTriangle} label="Inventory Value" value={`₹${(stats.totalRevenue * 0.6).toLocaleString("en-IN")}`} color="text-orange-400" />
        </div>
      )}

      {/* Sales Trend Chart */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" /> Revenue Trend ({period})
        </h2>
        {salesData.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">No sales data yet. Orders will appear here.</p>
        ) : (
          <div className="space-y-2">
            {salesData.slice(-15).map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-20">{d.date.slice(period === "monthly" ? 0 : 5)}</span>
                <Bar value={d.revenue} max={maxRevenue} color="bg-blue-500" />
                <span className="text-xs text-gray-300 w-24 text-right">₹{d.revenue.toLocaleString("en-IN")}</span>
                <span className="text-xs text-gray-500 w-8 text-right">{d.orders}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-400" /> Top Products
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Order data will populate this table.</p>
          ) : (
            <Table
              headers={["Product", "Sold", "Revenue", "Category"]}
              rows={topProducts.map(p => [p.name, p.qty, `₹${p.revenue.toLocaleString("en-IN")}`, p.category])}
            />
          )}
        </div>

        {/* Category Sales */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-400" /> Category Breakdown
          </h2>
          {catSales.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No category data yet.</p>
          ) : (
            <div className="space-y-3">
              {catSales.sort((a,b)=>b.revenue-a.revenue).slice(0,8).map(c => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{c.category}</span>
                    <span className="text-gray-500">{c.count} products · ₹{(c.revenue||0).toLocaleString("en-IN")}</span>
                  </div>
                  <Bar value={c.revenue} max={maxCatRev} color="bg-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Status */}
      {inventory && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" /> Inventory Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Package} label="In Stock" value={inventory.inStock} color="text-green-400" />
            <StatCard icon={AlertTriangle} label="Low Stock" value={inventory.lowStock} color="text-orange-400" sub="≤ 5 units" />
            <StatCard icon={AlertTriangle} label="Out of Stock" value={inventory.outOfStock} color="text-red-400" />
            <StatCard icon={DollarSign} label="Est. Value" value={`₹${inventory.estimatedInventoryValue.toLocaleString("en-IN")}`} color="text-blue-400" />
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-blue-400" /> Recent Orders
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">No orders placed yet.</p>
        ) : (
          <Table
            headers={["Order #", "Email", "Items", "Total", "Status", "Date"]}
            rows={recentOrders.map(o => [
              o.orderNumber, o.email, String(o.items),
              `₹${o.total.toLocaleString("en-IN")}`,
              <span key="s" className={`px-2 py-0.5 rounded text-xs font-medium ${
                o.status === "delivered" ? "bg-green-900/50 text-green-400" :
                o.status === "cancelled" ? "bg-red-900/50 text-red-400" :
                o.status === "shipped" ? "bg-blue-900/50 text-blue-400" :
                "bg-yellow-900/50 text-yellow-400"
              }`}>{o.status}</span>,
              new Date(o.createdAt).toLocaleDateString("en-IN"),
            ])}
          />
        )}
      </div>
    </div>
  );
}
