import { useState, useEffect } from "react";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { http, authHeaders } from "../api/http";

export const AdminCouponsTab = ({ token, showToast }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: 10,
    minOrder: 0,
    maxDiscount: 0,
    startsAt: "",
    expiresAt: "",
    usageLimit: 0,
    active: true,
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await http.get("/coupons/admin", authHeaders(token));
      setCoupons(res.data?.coupons || []);
    } catch {
      showToast("error", "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrder: c.minOrder || 0,
      maxDiscount: c.maxDiscount || 0,
      startsAt: c.startsAt ? c.startsAt.slice(0, 10) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      usageLimit: c.usageLimit || 0,
      active: c.active !== false,
    });
  };

  const handleReset = () => {
    setEditingId(null);
    setForm({
      code: "",
      type: "percentage",
      value: 10,
      minOrder: 0,
      maxDiscount: 0,
      startsAt: "",
      expiresAt: "",
      usageLimit: 0,
      active: true,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      showToast("error", "Coupon code is required");
      return;
    }
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        startsAt: form.startsAt ? new Date(form.startsAt) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
      };

      if (editingId) {
        await http.put(`/coupons/admin/${editingId}`, payload, authHeaders(token));
        showToast("success", `Updated coupon ${payload.code}`);
      } else {
        await http.post("/coupons/admin", payload, authHeaders(token));
        showToast("success", `Created coupon ${payload.code}`);
      }
      handleReset();
      loadCoupons();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    try {
      await http.delete(`/coupons/admin/${id}`, authHeaders(token));
      showToast("success", `Deleted coupon ${code}`);
      loadCoupons();
    } catch {
      showToast("error", "Failed to delete coupon");
    }
  };

  const handleToggle = async (c) => {
    try {
      await http.put(`/coupons/admin/${c._id}`, { active: !c.active }, authHeaders(token));
      showToast("success", `${c.code} is now ${!c.active ? "Active" : "Disabled"}`);
      loadCoupons();
    } catch {
      showToast("error", "Failed to update coupon status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18, color: "#ff6b4a" }} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Promotions & Discounts
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0a3d52]">
            Coupon Codes & Vouchers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create discount codes, percentage or fixed reductions, and usage limits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Table of Coupons */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0a3d52]">All Coupons ({coupons.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No coupons created yet. Use the form to launch a promotion.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#0a3d52]">{c.code}</td>
                      <td className="p-3 font-bold text-emerald-600">
                        {c.type === "percentage" ? `${c.value}% OFF` : `PKR ${c.value} OFF`}
                        {c.maxDiscount > 0 && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            Max: PKR {c.maxDiscount}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {c.minOrder > 0 ? `PKR ${c.minOrder.toLocaleString()}` : "None"}
                      </td>
                      <td className="p-3 font-semibold">
                        {c.usedCount || 0} {c.usageLimit > 0 ? `/ ${c.usageLimit}` : "used"}
                      </td>
                      <td className="p-3 text-slate-500">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(c)}
                          className="cursor-pointer"
                        >
                          {c.active ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              Disabled
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          className="p-1 rounded-md text-[#0a3d52] hover:bg-slate-100 cursor-pointer"
                          title="Edit"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c._id, c.code)}
                          className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                          title="Delete"
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#0a3d52]">
              {editingId ? `Edit ${form.code}` : "Create Promo Code"}
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
              <label className="block font-bold text-slate-600 mb-1">Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. SUMMER10 or MARBLEX5"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase outline-none focus:border-[#0a3d52] focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed PKR</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Discount Value *</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-[#0a3d52] focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Min Order (PKR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Max Cap (PKR)</label>
                <input
                  type="number"
                  placeholder="0 (no limit)"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Total Usage Limit</label>
                <input
                  type="number"
                  placeholder="0 (unlimited)"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0a3d52] focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="accent-[#0a3d52]"
              />
              Active code
            </label>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0a3d52] text-white font-bold text-xs hover:bg-[#0d4e68] transition-colors cursor-pointer shadow-xs"
            >
              {editingId ? "Update Coupon" : "+ Create Coupon"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
