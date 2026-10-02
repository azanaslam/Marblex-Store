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

const STATUS_COLOR = { open: "warning", waiting: "info", closed: "default" };

export const AdminTicketsTab = ({ token, showToast }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("waiting");

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/portal/admin/tickets", authHeaders(token));
      setTickets(res.data || []);
    } catch {
      showToast?.("error", "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [token]);

  const openTicket = (t) => {
    setActive(t);
    setReply("");
    setStatus(t.status === "closed" ? "closed" : "waiting");
  };

  const send = async () => {
    try {
      const res = await http.post(
        `/portal/admin/tickets/${active._id}/reply`,
        { body: reply, status },
        authHeaders(token)
      );
      setActive(res.data);
      setReply("");
      showToast?.("success", "Ticket updated.");
      await load();
    } catch (err) {
      showToast?.("error", err.response?.data?.message || "Failed");
    }
  };

  const openCount = tickets.filter((t) => t.status !== "closed").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Support Tickets</h2>
          <p className="text-sm text-[#565e69]">
            Formal tickets & datasheet requests · {openCount} open/waiting
          </p>
        </div>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Typography color="text.secondary">Loading tickets…</Typography>
      ) : tickets.length === 0 ? (
        <Alert severity="info">No tickets yet.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {tickets.map((t) => (
            <Box
              key={t._id}
              onClick={() => openTicket(t)}
              className="rounded-2xl border border-[#e0e6ed] bg-white p-4 shadow-sm cursor-pointer hover:border-[#ff8c73] transition-colors"
            >
              <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    {t.ticketNumber} · {t.subject}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {t.userId?.name || "Client"} · {t.userId?.email || ""} · {t.category} ·{" "}
                    {(t.messages || []).length} msg
                  </Typography>
                </Box>
                <Chip size="small" label={t.status} color={STATUS_COLOR[t.status] || "default"} />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(active)} onClose={() => setActive(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {active?.ticketNumber} · {active?.subject}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1, maxHeight: 320, overflowY: "auto" }}>
            {(active?.messages || []).map((m) => (
              <Box
                key={m._id || `${m.createdAt}-${m.body?.slice(0, 8)}`}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: m.sender === "admin" ? "#0b2f3c" : "#f4f8fa",
                  color: m.sender === "admin" ? "#fff" : "inherit",
                  alignSelf: m.sender === "admin" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                }}
              >
                <Typography sx={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{m.body}</Typography>
              </Box>
            ))}
          </Stack>
          <Stack spacing={1.25} sx={{ mt: 2 }}>
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="open">open</MenuItem>
              <MenuItem value="waiting">waiting</MenuItem>
              <MenuItem value="closed">closed</MenuItem>
            </TextField>
            <TextField
              label="Reply"
              multiline
              minRows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActive(null)}>Close</Button>
          <Button variant="contained" onClick={send} disabled={!reply.trim() && status === active?.status}>
            Send / Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
