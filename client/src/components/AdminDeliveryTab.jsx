import { useState, useEffect } from "react";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { http, authHeaders } from "../api/http";

export const AdminDeliveryTab = ({ token, showToast }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    city: "",
    charge: 0,
    freeAbove: 0,
    etaDays: "2-4 days",
    active: true,
  });

  const loadRates = async () => {
    try {
      setLoading(true);
      const res = await http.get("/shipping/admin/rates", authHeaders(token));
      setRates(res.data?.rates || []);
    } catch {
      showToast("error", "Failed to load shipping rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleEdit = (r) => {
    setEditingId(r._id);
    setForm({
      city: r.city,
      charge: r.charge,
      freeAbove: r.freeAbove || 0,
      etaDays: r.etaDays || "2-4 days",
      active: r.active !== false,
    });
  };

  const handleReset = () => {
    setEditingId(null);
    setForm({
      city: "",
      charge: 0,
      freeAbove: 0,
      etaDays: "2-4 days",
      active: true,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.city.trim()) {
      showToast("error", "City name is required");
      return;
    }
    try {
      if (editingId) {
        await http.put(`/shipping/admin/rates/${editingId}`, form, authHeaders(token));
        showToast("success", `Updated rates for ${form.city}`);
      } else {
        await http.post("/shipping/admin/rates", form, authHeaders(token));
        showToast("success", `Added shipping rate for ${form.city}`);
      }
      handleReset();
      loadRates();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save rate");
    }
  };

  const handleDelete = async (id, city) => {
    if (!window.confirm(`Delete shipping rate for ${city}?`)) return;
    try {
      await http.delete(`/shipping/admin/rates/${id}`, authHeaders(token));
      showToast("success", `Deleted ${city}`);
      loadRates();
    } catch {
      showToast("error", "Failed to delete rate");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: "#0a3d52" }} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Logistics & Delivery
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0a3d52]">
            City Delivery Charges & ETA
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage flat delivery rates, free delivery thresholds, and transit times across Pakistani cities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Table of Rates */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0a3d52]">Configured Cities ({rates.length})</h3>
            <span className="text-xs text-slate-400">Default rate applies to unlisted cities</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">City</th>
                  <th className="p-3">Delivery Charge</th>
                  <th className="p-3">Free Delivery Over</th>
                  <th className="p-3">Estimated Transit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rates.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-[#0a3d52]">{r.city}</td>
                    <td className="p-3 font-semibold">
                      {r.charge === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `PKR ${r.charge.toLocaleString()}`
                      )}
                    </td>
                    <td className="p-3 text-slate-600">
                      {r.freeAbove > 0 ? `PKR ${r.freeAbove.toLocaleString()}` : "None"}
                    </td>
                    <td className="p-3 text-slate-600">{r.etaDays || "2-4 days"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.active !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {r.active !== false ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(r)}
                        className="p-1 rounded-md text-[#0a3d52] hover:bg-slate-100 cursor-pointer"
                        title="Edit"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r._id, r.city)}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Delete"
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#0a3d52]">
              {editingId ? `Edit ${form.city}` : "Add New City Rate"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">City Name *</label>
              <input
                type="text"
                placeholder="e.g. Faisalabad (or 'Other')"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Standard Delivery Fee (PKR) *</label>
              <input
                type="number"
                value={form.charge}
                onChange={(e) => setForm({ ...form, charge: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Free Delivery Above (PKR)</label>
              <input
                type="number"
                placeholder="e.g. 50000 (0 for no free threshold)"
                value={form.freeAbove}
                onChange={(e) => setForm({ ...form, freeAbove: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Estimated Transit Time</label>
              <input
                type="text"
                placeholder="e.g. 24-48 hours or 2-4 days"
                value={form.etaDays}
                onChange={(e) => setForm({ ...form, etaDays: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="accent-[#0a3d52]"
              />
              Active rate
            </label>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0a3d52] text-white font-bold text-xs hover:bg-[#0d4e68] transition-colors cursor-pointer shadow-xs"
            >
              {editingId ? "Update Rate" : "+ Add City Rate"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
