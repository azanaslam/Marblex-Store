import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { authHeaders, http } from "../../api/http";
import { formatMoney, formatPkt, PORTAL_TEAL, QUOTE_STATUS_COLOR } from "./portalUtils";

const emptyForm = {
  projectName: "",
  city: "",
  siteAddress: "",
  phone: "",
  message: "",
  items: [{ name: "", quantity: 1, unit: "pcs", notes: "" }],
};

export const PortalQuotes = () => {
  const { token, user } = useOutletContext();
  const [quotes, setQuotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/portal/quotes", authHeaders(token));
      setQuotes(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [token]);

  const submit = async () => {
    try {
      await http.post(
        "/portal/quotes",
        {
          ...form,
          contactName: user?.name,
          email: user?.email,
          company: user?.company,
          items: form.items.filter((i) => i.name.trim()),
        },
        authHeaders(token)
      );
      setOpen(false);
      setForm(emptyForm);
      setToast({ open: true, severity: "success", message: "RFQ submitted. Our team will respond shortly." });
      await load();
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Failed to submit RFQ" });
    }
  };

  const accept = async (id) => {
    try {
      await http.post(`/portal/quotes/${id}/accept`, {}, authHeaders(token));
      setToast({ open: true, severity: "success", message: "Quote accepted." });
      await load();
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Accept failed" });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>Quotes / RFQ</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Request project pricing for wholesale or site packages.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          New RFQ
        </Button>
      </Stack>

      {loading ? (
        <Typography color="text.secondary">Loading quotes…</Typography>
      ) : quotes.length === 0 ? (
        <Alert severity="info">No RFQs yet. Submit a request when you need volume pricing for a site.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {quotes.map((q) => (
            <Paper key={q._id} elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dbe4ea" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography sx={{ fontWeight: 800 }}>{q.quoteNumber}</Typography>
                    <Chip size="small" label={q.status} color={QUOTE_STATUS_COLOR[q.status] || "default"} />
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                    {q.projectName || "General inquiry"} · {formatPkt(q.createdAt)}
                    {q.city ? ` · ${q.city}` : ""}
                  </Typography>
                  {(q.items || []).length > 0 && (
                    <Typography sx={{ mt: 1, fontSize: 13 }}>
                      {(q.items || []).map((i) => `${i.name} ×${i.quantity}`).join(" · ")}
                    </Typography>
                  )}
                  {q.message ? (
                    <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary", whiteSpace: "pre-wrap" }}>
                      {q.message}
                    </Typography>
                  ) : null}
                  {q.quotedAmount != null ? (
                    <Typography sx={{ mt: 1, fontWeight: 800 }}>Quoted: {formatMoney(q.quotedAmount)}</Typography>
                  ) : null}
                  {q.adminNotes ? (
                    <Alert severity="info" sx={{ mt: 1.25 }}>
                      {q.adminNotes}
                    </Alert>
                  ) : null}
                </Box>
                {q.status === "quoted" && (
                  <Button variant="contained" onClick={() => accept(q._id)}>
                    Accept quote
                  </Button>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request a quote</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Project name"
              value={form.projectName}
              onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                fullWidth
                placeholder={user?.phone || ""}
              />
            </Stack>
            <TextField
              label="Site address"
              value={form.siteAddress}
              onChange={(e) => setForm((f) => ({ ...f, siteAddress: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <Typography sx={{ fontWeight: 700, pt: 1 }}>Line items</Typography>
            {form.items.map((item, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  label="Product / material"
                  value={item.name}
                  onChange={(e) => {
                    const items = [...form.items];
                    items[idx] = { ...items[idx], name: e.target.value };
                    setForm((f) => ({ ...f, items }));
                  }}
                  fullWidth
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const items = [...form.items];
                    items[idx] = { ...items[idx], quantity: Number(e.target.value) || 1 };
                    setForm((f) => ({ ...f, items }));
                  }}
                  sx={{ width: 100 }}
                />
                <IconButton
                  disabled={form.items.length <= 1}
                  onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              onClick={() =>
                setForm((f) => ({ ...f, items: [...f.items, { name: "", quantity: 1, unit: "pcs", notes: "" }] }))
              }
            >
              Add line
            </Button>
            <TextField
              label="Notes for sales team"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={submit}>
            Submit RFQ
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
