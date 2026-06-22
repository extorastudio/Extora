import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { Truck, Save, RefreshCw } from "lucide-react";

export default function ShippingSettingsPage() {
  const [config, setConfig] = useState({
    name: "Standard Delivery", type: "flat", baseCharge: 49, freeAbove: 499,
    perKgCharge: 0, extraChargeEnabled: false, extraChargePercent: 0, extraChargeFixed: 0,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { void fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const r = await apiClient.get("/shipping/config");
      if (r.data.data) setConfig({ ...config, ...r.data.data });
    } catch { /* */ }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await apiClient.post("/shipping/config", config);
      setMsg("Saved! Republish to apply.");
    } catch { setMsg("Failed to save"); }
    setSaving(false);
  };

  const u = (field: string, value: unknown) => setConfig({ ...config, [field]: value });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Truck className="h-6 w-6 text-orange-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Shipping Settings</h1>
          <p className="text-sm text-gray-500">Configure delivery charges and free shipping threshold</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Delivery Charges</h3>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Shipping Method Name</label>
            <input type="text" value={config.name} onChange={e => u("name", e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Base Charge (₹)</label>
              <input type="number" value={config.baseCharge} onChange={e => u("baseCharge", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Free Above (₹)</label>
              <input type="number" value={config.freeAbove} onChange={e => u("freeAbove", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              <p className="text-[10px] text-gray-600 mt-1">Orders above this amount get free shipping</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Per KG Charge (₹)</label>
            <input type="number" value={config.perKgCharge} onChange={e => u("perKgCharge", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Extra Charges</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={config.extraChargeEnabled}
              onChange={e => u("extraChargeEnabled", e.target.checked)}
              className="accent-blue-500 h-4 w-4" />
            <span className="text-sm text-gray-300">Enable extra delivery charges</span>
          </label>

          {config.extraChargeEnabled && (
            <div className="space-y-3 pl-7">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Extra Charge % (of order total)</label>
                <input type="number" value={config.extraChargePercent} onChange={e => u("extraChargePercent", Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fixed Extra Charge (₹)</label>
                <input type="number" value={config.extraChargeFixed} onChange={e => u("extraChargeFixed", Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-[11px] text-gray-500">
                  Example: Order of ₹1000 with 5% + ₹20 fixed = ₹70 extra charge
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => void saveConfig()} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Configuration"}
        </button>
        <button onClick={() => void fetchConfig()}
          className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800">
          <RefreshCw className="h-4 w-4" /> Reset
        </button>
        {msg && <span className="text-sm text-green-400">{msg}</span>}
      </div>
    </div>
  );
}
