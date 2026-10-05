import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { authHeaders, http } from "../api/http";

const isPending = (u) => u.role === "user" && u.isAccessGranted === false && !u.isBlocked;

export const AdminCustomersTab = ({
  token,
  users = [],
  pendingAccessCount = 0,
  showToast,
  onToggleAccess,
  onToggleBlock,
  onReload,
}) => {
  const [detail, setDetail] = useState(null);
  const [loadingId, setLoadingId] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: users.length, pending: 0, active: 0, blocked: 0, subowner: 0 };
    users.forEach((u) => {
      if (u.isBlocked) c.blocked += 1;
      else if (isPending(u)) c.pending += 1;
      else if (u.role === "subowner") c.subowner += 1;
      else if (u.isAccessGranted !== false) c.active += 1;
    });
    return c;
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "pending" && !isPending(u)) return false;
      if (filter === "active" && (u.isBlocked || isPending(u) || u.role === "admin")) return false;
      if (filter === "blocked" && !u.isBlocked) return false;
      if (filter === "subowner" && u.role !== "subowner") return false;
      if (!q) return true;
      const hay = [u.name, u.email, u.company, u.city, u.phone, u.role]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");
      return hay.includes(q);
    });
  }, [users, filter, query]);

  const filters = [
    { id: "all", label: `All (${counts.all})` },
    { id: "pending", label: `Pending (${counts.pending})` },
    { id: "active", label: `Active (${counts.active})` },
    { id: "subowner", label: `Subowners (${counts.subowner})` },
    { id: "blocked", label: `Blocked (${counts.blocked})` },
  ];

  const openDetail = async (user) => {
    setLoadingId(user._id);
    try {
      const res = await http.get(`/admin/users/${user._id}`, authHeaders(token));
      setDetail(res.data);
    } catch {
      showToast?.("error", "Failed to load customer profile.");
    } finally {
      setLoadingId("");
    }
  };

  const changeRole = async (userId, role) => {
    try {
      await http.patch(`/admin/users/${userId}/role`, { role }, authHeaders(token));
      showToast?.("success", `Role updated to ${role}.`);
      onReload?.();
      if (detail?.user?._id === userId) {
        const res = await http.get(`/admin/users/${userId}`, authHeaders(token));
        setDetail(res.data);
      }
    } catch (err) {
      showToast?.("error", err.response?.data?.message || "Role update failed");
    }
  };

  const statusMeta = (user) => {
    if (user.isBlocked) return { label: "Blocked", cls: "bg-rose-50 text-rose-700 border-rose-100" };
    if (isPending(user)) return { label: "Pending", cls: "bg-amber-50 text-amber-800 border-amber-100" };
    if (user.role === "admin") return { label: "Admin", cls: "bg-[#0a3d52]/10 text-[#0a3d52] border-[#0a3d52]/15" };
    if (user.role === "subowner") return { label: "Subowner", cls: "bg-sky-50 text-sky-800 border-sky-100" };
    return { label: "Active", cls: "bg-emerald-50 text-emerald-800 border-emerald-100" };
  };

  const u = detail?.user;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8] mb-1">
            Access
          </p>
          <h2 className="text-[24px] font-extrabold tracking-[-0.5px] text-[#0a3d52] leading-none">
            Customers & Access
          </h2>
          <p className="text-[13px] text-[#64748b] mt-2">
            Company profiles, roles, and login access
          </p>
        </div>
        {pendingAccessCount > 0 ? (
          <span className="self-start inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-amber-50 border border-amber-100 text-[12px] font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {pendingAccessCount} pending approval
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-[#dce3e8] bg-white p-2.5 sm:p-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, company, city…"
            className="w-full sm:max-w-xs h-10 rounded-lg border border-[#dce3e8] bg-white px-3 text-[13px] font-medium text-[#0a3d52] outline-none focus:border-[#0a3d52] focus:ring-2 focus:ring-[#0a3d52]/10"
          />
          <div className="flex-1 flex gap-1.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 h-10 px-3 rounded-md text-[12px] font-semibold transition-colors ${
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

      <div className="rounded-xl border border-[#dce3e8] bg-white overflow-hidden">
        <div className="hidden lg:grid grid-cols-[minmax(0,1.4fr)_100px_minmax(0,1fr)_110px_minmax(220px,auto)] gap-3 px-4 py-2.5 bg-[#f8fafc] border-b border-[#eef2f5] text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
          <span>Customer</span>
          <span>Status</span>
          <span>Company</span>
          <span>Role</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-[14px] font-bold text-[#0a3d52]">No customers</p>
            <p className="text-[12px] text-[#64748b] mt-1">
              {users.length ? "Nothing matches this filter." : "Registered accounts will appear here."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#eef2f5]">
            {filtered.map((user) => {
              const meta = statusMeta(user);
              const isAdmin = user.role === "admin";
              return (
                <li
                  key={user._id}
                  className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_100px_minmax(0,1fr)_110px_minmax(220px,auto)] gap-2.5 lg:gap-3 px-3.5 lg:px-4 py-3.5 hover:bg-[#fafbfc] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 lg:hidden flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-[#94a3b8]">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[14px] font-bold text-[#0a3d52] leading-snug truncate">
                      {user.name || "Unnamed"}
                    </p>
                    <p className="text-[12px] text-[#64748b] mt-0.5 truncate">{user.email}</p>
                    <p className="lg:hidden text-[11px] text-[#64748b] mt-1 truncate">
                      {user.company || "No company"} · {user.city || "—"} · {user.phone || "no phone"}
                    </p>
                  </div>

                  <div className="hidden lg:flex items-center">
                    <span
                      className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${meta.cls}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="hidden lg:flex flex-col justify-center min-w-0">
                    <span className="text-[12px] font-semibold text-[#0a3d52] truncate">
                      {user.company || "—"}
                    </span>
                    <span className="text-[11px] text-[#64748b] truncate">
                      {user.city || "—"} · {user.phone || "no phone"}
                    </span>
                  </div>

                  <div className="hidden lg:flex items-center">
                    {isAdmin ? (
                      <span className="text-[12px] font-semibold text-[#475569]">admin</span>
                    ) : (
                      <div
                        className="inline-flex h-9 rounded-lg border border-[#dce3e8] bg-[#f8fafc] p-0.5"
                        role="group"
                        aria-label="Role"
                      >
                        {["user", "subowner"].map((role) => {
                          const active = (user.role === "subowner" ? "subowner" : "user") === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                if (!active) changeRole(user._id, role);
                              }}
                              className={`h-8 px-2.5 rounded-md text-[11px] font-bold transition-colors ${
                                active
                                  ? "bg-[#0a3d52] text-white shadow-sm"
                                  : "text-[#64748b] hover:text-[#0a3d52]"
                              }`}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-1.5">
                    {!isAdmin && (
                      <>
                        <div
                          className="lg:hidden inline-flex h-9 w-full max-w-[220px] rounded-lg border border-[#dce3e8] bg-[#f8fafc] p-0.5"
                          role="group"
                          aria-label="Role"
                        >
                          {["user", "subowner"].map((role) => {
                            const active = (user.role === "subowner" ? "subowner" : "user") === role;
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  if (!active) changeRole(user._id, role);
                                }}
                                className={`flex-1 h-8 rounded-md text-[11px] font-bold transition-colors ${
                                  active
                                    ? "bg-[#0a3d52] text-white shadow-sm"
                                    : "text-[#64748b]"
                                }`}
                              >
                                {role}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetail(user)}
                            disabled={loadingId === user._id}
                            className="h-9 px-3 rounded-lg border border-[#dce3e8] bg-white text-[12px] font-bold text-[#0a3d52] hover:bg-[#f8fafc] disabled:opacity-50 transition-colors"
                          >
                            {loadingId === user._id ? "…" : "Profile"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleAccess?.(user)}
                            className={`h-9 px-3 rounded-lg text-[12px] font-bold transition-colors ${
                              user.isAccessGranted
                                ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {user.isAccessGranted ? "Revoke" : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleBlock?.(user)}
                            className={`h-9 px-3 rounded-lg text-[12px] font-bold border transition-colors ${
                              user.isBlocked
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            }`}
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </div>
                      </>
                    )}
                    {isAdmin && (
                      <span className="text-[11px] font-semibold text-[#94a3b8]">Protected</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800, color: "#0a3d52" }}>Customer profile</DialogTitle>
        <DialogContent>
          {!u ? (
            <Typography>Loading…</Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-3.5">
                <Typography sx={{ fontWeight: 800, color: "#0a3d52" }}>{u.name}</Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                  {u.email} · {u.phone}
                </Typography>
                <Typography sx={{ fontSize: 13, mt: 0.5, color: "#475569" }}>
                  {u.company} · {u.industryType} · {u.city}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                  NTN {u.ntn || "—"} · STRN {u.strn || "—"}
                </Typography>
                {(u.deliverySites || []).length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 12, color: "#0a3d52", mb: 0.5 }}>
                      Delivery sites
                    </Typography>
                    {(u.deliverySites || []).map((s) => (
                      <Typography key={s._id} sx={{ fontSize: 12, color: "text.secondary" }}>
                        · {s.label}: {s.address}
                        {s.city ? `, ${s.city}` : ""}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>

              <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#0a3d52" }}>
                Recent orders ({detail.orders?.length || 0})
              </Typography>
              {(detail.orders || []).length === 0 ? (
                <Alert severity="info">No orders linked.</Alert>
              ) : (
                (detail.orders || []).slice(0, 8).map((o) => (
                  <Typography key={o._id} sx={{ fontSize: 13, color: "#475569" }}>
                    {o.orderNumber || o._id} · {o.orderStatus} · {o.paymentStatus} · PKR{" "}
                    {Number(o.subtotal || 0).toLocaleString()}
                  </Typography>
                ))
              )}

              <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#0a3d52" }}>
                RFQs ({detail.quotes?.length || 0})
              </Typography>
              {(detail.quotes || []).slice(0, 5).map((q) => (
                <Typography key={q._id} sx={{ fontSize: 13, color: "#475569" }}>
                  {q.quoteNumber} · {q.status}
                  {q.quotedAmount != null
                    ? ` · PKR ${Number(q.quotedAmount).toLocaleString()}`
                    : ""}
                </Typography>
              ))}

              <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#0a3d52" }}>
                Tickets ({detail.tickets?.length || 0})
              </Typography>
              {(detail.tickets || []).slice(0, 5).map((t) => (
                <Typography key={t._id} sx={{ fontSize: 13, color: "#475569" }}>
                  {t.ticketNumber} · {t.status} · {t.subject}
                </Typography>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
