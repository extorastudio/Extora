import { useState } from "react";
import { useAuthStore } from "../../stores/auth-store";
import apiClient from "../../api/client";
import {
  LayoutDashboard,
  Users,
  Puzzle,
  Palette,
  Settings,
  Server,
  HardDrive,
  FileText,
  Image,
  Activity,
  LogOut,
  Menu,
  X,
  Package,
  ShoppingCart,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "content", label: "Content", icon: FileText },
  { id: "media", label: "Media", icon: Image },
  { id: "users", label: "Users", icon: Users },
  { id: "plugins", label: "Plugins", icon: Puzzle },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "themeSettings", label: "Theme Settings", icon: Settings },
  { id: "services", label: "Services", icon: Server },
  { id: "config", label: "Configuration", icon: Settings },
];

const bottomNavItems = [
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "backups", label: "Backups", icon: HardDrive },
];

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { user, logout } = useAuthStore();

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMsg(null);
    try {
      const { data } = await apiClient.post("/site/publish");
      const site = (data as { site?: { pages: number; sizeKB: number } }).site;
      setPublishMsg({ ok: true, text: `Published! ${String(site?.pages ?? 0)} pages, ${String(site?.sizeKB ?? 0)} KB` });
    } catch {
      setPublishMsg({ ok: false, text: "Publish failed" });
    } finally {
      setPublishing(false);
      setTimeout(() => { setPublishMsg(null); }, 5000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => { setSidebarOpen(false); }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-gray-800 bg-gray-900 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
          <span className="text-lg font-bold text-white">Extora</span>
          <button
            className="text-gray-400 hover:text-white lg:hidden"
            onClick={() => { setSidebarOpen(false); }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <a
                key={item.id}
                href={item.id === "dashboard" ? "#/" : `#/${item.id}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="border-t border-gray-800 p-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <a
                key={item.id}
                href={`#/${item.id}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </a>
            );
          })}
        </div>

        {/* User section */}
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
              {user?.displayName.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-white">{user?.displayName}</p>
              <p className="truncate text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-800 bg-gray-900 px-4">
          <button
            className="text-gray-400 hover:text-white lg:hidden"
            onClick={() => { setSidebarOpen(true); }}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold text-white">
            {navItems.find((n) => n.id === currentPage)?.label ?? "Dashboard"}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Publish notification */}
          {publishMsg && (
            <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${publishMsg.ok ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
              {publishMsg.ok ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {publishMsg.text}
            </div>
          )}

          {/* Global Publish Button */}
          <button
            onClick={() => void handlePublish()}
            disabled={publishing}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
            {publishing ? "Publishing..." : "Publish Site"}
          </button>

          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white"
            rel="noreferrer"
          >
            <Globe className="h-3 w-3" /> View Site
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
