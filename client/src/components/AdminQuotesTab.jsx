import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { authHeaders, http } from "../api/http";

const STATUS_STYLE = {
  submitted: "bg-amber-50 text-amber-800 border-amber-200",
  reviewing: "bg-sky-50 text-sky-800 border-sky-200",
  quoted: "bg-violet-50 text-violet-800 border-violet-200",
  accepted: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-50 text-rose-800 border-rose-200",
  converted: "bg-teal-50 text-teal-800 border-teal-200",
};

export const AdminQuotesTab = ({ token, showToast }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: "reviewing", quotedAmount: "", adminNotes: "" });

  const counts = useMemo(() => {
    const c = { all: quotes.length, submitted: 0, reviewing: 0, quoted: 0 };
    quotes.forEach((q) => {
      if (c[q.status] != null) c[q.status] += 1;
    });
    return c;
  }, [quotes]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/portal/admin/quotes", authHeaders(token));
      setQuotes(res.data || []);
    } catch {
      showToast?.("error", "Failed to load RFQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [token]);

  const openEdit = (q) => {
    setEdit(q);
    setForm({
      status: q.status || "reviewing",
      quotedAmount: q.quotedAmount ?? "",
      adminNotes: q.adminNotes || "",
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await http.patch(
        `/portal/admin/quotes/${edit._id}`,
        {
          status: form.status,
          quotedAmount: form.quotedAmount === "" ? null : Number(form.quotedAmount),
          adminNotes: form.adminNotes,
        },
        authHeaders(token)
      );
      showToast?.("success", "Quote updated.");
      setEdit(null);
      await load();
    } catch (err) {
      showToast?.("error", err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#3b82f6] shadow-[0_0_0_4px_rgba(59,130,246,.18)]" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6b8190]">
              Quote desk
            </span>
          </div>
          <h2 className="text-[22px] sm:text-xl md:text-2xl font-extrabold text-[#0a3d52] font-heading tracking-[-0.4px]">
            RFQ / Quote Desk
          </h2>
          <p className="text-[12px] sm:text-xs text-[#6b8190] mt-1 max-w-[52ch]">
            Review client quote requests and send quoted amounts.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="self-start sm:self-auto min-h-[40px] px-3.5 py-2 rounded-xl text-[13px] font-extrabold text-[#0a3d52] bg-white border border-[#e2e8ec] shadow-[0_3px_0_#e8eef1]"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "All RFQs", value: counts.all, tone: "text-[#0a3d52]" },
          { label: "Submitted", value: counts.submitted, tone: "text-amber-700" },
          { label: "Reviewing", value: counts.reviewing, tone: "text-sky-700" },
          { label: "Quoted", value: counts.quoted, tone: "text-violet-700" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#e2e8ec] bg-white px-3 py-2.5 shadow-[0_1px_0_#fff_inset,0_6px_14px_-12px_rgba(11,47,61,.3)]"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#94a3b8]">{s.label}</p>
            <p className={`text-lg font-black mt-0.5 tabular-nums ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#e2e8ec] bg-white px-5 py-12 text-center text-sm font-bold text-[#6b8190]">
          Loading RFQs…
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c9d7e2] bg-gradient-to-b from-sky-50/70 to-white px-5 py-12 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-sky-100 text-sky-700 grid place-items-center text-lg font-black shadow-[0_3px_0_#9ec5e0]">
            ✎
          </div>
          <p className="text-[15px] font-extrabold text-[#0a3d52]">No RFQs yet</p>
          <p className="text-xs text-[#6b8190] mt-1">Client portal submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {quotes.map((q) => {
            const statusClass = STATUS_STYLE[q.status] || "bg-slate-50 text-slate-700 border-slate-200";
            return (
              <article
                key={q._id}
                className="rounded-2xl border border-[#e2e8ec] bg-white overflow-hidden shadow-[0_1px_2px_rgba(11,47,61,.04),0_12px_24px_-16px_rgba(11,47,61,.22)]"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#0a3d52] via-[#3b82f6] to-[#ff6b4a]/50" />
                <div className="p-3.5 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[12px] font-extrabold text-[#0a3d52] bg-[#f1f5f9] border border-[#e2e8ec] px-2 py-0.5 rounded-lg">
                          {q.quoteNumber}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-lg border ${statusClass}`}
                        >
                          {q.status}
                        </span>
                      </div>

                      <h3 className="mt-2 text-[15px] font-extrabold text-[#0a3d52] tracking-[-0.2px]">
                        {q.contactName}
                        {q.company ? (
                          <span className="font-semibold text-[#64748b]"> · {q.company}</span>
                        ) : null}
                      </h3>
                      <p className="text-[11px] text-[#64748b] mt-0.5 break-words">
                        {[q.email, q.phone].filter(Boolean).join(" · ") || "No contact"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(q.projectName || q.city || q.siteAddress) && (
                          <span className="inline-flex max-w-full items-baseline gap-1 rounded-lg bg-[#f8fafc] border border-[#e8eef2] px-2 py-1 text-[11px]">
                            <span className="font-extrabold uppercase tracking-wide text-[9px] text-[#94a3b8]">
                              Site
                            </span>
                            <span className="font-semibold text-[#334155] truncate">
                              {[q.projectName || "General", q.city, q.siteAddress].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                        )}
                      </div>

                      {(q.items || []).length > 0 ? (
                        <div className="mt-2.5 space-y-1">
                          {(q.items || []).slice(0, 4).map((item, idx) => (
                            <div
                              key={`${q._id}-i-${idx}`}
                              className="flex items-center justify-between gap-2 rounded-lg bg-[#f8fafc] border border-[#eef2f5] px-2.5 py-1.5"
                            >
                              <p className="text-[12px] font-bold text-[#0f1929] truncate min-w-0">
                                {item.name}
                              </p>
                              <span className="text-[11px] font-extrabold text-[#ff6b4a] shrink-0">
                                ×{item.quantity}
                              </span>
                            </div>
                          ))}
                          {(q.items || []).length > 4 ? (
                            <p className="text-[10px] font-bold text-[#94a3b8] px-1">
                              +{(q.items || []).length - 4} more items
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {q.message ? (
                        <p className="mt-2 text-[12px] text-[#64748b] leading-relaxed whitespace-pre-wrap line-clamp-3">
                          {q.message}
                        </p>
                      ) : null}

                      {q.quotedAmount != null ? (
                        <p className="mt-2.5 text-[14px] font-black text-[#0a3d52] tabular-nums">
                          Quoted{" "}
                          <span className="text-[#ff6b4a]">
                            PKR {Number(q.quotedAmount).toLocaleString()}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => openEdit(q)}
                      className="w-full sm:w-auto shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl text-[13px] font-extrabold text-white bg-gradient-to-b from-[#ff8460] to-[#ff6a45] shadow-[0_4px_0_#c63f1d,0_10px_16px_-8px_rgba(255,106,69,.55)]"
                    >
                      Update quote
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            border: "1px solid #e2e8ec",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0a3d52", pb: 1 }}>
          Update {edit?.quoteNumber}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-3 pt-1">
            <label className="block">
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                Status
              </span>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-xl border border-[#e2e8ec] bg-[#f8fafc] px-3 py-2.5 text-[13px] font-bold text-[#0a3d52] outline-none"
              >
                {["submitted", "reviewing", "quoted", "accepted", "rejected", "converted"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                Quoted amount (PKR)
              </span>
              <input
                type="number"
                value={form.quotedAmount}
                onChange={(e) => setForm((f) => ({ ...f, quotedAmount: e.target.value }))}
                className="w-full rounded-xl border border-[#e2e8ec] bg-[#f8fafc] px-3 py-2.5 text-[13px] font-bold text-[#0a3d52] outline-none"
                placeholder="0"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                Admin notes (visible to client)
              </span>
              <textarea
                rows={3}
                value={form.adminNotes}
                onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
                className="w-full rounded-xl border border-[#e2e8ec] bg-[#f8fafc] px-3 py-2.5 text-[13px] font-semibold text-[#0a3d52] outline-none resize-y"
                placeholder="Optional message for the client"
              />
            </label>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <button
            type="button"
            onClick={() => setEdit(null)}
            className="min-h-[40px] px-4 rounded-xl text-[13px] font-extrabold text-[#6b8190] border border-[#e2e8ec] bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="min-h-[40px] px-4 rounded-xl text-[13px] font-extrabold text-white bg-gradient-to-b from-[#145068] to-[#0a3d52] shadow-[0_3px_0_#07202b] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
