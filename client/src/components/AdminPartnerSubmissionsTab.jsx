import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const statusLabel = (s) => String(s || "pending").replace(/_/g, " ");

export const AdminPartnerSubmissionsTab = ({ reviewItems = [] }) => {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: reviewItems.length, unread: 0, pending: 0, published: 0, other: 0 };
    reviewItems.forEach((item) => {
      if (item.hasAdminUnread) c.unread += 1;
      const st = String(item.status || "pending").toLowerCase();
      if (st === "pending" || st === "looking") c.pending += 1;
      else if (st === "published") c.published += 1;
      else c.other += 1;
    });
    return c;
  }, [reviewItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviewItems.filter((item) => {
      const st = String(item.status || "pending").toLowerCase();
      if (filter === "unread" && !item.hasAdminUnread) return false;
      if (filter === "pending" && !(st === "pending" || st === "looking")) return false;
      if (filter === "published" && st !== "published") return false;
      if (!q) return true;
      const name = String(item.name || "").toLowerCase();
      const desc = String(item.description || item.comment || "").toLowerCase();
      const by = String(item.submittedBy?.name || item.userId?.name || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || by.includes(q);
    });
  }, [reviewItems, filter, query]);

  const filters = [
    { id: "all", label: `All (${counts.all})` },
    { id: "unread", label: `Unread (${counts.unread})` },
    { id: "pending", label: `Pending (${counts.pending})` },
    { id: "published", label: `Published (${counts.published})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8] mb-1">Partners</p>
          <h2 className="text-[24px] font-extrabold tracking-[-0.5px] text-[#0a3d52] leading-none">
            Product Submissions
          </h2>
          <p className="text-[13px] text-[#64748b] mt-2">
            Subowner catalog items awaiting review / publish
          </p>
        </div>
        {counts.unread > 0 ? (
          <span className="self-start inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-rose-50 border border-rose-100 text-[12px] font-bold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {counts.unread} unread
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-[#dce3e8] bg-white p-2.5 sm:p-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, partner, notes…"
            className="w-full sm:max-w-xs h-10 rounded-lg border border-[#dce3e8] bg-white px-3 text-[13px] font-medium text-[#0a3d52] outline-none focus:border-[#0a3d52] focus:ring-2 focus:ring-[#0a3d52]/10"
          />
          <div className="flex-1 flex gap-1.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 h-10 px-3 rounded-md text-[12px] font-semibold transition-colors ${
                  filter === f.id ? "bg-[#0a3d52] text-white" : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#dce3e8] bg-white overflow-hidden">
        <div className="hidden md:grid grid-cols-[minmax(0,1.5fr)_120px_140px_110px_130px] gap-3 px-4 py-2.5 bg-[#f8fafc] border-b border-[#eef2f5] text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
          <span>Product</span>
          <span>Status</span>
          <span>Partner</span>
          <span>Price</span>
          <span className="text-right">Action</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-[14px] font-bold text-[#0a3d52]">No submissions</p>
            <p className="text-[12px] text-[#64748b] mt-1">
              {reviewItems.length ? "Nothing matches this filter." : "Partner uploads will appear here."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#eef2f5]">
            {filtered.map((item) => {
              const st = String(item.status || "pending").toLowerCase();
              const by = item.submittedBy?.name || item.userId?.name || "Partner";
              return (
                <li
                  key={item._id}
                  className="grid grid-cols-1 md:grid-cols-[minmax(0,1.5fr)_120px_140px_110px_130px] gap-2 md:gap-3 px-3.5 md:px-4 py-3.5 hover:bg-[#fafbfc] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 md:hidden">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                        {statusLabel(st)}
                      </span>
                      {item.hasAdminUnread ? (
                        <span className="text-[10px] font-bold uppercase text-rose-600">Unread</span>
                      ) : null}
                    </div>
                    <p className="text-[14px] font-bold text-[#0a3d52] leading-snug line-clamp-2">
                      {item.name || "Untitled product"}
                    </p>
                    <p className="text-[12px] text-[#64748b] mt-0.5 line-clamp-2">
                      {item.description || item.comment || "No description"}
                    </p>
                    <p className="md:hidden text-[12px] font-semibold text-[#0a3d52] mt-1.5">
                      PKR {Number(item.price || 0).toLocaleString()} · Stock {item.stock ?? 0}
                    </p>
                    <p className="md:hidden text-[11px] text-[#64748b] mt-1">By {by}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-[12px] font-semibold capitalize text-[#475569]">{statusLabel(st)}</span>
                    {item.hasAdminUnread ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Unread" />
                    ) : null}
                  </div>
                  <div className="hidden md:flex items-center">
                    <span className="text-[12px] font-semibold text-[#0a3d52] truncate">{by}</span>
                  </div>
                  <div className="hidden md:flex items-center">
                    <span className="text-[12px] font-bold text-[#0a3d52] tabular-nums">
                      {Number(item.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center md:justify-end">
                    <Link
                      to={`/admin/review/${item._id}`}
                      className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg text-[12px] font-bold text-white bg-[#0a3d52] hover:bg-[#083243] transition-colors"
                    >
                      Open review
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
