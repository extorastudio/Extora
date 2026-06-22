import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { RefreshCw, Check, X, MessageSquare } from "lucide-react";
import { TableSkeleton } from "../components/ui/Skeleton";

interface ReviewData {
  id: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const r = await apiClient.get("/commerce/reviews");
      setReviews(r.data.data ?? []);
    } catch { /* */ }
    setIsLoading(false);
  };

  useEffect(() => { void fetchReviews(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/commerce/reviews/${encodeURIComponent(id)}`, { status });
      void fetchReviews();
    } catch { /* */ }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const stats = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Reviews</h1>
          <p className="text-sm text-gray-500">
            {stats.pending} pending · {stats.approved} approved
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "pending", "approved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "border border-gray-700 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {s}
              {s === "pending" && stats.pending > 0 ? ` (${stats.pending})` : ""}
            </button>
          ))}
          <button
            onClick={() => void fetchReviews()}
            className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-800"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-700" />
          <p className="text-gray-500">No {filter === "all" ? "" : filter} reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-gray-800 bg-gray-900/50 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-yellow-500">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {r.title || "No title"}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                        r.status === "approved"
                          ? "bg-green-900/50 text-green-400"
                          : r.status === "rejected"
                            ? "bg-red-900/50 text-red-400"
                            : "bg-yellow-900/50 text-yellow-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{r.content}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    By {r.author || "Anonymous"} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {r.status !== "approved" && (
                    <button
                      onClick={() => void updateStatus(r.id, "approved")}
                      className="rounded p-1.5 text-green-500 hover:bg-green-900/30"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => void updateStatus(r.id, "rejected")}
                      className="rounded p-1.5 text-red-500 hover:bg-red-900/30"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
