import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import { ShoppingCart, RefreshCw, CheckCircle, Clock, Truck, XCircle, Search } from "lucide-react";

interface Order { id: string; orderNumber: string; customerEmail: string; status: string; items: number; total: number; currency: string; createdAt: string; }

const CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { color: "bg-yellow-900/40 text-yellow-400", icon: Clock },
  confirmed: { color: "bg-blue-900/40 text-blue-400", icon: CheckCircle },
  processing: { color: "bg-purple-900/40 text-purple-400", icon: RefreshCw },
  shipped: { color: "bg-indigo-900/40 text-indigo-400", icon: Truck },
  delivered: { color: "bg-green-900/40 text-green-400", icon: CheckCircle },
  cancelled: { color: "bg-red-900/40 text-red-400", icon: XCircle },
  refunded: { color: "bg-gray-800 text-gray-400", icon: XCircle },
};

const SAMPLE: Order[] = [
  { id: "s1", orderNumber: "EXT-1001", customerEmail: "john@example.com", status: "delivered", items: 3, total: 249.97, currency: "USD", createdAt: "2026-06-15T10:30:00Z" },
  { id: "s2", orderNumber: "EXT-1002", customerEmail: "jane@example.com", status: "shipped", items: 1, total: 79.99, currency: "USD", createdAt: "2026-06-16T08:15:00Z" },
];

const STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/commerce/orders");
      const list = Array.isArray(data) ? data : data.data ?? [];
      setOrders(list.length > 0 ? list as Order[] : SAMPLE);
    } catch { setOrders(SAMPLE); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const handleStatus = async (id: string, status: string) => {
    try { await apiClient.patch(`/commerce/orders/${encodeURIComponent(id)}`, { status }); void fetchOrders(); }
    catch { /* ignore */ }
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerEmail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    revenue: orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded").reduce((s, o) => s + o.total, 0),
    pending: orders.filter((o) => o.status === "pending" || o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <button onClick={() => void fetchOrders()} className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"><p className="text-xs text-gray-500 uppercase">Total</p><p className="text-2xl font-bold text-white mt-1">{stats.total}</p></div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"><p className="text-xs text-gray-500 uppercase">Revenue</p><p className="text-2xl font-bold text-green-400 mt-1">${stats.revenue.toFixed(2)}</p></div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"><p className="text-xs text-gray-500 uppercase">Pending</p><p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p></div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"><p className="text-xs text-gray-500 uppercase">Delivered</p><p className="text-2xl font-bold text-green-400 mt-1">{stats.delivered}</p></div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-9 pr-3 py-2 text-sm text-white" placeholder="Search..." />
        </div>
        {["all",...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{s}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center"><ShoppingCart className="mx-auto mb-3 h-10 w-10 text-gray-600" /><p className="text-gray-400">No orders</p></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full">
            <thead><tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Items</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((order) => {
                const cfg = (CONFIG[order.status] ?? CONFIG.pending)!;
                const Icon = cfg.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-900/30">
                    <td className="px-4 py-3"><p className="font-medium text-white">{order.orderNumber}</p><p className="text-xs text-gray-500">{order.id}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-300">{order.customerEmail}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-center">{order.items}</td>
                    <td className="px-4 py-3 text-sm font-medium text-white text-right">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cfg.color}`}><Icon className="h-3 w-3" /> {order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-right">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={order.status} onChange={(e) => { void handleStatus(order.id, e.target.value); }} className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white capitalize">
                        {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
