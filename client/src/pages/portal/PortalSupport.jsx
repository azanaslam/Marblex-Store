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
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { authHeaders, http } from "../../api/http";
import { UserSupportChat } from "../../components/UserSupportChat";
import { formatPkt, PORTAL_TEAL, TICKET_STATUS_COLOR } from "./portalUtils";

export const PortalSupport = () => {
  const { token } = useOutletContext();
  const [tab, setTab] = useState(0);
  const [broadcasts, setBroadcasts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ subject: "", category: "other", body: "", priority: "normal" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const loadTickets = async () => {
    const res = await http.get("/portal/tickets", authHeaders(token));
    setTickets(res.data || []);
  };

  useEffect(() => {
    http.get("/chat/broadcasts", authHeaders(token)).then((r) => setBroadcasts(r.data || [])).catch(() => {});
    loadTickets().catch(() => {});
  }, [token]);

  const createTicket = async () => {
    try {
      await http.post("/portal/tickets", form, authHeaders(token));
      setOpen(false);
      setForm({ subject: "", category: "other", body: "", priority: "normal" });
      setToast({ open: true, severity: "success", message: "Ticket created." });
      await loadTickets();
      setTab(2);
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Failed" });
    }
  };

  const sendReply = async () => {
    if (!activeTicket || !reply.trim()) return;
    try {
      const res = await http.post(`/portal/tickets/${activeTicket._id}/reply`, { body: reply }, authHeaders(token));
      setActiveTicket(res.data);
      setReply("");
      await loadTickets();
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Reply failed" });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>Support</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Live chat, announcements, and formal tickets.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
          New ticket
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Live chat" />
        <Tab label="Broadcasts" />
        <Tab label="Tickets" />
      </Tabs>

      {tab === 0 && (
        <Paper elevation={0} sx={{ p: 1, borderRadius: 3, border: "1px solid #dbe4ea", minHeight: 420 }}>
          <UserSupportChat
            token={token}
            showToast={(severity, message) => setToast({ open: true, severity, message })}
          />
        </Paper>
      )}

      {tab === 1 && (
        <Stack spacing={1.25}>
          {broadcasts.length === 0 ? (
            <Alert severity="info">No announcements yet.</Alert>
          ) : (
            broadcasts.map((b) => (
              <Paper key={b._id} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #dbe4ea" }}>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{b.message}</Typography>
                <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>{formatPkt(b.createdAt)}</Typography>
              </Paper>
            ))
          )}
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={1.5}>
          {tickets.length === 0 ? (
            <Alert severity="info">No tickets yet. Create one for billing, delivery, or technical help.</Alert>
          ) : (
            tickets.map((t) => (
              <Paper
                key={t._id}
                elevation={0}
                sx={{ p: 2, borderRadius: 3, border: "1px solid #dbe4ea", cursor: "pointer" }}
                onClick={() => setActiveTicket(t)}
              >
                <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>
                      {t.ticketNumber} · {t.subject}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {t.category} · {formatPkt(t.updatedAt)} · {(t.messages || []).length} message(s)
                    </Typography>
                  </Box>
                  <Chip size="small" label={t.status} color={TICKET_STATUS_COLOR[t.status] || "default"} />
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      )}

      <Dialog open={Boolean(activeTicket)} onClose={() => setActiveTicket(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {activeTicket?.ticketNumber} · {activeTicket?.subject}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1, maxHeight: 360, overflowY: "auto" }}>
            {(activeTicket?.messages || []).map((m) => (
              <Box
                key={m._id || m.createdAt}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  bgcolor: m.sender === "user" ? "#0b2f3c" : "#f4f8fa",
                  color: m.sender === "user" ? "#fff" : "inherit",
                  maxWidth: "90%",
                }}
              >
                <Typography sx={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{m.body}</Typography>
                <Typography sx={{ fontSize: 10, opacity: 0.7, mt: 0.5 }}>{formatPkt(m.createdAt)}</Typography>
              </Box>
            ))}
          </Stack>
          {activeTicket?.status !== "closed" && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button variant="contained" onClick={sendReply}>
                Send
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActiveTicket(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New support ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              fullWidth
            >
              {["order", "product", "delivery", "billing", "technical", "other"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Describe the issue"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createTicket}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
