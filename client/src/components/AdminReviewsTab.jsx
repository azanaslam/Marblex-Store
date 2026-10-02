import { useEffect, useMemo, useState } from "react";
import { authHeaders, http } from "../api/http";

const emptyForm = {
  name: "",
  role: "",
  company: "",
  quote: "",
  rating: 5,
  email: "",
  phone: "",
  status: "approved",
  featured: false,
};

export const AdminReviewsTab = ({ token, showToast }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/client-reviews/admin/list", authHeaders(token));
      setReviews(res.data || []);
    } catch {
      showToast?.("error", "Failed to load client reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const pendingCount = useMemo(
    () => reviews.filter((r) => r.status === "pending").length,
    [reviews]
  );

  const visible = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [reviews, filter]);

  const setStatus = async (id, status) => {
    try {
      await http.patch(`/client-reviews/admin/${id}`, { status }, authHeaders(token));
      showToast?.("success", `Review marked ${status}.`);
      load();
    } catch {
      showToast?.("error", "Could not update review status.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await http.delete(`/client-reviews/admin/${id}`, authHeaders(token));
      showToast?.("success", "Review deleted.");
      load();
    } catch {
      showToast?.("error", "Could not delete review.");
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await http.post("/client-reviews/admin", form, authHeaders(token));
      showToast?.("success", "Review added.");
      setForm(emptyForm);
      load();
    } catch (err) {
      showToast?.("error", err?.response?.data?.message || "Could not add review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#0a3d52]">Client Reviews</h2>
          <p className="text-xs text-[#565e69]">
            Approve website submissions · {pendingCount} pending
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                filter === key
                  ? "bg-[#0a3d52] text-white"
                  : "border border-[#e0e6ed] bg-white text-[#565e69]"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={create}
        className="grid gap-3 rounded-2xl border border-[#e0e6ed] bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <p className="sm:col-span-2 lg:col-span-3 text-[11px] font-bold uppercase tracking-wider text-[#565e69]">
          Add review manually
        </p>
        {[
          ["name", "Name"],
          ["role", "Role / Title"],
          ["company", "Company"],
          ["email", "Email (optional)"],
          ["phone", "Phone (optional)"],
        ].map(([key, label]) => (
          <input
            key={key}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={label}
            required={["name", "role", "company"].includes(key)}
            className="rounded-xl border border-[#e0e6ed] px-3 py-2.5 text-sm outline-none focus:border-[#0a3d52]"
          />
        ))}
        <select
          value={form.rating}
          onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
          className="rounded-xl border border-[#e0e6ed] px-3 py-2.5 text-sm outline-none focus:border-[#0a3d52]"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} Stars
            </option>
          ))}
        </select>
        <textarea
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
          placeholder="Review quote"
          required
          rows={3}
          className="sm:col-span-2 lg:col-span-3 rounded-xl border border-[#e0e6ed] px-3 py-2.5 text-sm outline-none focus:border-[#0a3d52]"
        />
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 lg:col-span-3 rounded-xl bg-[#0a3d52] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Publish Review"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-[#565e69]">Loading reviews...</p>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-[#e0e6ed] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.source} · {item.rating}/5
                    </span>
                  </div>
                  <p className="text-sm italic text-[#565e69]">"{item.quote}"</p>
                  <p className="mt-2 text-xs font-bold text-[#0a3d52]">
                    {item.name} · {item.role} · {item.company}
                  </p>
                  {(item.email || item.phone) && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {[item.email, item.phone].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {item.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => setStatus(item._id, "approved")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      Approve
                    </button>
                  )}
                  {item.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => setStatus(item._id, "rejected")}
                      className="rounded-lg bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(item._id)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!visible.length && (
            <p className="rounded-2xl border border-dashed border-[#e0e6ed] bg-white p-8 text-center text-sm text-[#565e69]">
              No reviews in this filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
