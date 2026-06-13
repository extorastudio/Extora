import { useEffect, useState } from "react";
import { useAuthStore } from "./stores/auth-store";
import LoginPage from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import PluginsPage from "./pages/Plugins";
import UsersPage from "./pages/Users";
import ThemesPage from "./pages/Themes";
import ServicesPage from "./pages/Services";
import ConfigPage from "./pages/Config";
import MonitoringPage from "./pages/Monitoring";
import BackupsPage from "./pages/Backups";

function DashboardPage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-white">Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Plugins" value="0" subtitle="Active" />
        <StatCard title="Users" value="0" subtitle="Total" />
        <StatCard title="Storage" value="0 MB" subtitle="Used" />
        <StatCard title="Uptime" value="—" subtitle="Server" />
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
