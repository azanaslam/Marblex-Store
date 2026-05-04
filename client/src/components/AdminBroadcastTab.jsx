import { useCallback, useEffect, useState } from "react";
import { Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import { authHeaders, http } from "../api/http";

export const AdminBroadcastTab = ({ token, showToast }) => {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [sending, setSending] = useState(false);

  const headers = authHeaders(token);

  const loadBroadcasts = useCallback(async () => {
    const res = await http.get("/chat/broadcasts", headers);
    setItems(res.data || []);
  }, [token]);

  useEffect(() => {
    loadBroadcasts().catch(() => showToast?.("error", "Could not load broadcasts."));
  }, [loadBroadcasts, showToast]);

  const sendBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await http.post("/admin/broadcast", { message: message.trim() }, headers);
      setMessage("");
      await loadBroadcasts();
      showToast?.("success", "Broadcast sent. All users will see it on their dashboard.");
    } catch {
      showToast?.("error", "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e5e7eb" }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <CampaignIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Broadcast message
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          This message appears on every logged-in user&apos;s dashboard (announcements, offers, updates).
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Write something for all users…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={sendBroadcast} disabled={sending || !message.trim()}>
          Send to all users
        </Button>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e5e7eb" }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2}>
          Recent broadcasts
        </Typography>
        <Stack divider={<Divider flexItem />} spacing={2}>
          {!items.length && (
            <Typography color="text.secondary" variant="body2">
              No broadcasts yet.
            </Typography>
          )}
          {items.map((b) => (
            <Box key={b._id}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {b.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(b.createdAt).toLocaleString()}
                {b.createdBy?.name ? ` · ${b.createdBy.name}` : ""}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};
