import { useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, http } from "../api/http";

const CATEGORIES = ["tds", "sds", "manual", "brochure", "certificate", "other"];

const emptyForm = {
  title: "",
  category: "brochure",
  description: "",
  fileUrl: "",
  active: true,
};

const inputCls =
  "w-full h-11 rounded-lg border border-[#dce3e8] bg-white px-3 text-[13px] font-medium text-[#0a3d52] outline-none placeholder:text-[#94a3b8] focus:border-[#0a3d52] focus:ring-2 focus:ring-[#0a3d52]/10";

const catIcon = {
  tds: "📄",
  sds: "⚠️",
  manual: "📘",
  brochure: "📰",
  certificate: "🏅",
  other: "📁",
};

export const AdminDocumentsTab = ({ token, showToast }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("list"); // list | form
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const topRef = useRef(null);

  const scrollTop = () => {
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/portal/admin/documents", authHeaders(token));
      setDocs(res.data || []);
    } catch {
      showToast?.("error", "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (filter === "active" && !d.active) return false;
      if (filter === "hidden" && d.active) return false;
      if (CATEGORIES.includes(filter) && d.category !== filter) return false;
      if (!q) return true;
      const hay = `${d.title || ""} ${d.description || ""} ${d.category || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [docs, filter, query]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const openNew = () => {
    resetForm();
    setMode("form");
    scrollTop();
  };

  const openEdit = (doc) => {
    setEditingId(doc._id);
    setForm({
      title: doc.title || "",
      category: doc.category || "brochure",
      description: doc.description || "",
      fileUrl: doc.fileUrl || "",
      active: doc.active !== false,
    });
    setMode("form");
    scrollTop();
  };

  const save = async () => {
    if (!form.title?.trim() || !form.fileUrl?.trim()) {
      showToast?.("error", "Title and file URL are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await http.put(`/portal/admin/documents/${editingId}`, form, authHeaders(token));
        showToast?.("success", "Document updated.");
      } else {
        await http.post("/portal/admin/documents", form, authHeaders(token));
        showToast?.("success", "Document added.");
      }
      resetForm();
      setMode("list");
      await load();
      scrollTop();
    } catch (err) {
      showToast?.("error", err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (doc) => {
    try {
      await http.put(`/portal/admin/documents/${doc._id}`, { active: !doc.active }, authHeaders(token));
      await load();
    } catch {
      showToast?.("error", "Failed to update visibility");
    }
  };

  const remove = async (id) => {
    try {
      await http.delete(`/portal/admin/documents/${id}`, authHeaders(token));
      showToast?.("success", "Document removed.");
      if (editingId === id) resetForm();
      await load();
    } catch {
      showToast?.("error", "Failed to delete");
    }
  };

  const filters = [
    { id: "all", label: `All (${docs.length})` },
    { id: "active", label: "Active" },
    { id: "hidden", label: "Hidden" },
    ...CATEGORIES.map((c) => ({ id: c, label: c.toUpperCase() })),
  ];

  return (
    <div ref={topRef} className="mx-docs space-y-4 scroll-mt-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8] mb-1">Library</p>
          <h2 className="text-[24px] font-extrabold tracking-[-0.5px] text-[#0a3d52] leading-none">
            Technical Documents
          </h2>
          <p className="text-[13px] text-[#64748b] mt-2">Portal TDS, SDS, manuals & brochures</p>
        </div>
        {mode === "list" ? (
          <button
            type="button"
            onClick={openNew}
            className="shrink-0 h-10 px-4 rounded-lg text-[13px] font-bold text-white bg-[#ff6a45] hover:bg-[#f25b37] transition-colors"
          >
            Add document
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setMode("list");
            }}
            className="shrink-0 h-10 px-4 rounded-lg text-[13px] font-bold text-[#0a3d52] bg-white border border-[#dce3e8] hover:bg-[#f8fafc] transition-colors"
          >
            ← Back
          </button>
        )}
      </div>

      {mode === "form" ? (
        <div className="rounded-xl border border-[#dce3e8] bg-white overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-[#eef2f5] bg-[#fafbfc]">
            <h3 className="text-[15px] font-bold text-[#0a3d52]">
              {editingId ? "Edit document" : "New document"}
            </h3>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Active files appear in the client portal library
            </p>
          </div>
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-3xl">
            <label className="block sm:col-span-2">
              <span className="block text-[12px] font-semibold text-[#475569] mb-1.5">Title</span>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Water Stopper 123 — TDS"
              />
            </label>
            <label className="block">
              <span className="block text-[12px] font-semibold text-[#475569] mb-1.5">Category</span>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end">
              <span className="inline-flex items-center gap-2 h-11 w-full px-3 rounded-lg border border-[#dce3e8] bg-white text-[13px] font-semibold text-[#0a3d52] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active !== false}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="accent-[#0a3d52] scale-110"
                />
                Visible in portal
              </span>
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-[12px] font-semibold text-[#475569] mb-1.5">File / page URL</span>
              <input
                className={inputCls}
                value={form.fileUrl}
                onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                placeholder="https://… or /pdfs/file.pdf"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-[12px] font-semibold text-[#475569] mb-1.5">Description</span>
              <textarea
                rows={3}
                className={`${inputCls} h-auto py-2.5 resize-y`}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short note for the portal"
              />
            </label>
            <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-2 pt-1">
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="h-11 px-5 rounded-lg text-[13px] font-bold text-white bg-[#0a3d52] hover:bg-[#083243] disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Publish document"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode("list");
                }}
                className="h-11 px-5 rounded-lg text-[13px] font-bold text-[#64748b] border border-[#dce3e8] bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Compact toolbar */}
          <div className="rounded-xl border border-[#dce3e8] bg-white p-2.5 sm:p-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents…"
                className={`${inputCls} sm:max-w-xs`}
              />
              <div className="flex-1 flex gap-1.5 overflow-x-auto">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`shrink-0 h-9 px-3 rounded-md text-[12px] font-semibold transition-colors ${
                      filter === f.id
                        ? "bg-[#0a3d52] text-white"
                        : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table-like list */}
          <div className="rounded-xl border border-[#dce3e8] bg-white overflow-hidden">
            <div className="hidden sm:grid grid-cols-[minmax(0,1.6fr)_110px_90px_220px] gap-3 px-4 py-2.5 bg-[#f8fafc] border-b border-[#eef2f5] text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
              <span>Document</span>
              <span>Type</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {loading ? (
              <div className="px-4 py-16 text-center text-[13px] font-semibold text-[#64748b]">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-[14px] font-bold text-[#0a3d52]">No documents</p>
                <p className="text-[12px] text-[#64748b] mt-1">Try another filter or add a new file.</p>
                <button
                  type="button"
                  onClick={openNew}
                  className="mt-4 h-9 px-4 rounded-lg text-[12px] font-bold text-white bg-[#ff6a45]"
                >
                  Add document
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#eef2f5]">
                {filtered.map((doc) => (
                  <li
                    key={doc._id}
                    className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_110px_90px_220px] gap-2 sm:gap-3 px-3.5 sm:px-4 py-3.5 hover:bg-[#fafbfc] transition-colors"
                  >
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="hidden sm:grid h-10 w-10 rounded-lg bg-[#f1f5f9] place-items-center text-base shrink-0">
                        {catIcon[doc.category] || catIcon.other}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#0a3d52] leading-snug truncate">{doc.title}</p>
                        <p className="text-[12px] text-[#64748b] mt-0.5 truncate">
                          {doc.description || doc.fileUrl}
                        </p>
                        <div className="sm:hidden flex gap-1.5 mt-2">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                            {doc.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              doc.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {doc.active ? "active" : "hidden"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center">
                      <span className="text-[12px] font-semibold uppercase text-[#475569]">{doc.category}</span>
                    </div>
                    <div className="hidden sm:flex items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                          doc.active ? "text-emerald-700" : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${doc.active ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                        {doc.active ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-2.5 rounded-md text-[12px] font-semibold text-[#0a3d52] hover:bg-[#f1f5f9] inline-flex items-center"
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={() => openEdit(doc)}
                        className="h-8 px-2.5 rounded-md text-[12px] font-semibold text-white bg-[#0a3d52] hover:bg-[#083243]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(doc)}
                        className="h-8 px-2.5 rounded-md text-[12px] font-semibold text-[#475569] hover:bg-[#f1f5f9]"
                      >
                        {doc.active ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(doc._id)}
                        className="h-8 px-2.5 rounded-md text-[12px] font-semibold text-[#dc2626] hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};
