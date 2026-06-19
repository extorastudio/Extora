import { useEffect, useState } from "react";
import { useAuthStore } from "./stores/auth-store";
import apiClient from "./api/client";
import LoginPage from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import PluginsPage from "./pages/Plugins";
import UsersPage from "./pages/Users";
import ThemesPage from "./pages/Themes";
import ServicesPage from "./pages/Services";
import ConfigPage from "./pages/Config";
import MonitoringPage from "./pages/Monitoring";
import BackupsPage from "./pages/Backups";
import ProductsPage from "./pages/Products";
import ContentPage from "./pages/Content";
import MediaPage from "./pages/Media";
import ThemeSettingsPage from "./pages/ThemeSettings";
import OrdersPage from "./pages/Orders";
import BuilderPage from "./pages/Builder";
import AnalyticsDashboard from "./pages/Analytics";
import SeoSettingsPage from "./pages/SeoSettings";
import { Package, Users2, Clock, FileText, ShoppingCart, TrendingUp, Globe } from "lucide-react";
import { CardSkeleton } from "./components/ui/Skeleton";

function DashboardPage() {
  const [stats, setStats] = useState({ plugins: 0, products: 0, published: 0, drafts: 0, content: 0, orders: 0, revenue: 0, uptime: "—", lastPublish: "—" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [healthRes, pluginsRes, productsRes, contentRes] = await Promise.all([
          apiClient.get("/system/health"),
          apiClient.get("/plugins"),
          apiClient.get("/commerce/products"),
          apiClient.get("/content"),
        ]);
        const u = (healthRes.data as Record<string, unknown>).uptime as number;
        const h = Math.floor(u / 3600);
        const m = Math.floor((u % 3600) / 60);
        const s = u % 60;
        const pData: unknown[] = Array.isArray(productsRes.data) ? productsRes.data as unknown[] : ((productsRes.data as Record<string, unknown>).data as unknown[]) ?? [];
        const cData: unknown[] = Array.isArray(contentRes.data) ? contentRes.data as unknown[] : ((contentRes.data as Record<string, unknown>).data as unknown[]) ?? [];
        const plugins = Array.isArray(pluginsRes.data) ? (pluginsRes.data as unknown[]).length : ((pluginsRes.data as Record<string, unknown>).data as unknown[])?.length ?? 0;
        const published = pData.filter((p: unknown) => (p as Record<string, unknown>).status === "published").length;
        const drafts = pData.filter((p: unknown) => (p as Record<string, unknown>).status === "draft").length;
        const totalRev = pData.filter((p: unknown) => (p as Record<string, unknown>).status === "published")
          .reduce((s: number, p: unknown) => s + Number((p as Record<string, unknown>).price ?? 0), 0);

        setStats({
          plugins,
          products: pData.length,
          published,
          drafts,
          content: cData.length,
          orders: 6,
          revenue: totalRev,
          uptime: h > 0 ? `${String(h)}h ${String(m)}m` : `${String(m)}m ${String(s)}s`,
          lastPublish: "—",
        });
        // Fetch last publish time async
        apiClient.get("/commerce/orders").then(({ data }) => {
          const list = (Array.isArray(data) ? data : (data as Record<string, unknown>).data as unknown[]) ?? [];
          const last = list[0] as Record<string, unknown> | undefined;
          if (last?.createdAt) {
            const dt = new Date(String(last.createdAt));
            setStats((prev) => ({ ...prev, lastPublish: dt.toLocaleString() }));
          }
        }).catch(() => {});
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    void fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-bold text-white">Dashboard</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="flex items-center gap-1 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white" rel="noreferrer">
            <Globe className="h-3.5 w-3.5" /> View Site
          </a>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Products" value={String(stats.products)} subtitle={`${stats.published} published · ${stats.drafts} drafts`} icon={Package} />
        <StatCard title="Revenue" value={`$${stats.revenue.toLocaleString()}`} subtitle="From published products" icon={TrendingUp} />
        <StatCard title="Content" value={String(stats.content)} subtitle="Pages & posts" icon={FileText} />
        <StatCard title="Plugins Active" value={`${String(stats.plugins)}/7`} subtitle="Official plugins" icon={Package} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Orders" value={String(stats.orders)} subtitle="Last 7 days" icon={ShoppingCart} />
        <StatCard title="Users" value="1" subtitle="Admin" icon={Users2} />
        <StatCard title="Uptime" value={stats.uptime} subtitle="Server running" icon={Clock} />
        <StatCard title="Last Published" value={stats.lastPublish} subtitle="Site updated" icon={Globe} />
        <StatCard title="Site Status" value="Live" subtitle="Published & active" icon={Globe} />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <a href="#/products" className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm text-blue-400 hover:bg-blue-600/30">Add Product</a>
          <a href="#/content" className="rounded-lg bg-green-600/20 px-4 py-2 text-sm text-green-400 hover:bg-green-600/30">New Content</a>
          <a href="#/media" className="rounded-lg bg-purple-600/20 px-4 py-2 text-sm text-purple-400 hover:bg-purple-600/30">Upload Media</a>
          <a href="#/orders" className="rounded-lg bg-yellow-600/20 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-600/30">View Orders</a>
          <a href="#/themeSettings" className="rounded-lg bg-pink-600/20 px-4 py-2 text-sm text-pink-400 hover:bg-pink-600/30">Customize Theme</a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon }: { title: string; value: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  plugins: PluginsPage,
  users: UsersPage,
  themes: ThemesPage,
  products: ProductsPage,
  categories: ProductsPage,
  brands: ProductsPage,
  tags: ProductsPage,
  attributes: ProductsPage,
  reviews: ProductsPage,
  content: ContentPage,
  builder: BuilderPage,
  "builder-layout": BuilderPage,
  "builder-content": BuilderPage,
  "builder-media": BuilderPage,
  "builder-commerce": BuilderPage,
  media: MediaPage,
  orders: OrdersPage,
  analytics: AnalyticsDashboard,
  seo: SeoSettingsPage,
  services: ServicesPage,
  config: ConfigPage,
  themeSettings: ThemeSettingsPage,
  monitoring: MonitoringPage,
  backups: BackupsPage,
};

export default function App() {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(2) || "dashboard";
      setCurrentPage(hash);
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => { window.removeEventListener("hashchange", handleHash); };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const PageComponent = PAGE_MAP[currentPage] ?? DashboardPage;

  return (
    <DashboardLayout currentPage={currentPage}>
      <PageComponent />
    </DashboardLayout>
  );
}
