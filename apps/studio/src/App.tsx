import { useEffect } from "react";
import { useAuthStore } from "./stores/auth-store";
import LoginPage from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";

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

export default function App() {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

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

  return (
    <DashboardLayout currentPage="dashboard">
      <DashboardPage />
    </DashboardLayout>
  );
}
