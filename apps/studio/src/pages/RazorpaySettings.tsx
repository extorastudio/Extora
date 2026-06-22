import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Save, CreditCard, Settings, Key } from "lucide-react";

export default function RazorpaySettingsPage() {
  const [config, setConfig] = useState({ keyId: "", keySecret: "", currency: "INR", enabled: false });
  const [keySecret, setKeySecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("config");

  useEffect(() => { void fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const r = await apiClient.get("/razorpay/config");
      setConfig(r.data.data ?? {});
    } catch { /* */ }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await apiClient.post("/razorpay/config", { keyId: config.keyId, keySecret, currency: config.currency });
      setMsg("Settings saved. Republish to apply.");
      setKeySecret("");
    } catch { setMsg("Failed to save"); }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-blue-400" />
        <h1 className="text-xl font-bold text-white">Razorpay Settings</h1>
      </div>

      <div className="mb-4 flex gap-2">
        {(["config", "orders"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-blue-600 text-white" : "border border-gray-700 text-gray-400 hover:bg-gray-800"}`}>
            {t === "config" ? "API Configuration" : "Payment Orders"}
          </button>
        ))}
      </div>

      {tab === "config" && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 space-y-4 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">API Credentials</span>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Razorpay Key ID</label>
            <input type="text" value={config.keyId} onChange={e => setConfig({ ...config, keyId: e.target.value })}
              placeholder="rzp_live_xxxxxxxxxx"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Razorpay Key Secret</label>
            <input type="password" value={keySecret} onChange={e => setKeySecret(e.target.value)}
              placeholder="Enter key secret"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            <p className="text-[10px] text-gray-600 mt-1">Leave blank to keep existing secret unchanged</p>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Currency</label>
            <select value={config.currency} onChange={e => setConfig({ ...config, currency: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 p-3">
            <Settings className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Webhook URL</p>
              <code className="text-[11px] text-blue-400">https://yourdomain.com/api/v1/razorpay/webhook</code>
            </div>
            <button onClick={() => { void navigator.clipboard.writeText("https://yourdomain.com/api/v1/razorpay/webhook"); }}
              className="rounded border border-gray-700 px-2 py-1 text-[10px] text-gray-400 hover:bg-gray-800">
              Copy
            </button>
          </div>

          <div className="rounded-lg bg-gray-900/50 border border-gray-800 p-3">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Webhook Events</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> payment.captured</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> payment.failed</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> order.paid</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> refund.created</span>
            </div>
            <p className="text-[10px] text-gray-600 mt-2">Configure these in your Razorpay Dashboard → Settings → Webhooks</p>
          </div>

          <button onClick={() => void saveConfig()} disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Configuration"}
          </button>
          {msg && <p className="text-sm text-green-400">{msg}</p>}
        </div>
      )}

      {tab === "orders" && (
        <div className="rounded-lg border border-gray-800 p-6">
          <p className="text-gray-500 text-sm">Payment orders will appear here. Configure Razorpay keys first.</p>
        </div>
      )}
    </div>
  );
}
