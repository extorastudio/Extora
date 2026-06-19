import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { RefreshCw, Shield, UserPlus, Save, X, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLES = ["VIEWER", "EDITOR", "AUTHOR", "MANAGER", "ADMIN", "SUPER_ADMIN"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ email: string; displayName: string; password: string; role: string }>({ email: "", displayName: "", password: "", role: "VIEWER" });
  const [msg, setMsg] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/users");
      setUsers(Array.isArray(data) ? data : data.data ?? []);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { void fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!editing.email.trim() || !editing.password.trim()) { setMsg("Email and password required"); return; }
    try {
      await apiClient.post("/auth/register", editing);
      setMsg("User created");
      setShowForm(false);
      setEditing({ email: "", displayName: "", password: "", role: "VIEWER" });
      void fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setMsg(axiosErr.response?.data?.message ?? "Failed to create user");
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const toggleActive = async (user: User) => {
    try {
      await apiClient.patch(`/users/${encodeURIComponent(user.id)}`, { isActive: !user.isActive });
      void fetchUsers();
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => void fetchUsers()} className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.includes("fail") ? "border-red-800 bg-red-900/20 text-red-400" : "border-green-800 bg-green-900/20 text-green-400"}`}>{msg}</div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Add New User</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Display Name *</label>
              <input type="text" value={editing.displayName} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" placeholder="John Doe" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Email *</label>
              <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" placeholder="john@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Password *</label>
              <input type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Role</label>
              <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
                {ROLES.map((r) => (<option key={r} value={r}>{r.replace("_", " ")}</option>))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => void handleCreate()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Save className="h-4 w-4" /> Create User</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
                        {(user.displayName ?? "U").charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.displayName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${user.role === "SUPER_ADMIN" ? "bg-purple-900/40 text-purple-400" : "bg-blue-900/30 text-blue-400"}`}>
                      <Shield className="h-3 w-3" /> {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${user.isActive ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                      {user.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => void toggleActive(user)} className={`rounded px-3 py-1 text-xs font-medium ${user.isActive ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "bg-green-600/20 text-green-400 hover:bg-green-600/30"}`}>
                      {user.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
