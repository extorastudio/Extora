import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Package, RefreshCw, Check, X, Search } from "lucide-react";

interface OrderData {
  id: string;
  orderNumber: string;
  customerEmail: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["all", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-yellow-900/50 text-yellow-400",
  processing: "bg-blue-900/50 text-blue-400",
  shipped: "bg-purple-900/50 text-purple-400",
  out_for_delivery: "bg-orange-900/50 text-orange-400",
  delivered: "bg-green-900/50 text-green-400",
  cancelled: "bg-red-900/50 text-red-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { void fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const r = await apiClient.get("/commerce/orders");
      setOrders(r.data.data ?? []);
    } catch { /* */ }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/commerce/orders/${encodeURIComponent(id)}`, { status });
      void fetchOrders();
    } catch { /* */ }
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
        !o.customerEmail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    confirmed: orders.filter((o) => o.status === "confirmed" || o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped" || o.status === "out_for_delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Orders</h1>
              <p className="text-sm text-gray-500">{stats.total} total · {stats.confirmed} processing · {stats.shipped} shipped · {stats.delivered} delivered</p>
            </div>
          </div>
          <button onClick={() => void fetchOrders()}
            className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-800">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order # or email..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
          </div>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                filter === s ? "bg-blue-600 text-white" : "border border-gray-700 text-gray-400 hover:bg-gray-800"
              }`}>
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-700" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const items = Array.isArray(o.items) ? o.items : (typeof o.items === "string" ? JSON.parse(o.items || "[]") : []);
            return (
              <div key={o.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-white">{o.orderNumber}</strong>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[o.status] || "bg-gray-800 text-gray-400"}`}>
                        {o.status?.replace(/_/g, " ") || "unknown"}
                      </span>
                      {o.paymentMethod && (
                        <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400 capitalize">{o.paymentMethod}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{o.customerEmail}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">₹{(o.total ?? 0).toLocaleString("en-IN")}</div>
                    <p className="text-xs text-gray-500">{items.length} item(s)</p>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mt-3 border-t border-gray-800 pt-3">
                    <table className="w-full text-xs">
                      <tbody>
                        {items.slice(0, 5).map((item: any, i: number) => (
                          <tr key={i} className="text-gray-400">
                            <td className="py-1 pr-2">{item.name || "Item"}</td>
                            <td className="py-1 text-center">x{item.qty || 1}</td>
                            <td className="py-1 text-right">₹{((item.price || 0) * (item.qty || 1)).toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                  {o.status === "confirmed" && (
                    <button onClick={() => void updateStatus(o.id, "processing")}
                      className="flex items-center gap-1 rounded bg-blue-900/30 px-2 py-1 text-[11px] text-blue-400 hover:bg-blue-900/50">
                      <Check className="h-3 w-3" /> Mark Processing
                    </button>
                  )}
                  {(o.status === "confirmed" || o.status === "processing") && (
                    <button onClick={() => void updateStatus(o.id, "shipped")}
                      className="flex items-center gap-1 rounded bg-purple-900/30 px-2 py-1 text-[11px] text-purple-400 hover:bg-purple-900/50">
                      <Check className="h-3 w-3" /> Mark Shipped
                    </button>
                  )}
                  {(o.status === "shipped") && (
                    <button onClick={() => void updateStatus(o.id, "out_for_delivery")}
                      className="flex items-center gap-1 rounded bg-orange-900/30 px-2 py-1 text-[11px] text-orange-400 hover:bg-orange-900/50">
                      <Check className="h-3 w-3" /> Out for Delivery
                    </button>
                  )}
                  {(o.status === "out_for_delivery") && (
                    <button onClick={() => void updateStatus(o.id, "delivered")}
                      className="flex items-center gap-1 rounded bg-green-900/30 px-2 py-1 text-[11px] text-green-400 hover:bg-green-900/50">
                      <Check className="h-3 w-3" /> Mark Delivered
                    </button>
                  )}
                  {(o.status !== "cancelled" && o.status !== "delivered") && (
                    <button onClick={() => { if (confirm("Cancel this order?")) void updateStatus(o.id, "cancelled"); }}
                      className="flex items-center gap-1 rounded bg-red-900/30 px-2 py-1 text-[11px] text-red-400 hover:bg-red-900/50">
                      <X className="h-3 w-3" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
