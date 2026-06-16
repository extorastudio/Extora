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
import { Package, Users2, Clock } from "lucide-react";
import { CardSkeleton } from "./components/ui/Skeleton";

function DashboardPage() {
  const [stats, setStats] = useState({ plugins: 0, products: 0, uptime: "—" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [healthRes, pluginsRes, productsRes] = await Promise.all([
          apiClient.get("/system/health"),
          apiClient.get("/plugins"),
          apiClient.get("/commerce/products"),
        ]);
        const u = (healthRes.data as Record<string, unknown>).uptime as number;
        const h = Math.floor(u / 3600);
        const m = Math.floor((u % 3600) / 60);
        const s = u % 60;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pData = (pluginsRes.data as Record<string, any>).data ?? pluginsRes.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prData = (productsRes.data as Record<string, any>).data ?? productsRes.data;
        setStats({
          plugins: Array.isArray(pData) ? pData.length : 0,
          products: Array.isArray(prData) ? prData.length : 0,
          uptime: h > 0 ? `${String(h)}h ${String(m)}m` : `${String(m)}m ${String(s)}s`,
        });
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
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-white">Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Plugins" value={String(stats.plugins)} subtitle="Installed" icon={Package} />
        <StatCard title="Products" value={String(stats.products)} subtitle="In Store" icon={Package} />
        <StatCard title="Users" value="1" subtitle="Admin" icon={Users2} />
        <StatCard title="Uptime" value={stats.uptime} subtitle="Server" icon={Clock} />
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
  content: ContentPage,
  media: MediaPage,
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
