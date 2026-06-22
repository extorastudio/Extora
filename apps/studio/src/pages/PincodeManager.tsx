import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { MapPin, Plus, Trash2, RefreshCw, Check, X } from "lucide-react";

interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  deliveryDays: number;
  extraCharge: number;
  codAvailable: boolean;
}

export default function PincodeManagerPage() {
  const [pincodes, setPincodes] = useState<PincodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<PincodeData>({
    pincode: "", city: "", state: "", isServiceable: true,
    deliveryDays: 3, extraCharge: 0, codAvailable: true,
  });

  useEffect(() => { void fetchPincodes(); }, []);

  const fetchPincodes = async () => {
    setLoading(true);
    try {
      const r = await apiClient.get("/pincode");
      setPincodes(r.data.data ?? []);
    } catch { /* */ }
    setLoading(false);
  };

  const savePincode = async () => {
    if (!form.pincode || form.pincode?.length !== 6) return;
    try {
      await apiClient.post("/pincode", form);
      setShowAdd(false);
      setForm({ pincode: "", city: "", state: "", isServiceable: true, deliveryDays: 3, extraCharge: 0, codAvailable: true });
      void fetchPincodes();
    } catch { /* */ }
  };

  const deletePincode = async (pincode: string) => {
    try {
      await apiClient.delete(`/pincode/${encodeURIComponent(pincode)}`);
      void fetchPincodes();
    } catch { /* */ }
  };

  const toggleServiceable = async (pincode: PincodeData) => {
    try {
      await apiClient.post("/pincode", { ...pincode, isServiceable: !pincode.isServiceable });
      void fetchPincodes();
    } catch { /* */ }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-green-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Pincode Manager</h1>
            <p className="text-sm text-gray-500">{pincodes.length} pincodes configured</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">
            <Plus className="h-4 w-4" /> Add Pincode
          </button>
          <button onClick={() => void fetchPincodes()} className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-800">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Pincode *</label>
              <input type="text" maxLength={6} value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">City</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">State</label>
              <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Delivery (days)</label>
              <input type="number" value={form.deliveryDays} onChange={e => setForm({ ...form, deliveryDays: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Extra Charge (₹)</label>
              <input type="number" value={form.extraCharge} onChange={e => setForm({ ...form, extraCharge: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer mb-2">
                <input type="checkbox" checked={form.codAvailable} onChange={e => setForm({ ...form, codAvailable: e.target.checked })}
                  className="accent-blue-500" /> COD
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer mb-2">
                <input type="checkbox" checked={form.isServiceable} onChange={e => setForm({ ...form, isServiceable: e.target.checked })}
                  className="accent-green-500" /> Serviceable
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void savePincode()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500">Save</button>
            <button onClick={() => setShowAdd(false)}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Pincode</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">City</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">State</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Delivery</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Extra</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">COD</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : pincodes.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No pincodes added yet</td></tr>
            ) : (
              pincodes.map((p) => (
                <tr key={p.pincode} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                  <td className="px-4 py-3 font-mono text-white">{p.pincode}</td>
                  <td className="px-4 py-3 text-gray-300">{p.city || "—"}</td>
                  <td className="px-4 py-3 text-gray-300">{p.state || "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{p.deliveryDays}d</td>
                  <td className="px-4 py-3 text-right text-gray-300">{p.extraCharge > 0 ? `₹${p.extraCharge}` : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {p.codAvailable ? <Check className="mx-auto h-4 w-4 text-green-500" /> : <X className="mx-auto h-4 w-4 text-red-500" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => void toggleServiceable(p)}
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                        p.isServiceable ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                      {p.isServiceable ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => void deletePincode(p.pincode)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-900/30">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
