import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { authHeaders, http } from "../api/http";

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

  const u = detail?.user;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Customers & Access</h2>
        <p className="text-sm text-[#565e69]">
          Company profiles, roles, and login access · {pendingAccessCount} pending approval
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="rounded-2xl border border-[#e0e6ed] bg-white p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[#0a3d52]">{user.name}</h3>
                  <Chip size="small" label={user.role} />
                  {user.isBlocked && <Chip size="small" color="error" label="blocked" />}
                  {user.role === "user" && user.isAccessGranted === false && (
                    <Chip size="small" color="warning" label="pending" />
                  )}
                </div>
                <p className="text-xs text-[#565e69] mt-1">{user.email}</p>
                <p className="text-xs text-[#565e69]">
                  {user.company || "No company"} · {user.city || "—"} · {user.phone || "no phone"}
                </p>
                {(user.ntn || user.strn) && (
                  <p className="text-xs text-[#565e69] mt-0.5">
                    NTN: {user.ntn || "—"} · STRN: {user.strn || "—"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {user.role !== "admin" && (
                <>
                  <Button size="small" variant="outlined" onClick={() => openDetail(user)} disabled={loadingId === user._id}>
                    Company view
                  </Button>
                  <TextField
                    select
                    size="small"
                    value={user.role === "subowner" ? "subowner" : "user"}
                    onChange={(e) => changeRole(user._id, e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="user">user</MenuItem>
                    <MenuItem value="subowner">subowner</MenuItem>
                  </TextField>
                  <Button
                    size="small"
                    variant={user.isAccessGranted ? "outlined" : "contained"}
                    color={user.isAccessGranted ? "warning" : "success"}
                    onClick={() => onToggleAccess?.(user)}
                  >
                    {user.isAccessGranted ? "Revoke access" : "Approve"}
                  </Button>
                  <Button
                    size="small"
                    color={user.isBlocked ? "success" : "error"}
                    variant="outlined"
                    onClick={() => onToggleBlock?.(user)}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="md">
        <DialogTitle>Customer profile</DialogTitle>
        <DialogContent>
          {!u ? (
            <Typography>Loading…</Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box className="rounded-xl bg-[#f5f7fa] border border-[#e0e6ed] p-3">
                <Typography sx={{ fontWeight: 800 }}>{u.name}</Typography>
                <Typography sx={{ fontSize: 13 }}>{u.email} · {u.phone}</Typography>
                <Typography sx={{ fontSize: 13, mt: 0.5 }}>
                  {u.company} · {u.industryType} · {u.city}
                </Typography>
                <Typography sx={{ fontSize: 13 }}>NTN {u.ntn || "—"} · STRN {u.strn || "—"}</Typography>
                {(u.deliverySites || []).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Delivery sites</Typography>
                    {(u.deliverySites || []).map((s) => (
                      <Typography key={s._id} sx={{ fontSize: 12, color: "text.secondary" }}>
                        · {s.label}: {s.address}
                        {s.city ? `, ${s.city}` : ""}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>

              <Typography sx={{ fontWeight: 800 }}>Recent orders ({detail.orders?.length || 0})</Typography>
              {(detail.orders || []).length === 0 ? (
                <Alert severity="info">No orders linked.</Alert>
              ) : (
                (detail.orders || []).slice(0, 8).map((o) => (
                  <Typography key={o._id} sx={{ fontSize: 13 }}>
                    {o.orderNumber || o._id} · {o.orderStatus} · {o.paymentStatus} · PKR{" "}
                    {Number(o.subtotal || 0).toLocaleString()}
                  </Typography>
                ))
              )}

              <Typography sx={{ fontWeight: 800 }}>RFQs ({detail.quotes?.length || 0})</Typography>
              {(detail.quotes || []).slice(0, 5).map((q) => (
                <Typography key={q._id} sx={{ fontSize: 13 }}>
                  {q.quoteNumber} · {q.status}
                  {q.quotedAmount != null ? ` · PKR ${Number(q.quotedAmount).toLocaleString()}` : ""}
                </Typography>
              ))}

              <Typography sx={{ fontWeight: 800 }}>Tickets ({detail.tickets?.length || 0})</Typography>
              {(detail.tickets || []).slice(0, 5).map((t) => (
                <Typography key={t._id} sx={{ fontSize: 13 }}>
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
