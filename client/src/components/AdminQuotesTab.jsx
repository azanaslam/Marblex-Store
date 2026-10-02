import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { authHeaders, http } from "../api/http";

const STATUS_COLOR = {
  submitted: "warning",
  reviewing: "info",
  quoted: "secondary",
  accepted: "success",
  rejected: "error",
  converted: "success",
};

export const AdminQuotesTab = ({ token, showToast }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ status: "reviewing", quotedAmount: "", adminNotes: "" });

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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0a3d52] font-heading">RFQ / Quote Desk</h2>
          <p className="text-sm text-[#565e69]">Review client quote requests and send quoted amounts.</p>
        </div>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Typography color="text.secondary">Loading RFQs…</Typography>
      ) : quotes.length === 0 ? (
        <Alert severity="info">No RFQs yet. Client portal submissions will appear here.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {quotes.map((q) => (
            <Box
              key={q._id}
              className="rounded-2xl border border-[#e0e6ed] bg-white p-4 shadow-sm"
            >
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={1.5}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography sx={{ fontWeight: 800 }}>{q.quoteNumber}</Typography>
                    <Chip size="small" label={q.status} color={STATUS_COLOR[q.status] || "default"} />
                  </Stack>
                  <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                    {q.contactName} · {q.company || "—"} · {q.email} · {q.phone}
                  </Typography>
                  <Typography sx={{ fontSize: 13, mt: 0.5 }}>
                    {q.projectName || "General"} {q.city ? `· ${q.city}` : ""}
                    {q.siteAddress ? ` · ${q.siteAddress}` : ""}
                  </Typography>
                  {(q.items || []).length > 0 && (
                    <Typography sx={{ fontSize: 13, mt: 1 }}>
                      {(q.items || []).map((i) => `${i.name} ×${i.quantity}`).join(" · ")}
                    </Typography>
                  )}
                  {q.message ? (
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 1, whiteSpace: "pre-wrap" }}>
                      {q.message}
                    </Typography>
                  ) : null}
                  {q.quotedAmount != null ? (
                    <Typography sx={{ fontWeight: 800, mt: 1 }}>
                      Quoted: PKR {Number(q.quotedAmount).toLocaleString()}
                    </Typography>
                  ) : null}
                </Box>
                <Button variant="contained" color="secondary" onClick={() => openEdit(q)}>
                  Update quote
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(edit)} onClose={() => setEdit(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update {edit?.quoteNumber}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              fullWidth
            >
              {["submitted", "reviewing", "quoted", "accepted", "rejected", "converted"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quoted amount (PKR)"
              type="number"
              value={form.quotedAmount}
              onChange={(e) => setForm((f) => ({ ...f, quotedAmount: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Admin notes (visible to client)"
              multiline
              minRows={3}
              value={form.adminNotes}
              onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdit(null)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
