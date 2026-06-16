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
import { Globe, CheckCircle, AlertCircle } from "lucide-react";

function DashboardPage() {
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; site?: { pages: number; sizeKB: number; url: string } } | null>(null);
  const [uptime, setUptime] = useState<string>("—");

  useEffect(() => {
    const fetchUptime = async () => {
      try {
        const { data } = await apiClient.get("/system/health");
        const u = Math.floor(Number(data.uptime ?? 0));
        const h = Math.floor(u / 3600);
        const m = Math.floor((u % 3600) / 60);
        const s = u % 60;
        setUptime(h > 0 ? `${String(h)}h ${String(m)}m` : `${String(m)}m ${String(s)}s`);
      } catch { /* ignore */ }
    };
    void fetchUptime();
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    setPublishResult(null);
    try {
      const { data } = await apiClient.post("/site/publish");
      setPublishResult(data as { success: boolean; site?: { pages: number; sizeKB: number; url: string } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setPublishResult({ success: false });
      console.error(axiosErr.response?.data?.message ?? "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <button
          onClick={() => void handlePublish()}
          disabled={publishing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Globe className="h-4 w-4" />
          {publishing ? "Publishing..." : "Publish Site"}
        </button>
      </div>

      {publishResult && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${publishResult.success ? "border-green-800 bg-green-900/30 text-green-300" : "border-red-800 bg-red-900/30 text-red-300"}`}>
          {publishResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {publishResult.success && publishResult.site
            ? `Site published: ${String(publishResult.site.pages)} pages, ${String(publishResult.site.sizeKB)} KB → ${publishResult.site.url}`
            : "Publish failed. Check server logs."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Plugins" value="6" subtitle="Official" />
        <StatCard title="Users" value="1" subtitle="Admin" />
        <StatCard title="Storage" value="MinIO/S3" subtitle="Connected" />
        <StatCard title="Uptime" value={uptime} subtitle="Server" />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
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
  services: ServicesPage,
  config: ConfigPage,
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
