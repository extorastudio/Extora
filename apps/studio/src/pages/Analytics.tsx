import React, { useEffect, useState } from "react";
import {
  TrendingUp, Package, DollarSign, ShoppingCart, CheckCircle,
  AlertTriangle, BarChart3, RefreshCw, Calendar, Filter, Download,
  Box, Star,
} from "lucide-react";

interface DashData { totalProducts: number; totalOrders: number; totalUsers: number; totalRevenue: number; publishedProducts: number; outOfStockProducts: number; lowStockProducts: number; }
interface TopProduct { name: string; slug: string; price: number; qty: number; revenue: number; category: string; brand: string; rating: number; reviews: number; }
interface SalesData { date: string; orders: number; revenue: number; }
interface CatSale { category: string; count: number; revenue: number; }
interface InvData { totalProducts: number; inStock: number; outOfStock: number; lowStock: number; estimatedInventoryValue: number; }
interface OrderData { id: string; orderNumber: string; email: string; total: number; status: string; items: number; createdAt: string; }

type TabId = "overview" | "sales" | "products" | "inventory" | "orders";

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "sales", label: "Sales Report", icon: TrendingUp },
  { id: "products", label: "Product Performance", icon: Star },
  { id: "inventory", label: "Inventory Health", icon: Box },
  { id: "orders", label: "Orders", icon: ShoppingCart },
];

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

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <div className="w-full bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>;
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dash, setDash] = useState<DashData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [sales, setSales] = useState<SalesData[]>([]);
  const [catSales, setCatSales] = useState<CatSale[]>([]);
  const [inv, setInv] = useState<InvData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("at") ?? "";
  const headers = { Authorization: `Bearer ${token}` };
  const API = "/api/v1/analytics";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, tp, sd, cs, iv, ro] = await Promise.all([
        fetch(`${API}/dashboard`, { headers }).then(r => r.json()),
        fetch(`${API}/top-products?limit=15`, { headers }).then(r => r.json()),
        fetch(`${API}/sales-summary?period=${period}`, { headers }).then(r => r.json()),
        fetch(`${API}/category-sales`, { headers }).then(r => r.json()),
        fetch(`${API}/inventory-status`, { headers }).then(r => r.json()),
        fetch(`${API}/recent-orders?limit=50`, { headers }).then(r => r.json()),
      ]);
      if (d.success) setDash(d.data);
      if (tp.success) setTopProducts(tp.data ?? []);
      if (sd.success) setSales(sd.data ?? []);
      if (cs.success) setCatSales(cs.data ?? []);
      if (iv.success) setInv(iv.data);
      if (ro.success) setOrders(ro.data ?? []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { void fetchData(); }, [period]);

  const maxRev = sales.length > 0 ? Math.max(...sales.map(d => d.revenue)) : 0;
  const maxCat = catSales.length > 0 ? Math.max(...catSales.map(c => c.revenue)) : 0;
  const totalSold = topProducts.reduce((s, p) => s + p.qty, 0);
  const avgOrder = orders.length > 0 ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length) : 0;

  const filteredOrders = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  const DeliveredBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = { delivered: "bg-green-900/50 text-green-400", cancelled: "bg-red-900/50 text-red-400", shipped: "bg-blue-900/50 text-blue-400", processing: "bg-purple-900/50 text-purple-400" };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-yellow-900/50 text-yellow-400"}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-400" /> Analytics & Reports
          </h1>
          <p className="text-sm text-gray-400 mt-1">Product sales, revenue, inventory & performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white">
            <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </select>
          <button onClick={() => void fetchData()} className="flex items-center gap-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-gray-200"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 animate-pulse"><div className="h-3 bg-gray-700 rounded w-20 mb-3"/><div className="h-6 bg-gray-700 rounded w-28"/></div>)}</div>}

      {/* === OVERVIEW TAB === */}
      {activeTab === "overview" && dash && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={`₹${dash.totalRevenue.toLocaleString("en-IN")}`} color="text-green-400" />
            <StatCard icon={ShoppingCart} label="Total Orders" value={dash.totalOrders} color="text-blue-400" sub={`${dash.totalUsers} customers`} />
            <StatCard icon={Package} label="Products" value={`${dash.publishedProducts} / ${dash.totalProducts}`} color="text-purple-400" sub={`${dash.outOfStockProducts} OOS · ${dash.lowStockProducts} low`} />
            <StatCard icon={AlertTriangle} label="Avg Order Value" value={`₹${avgOrder.toLocaleString("en-IN")}`} color="text-orange-400" />
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Revenue Trend</h3>
            {sales.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No sales data yet</p> :
              <div className="space-y-2">{sales.slice(-14).map(d => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20">{d.date.slice(5)}</span>
                  <ProgressBar value={d.revenue} max={maxRev} color="bg-blue-500" />
                  <span className="text-xs text-gray-300 w-24 text-right">₹{d.revenue.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-gray-500 w-6 text-right">{d.orders}</span>
                </div>
              ))}</div>
            }
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Top Products</h3>
              {topProducts.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No data yet</p> :
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-700"><th className="text-left py-2 px-3 text-gray-400 text-xs">Product</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Sold</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Revenue</th></tr></thead><tbody>{topProducts.slice(0,8).map((p,i) => (
                  <tr key={i} className="border-b border-gray-700/50"><td className="py-2 px-3 text-white font-medium text-xs">{p.name.slice(0,40)}</td><td className="py-2 px-3 text-gray-300 text-right text-xs">{p.qty}</td><td className="py-2 px-3 text-green-400 text-right text-xs">₹{p.revenue.toLocaleString("en-IN")}</td></tr>
                ))}</tbody></table></div>
              }
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Category Breakdown</h3>
              {catSales.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No data yet</p> :
                <div className="space-y-3">{catSales.sort((a,b)=>b.revenue-a.revenue).slice(0,8).map(c => (
                  <div key={c.category}><div className="flex justify-between text-xs mb-1"><span className="text-gray-300">{c.category}</span><span className="text-gray-500">{c.count} products · ₹{(c.revenue||0).toLocaleString("en-IN")}</span></div><ProgressBar value={c.revenue} max={maxCat} color="bg-green-500" /></div>
                ))}</div>
              }
            </div>
          </div>
        </>
      )}

      {/* === SALES REPORT TAB === */}
      {activeTab === "sales" && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-400" /> Sales Report</h3>
          </div>
          {sales.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No sales recorded yet. Orders will appear here when customers place them.</p> :
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-700"><th className="text-left py-2 px-3 text-gray-400 text-xs">Date</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Orders</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Revenue</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Avg Order</th></tr></thead>
                <tbody>{sales.map((d,i) => (
                  <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-white text-xs">{d.date}</td>
                    <td className="py-2 px-3 text-gray-300 text-right text-xs">{d.orders}</td>
                    <td className="py-2 px-3 text-green-400 text-right text-xs">₹{d.revenue.toLocaleString("en-IN")}</td>
                    <td className="py-2 px-3 text-gray-400 text-right text-xs">₹{d.orders>0?Math.round(d.revenue/d.orders).toLocaleString("en-IN"):"0"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          }
          <div className="mt-4 flex gap-2">
            <button className="flex items-center gap-1 rounded-lg border border-gray-600 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"><Download className="h-3 w-3" /> Export CSV</button>
          </div>
        </div>
      )}

      {/* === PRODUCT PERFORMANCE TAB === */}
      {activeTab === "products" && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" /> Product Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard icon={Package} label="Total SKUs" value={topProducts.length} color="text-purple-400" />
            <StatCard icon={ShoppingCart} label="Units Sold" value={totalSold} color="text-blue-400" />
            <StatCard icon={DollarSign} label="Revenue" value={`₹${topProducts.reduce((s,p)=>s+p.revenue,0).toLocaleString("en-IN")}`} color="text-green-400" />
            <StatCard icon={Star} label="Avg Rating" value={(topProducts.reduce((s,p)=>s+(p.rating||0),0)/(topProducts.length||1)).toFixed(1)} color="text-yellow-400" />
          </div>
          {topProducts.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No product data available</p> :
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-700"><th className="text-left py-2 px-3 text-gray-400 text-xs">Product</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Category</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Price</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Sold</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Revenue</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Rating</th></tr></thead><tbody>{topProducts.map((p,i) => (
              <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                <td className="py-2 px-3 text-white text-xs font-medium">{p.name.slice(0,45)}</td>
                <td className="py-2 px-3 text-gray-400 text-right text-xs">{p.category}</td>
                <td className="py-2 px-3 text-gray-300 text-right text-xs">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="py-2 px-3 text-white text-right text-xs">{p.qty}</td>
                <td className="py-2 px-3 text-green-400 text-right text-xs">₹{p.revenue.toLocaleString("en-IN")}</td>
                <td className="py-2 px-3 text-yellow-400 text-right text-xs">{p.rating>0?"★"+p.rating.toFixed(1):"—"}{p.reviews>0?` (${p.reviews})`:""}</td>
              </tr>
            ))}</tbody></table></div>
          }
        </div>
      )}

      {/* === INVENTORY HEALTH TAB === */}
      {activeTab === "inventory" && inv && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Total Products" value={inv.totalProducts} color="text-blue-400" />
            <StatCard icon={CheckCircle} label="In Stock" value={inv.inStock} color="text-green-400" sub={`${inv.totalProducts>0?Math.round(inv.inStock/inv.totalProducts*100):0}% of total`} />
            <StatCard icon={AlertTriangle} label="Low Stock" value={inv.lowStock} color="text-orange-400" sub="≤ 5 units — needs restock" />
            <StatCard icon={AlertTriangle} label="Out of Stock" value={inv.outOfStock} color="text-red-400" sub={`${inv.totalProducts>0?Math.round(inv.outOfStock/inv.totalProducts*100):0}% of total`} />
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2"><Box className="h-4 w-4 text-purple-400" /> Product Status Overview</h3>
            <div className="space-y-3">
              <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-300">In Stock</span><span className="text-green-400">{inv.inStock}</span></div><ProgressBar value={inv.inStock} max={inv.totalProducts} color="bg-green-500" /></div>
              <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Low Stock</span><span className="text-orange-400">{inv.lowStock}</span></div><ProgressBar value={inv.lowStock} max={inv.totalProducts} color="bg-orange-500" /></div>
              <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Out of Stock</span><span className="text-red-400">{inv.outOfStock}</span></div><ProgressBar value={inv.outOfStock} max={inv.totalProducts} color="bg-red-500" /></div>
            </div>
          </div>
        </div>
      )}

      {/* === ORDERS TAB === */}
      {activeTab === "orders" && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-blue-400" /> Order History</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-xs text-white">
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          {filteredOrders.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No orders found</p> :
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-700"><th className="text-left py-2 px-3 text-gray-400 text-xs">Order #</th><th className="text-left py-2 px-3 text-gray-400 text-xs">Customer</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Items</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Total</th><th className="text-center py-2 px-3 text-gray-400 text-xs">Status</th><th className="text-right py-2 px-3 text-gray-400 text-xs">Date</th></tr></thead><tbody>{filteredOrders.map(o => (
              <tr key={o.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                <td className="py-2 px-3 text-white text-xs font-medium">{o.orderNumber}</td>
                <td className="py-2 px-3 text-gray-400 text-xs">{o.email}</td>
                <td className="py-2 px-3 text-gray-300 text-right text-xs">{o.items}</td>
                <td className="py-2 px-3 text-green-400 text-right text-xs">₹{o.total.toLocaleString("en-IN")}</td>
                <td className="py-2 px-3 text-center"><DeliveredBadge status={o.status} /></td>
                <td className="py-2 px-3 text-gray-500 text-right text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}</tbody></table></div>
          }
        </div>
      )}
    </div>
  );
}
