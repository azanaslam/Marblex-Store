import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { authHeaders, http } from "../../api/http";
import { getAuthToken } from "../../auth/session";
import {
  getUnseenBroadcasts,
  markAllBroadcastsSeen,
  markBroadcastSeen,
  notifyNotifsChanged,
} from "../../notifications/broadcastSeen";
import { formatPkt, PORTAL_ACCENT, PORTAL_TEAL } from "./portalUtils";

const previewText = (text, max = 90) => {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
};

export const PortalNotifications = () => {
  const navigate = useNavigate();
  const token = getAuthToken();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [chatItems, setChatItems] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [activeBc, setActiveBc] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const headers = authHeaders(token);
      const [inboxRes, bcRes] = await Promise.all([
        http.get("/chat/inbox", headers),
        http.get("/chat/broadcasts", headers),
      ]);
      setChatItems(Array.isArray(inboxRes.data?.messages) ? inboxRes.data.messages : []);
      const allBc = Array.isArray(bcRes.data) ? bcRes.data : [];
      setBroadcasts(getUnseenBroadcasts(allBc));
    } catch {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = async () => {
    if (!token || busy) return;
    setBusy(true);
    try {
      await http.post("/chat/mark-read", {}, authHeaders(token));
      const bcRes = await http.get("/chat/broadcasts", authHeaders(token));
      markAllBroadcastsSeen(Array.isArray(bcRes.data) ? bcRes.data : []);
      setChatItems([]);
      setBroadcasts([]);
      notifyNotifsChanged();
    } catch {
      setError("Could not mark all as read.");
    } finally {
      setBusy(false);
    }
  };

  const openChatMessage = async (messageId) => {
    if (!token) return;
    try {
      if (messageId) {
        await http.post("/chat/mark-read", { messageId }, authHeaders(token));
      } else {
        await http.post("/chat/mark-read", {}, authHeaders(token));
      }
      notifyNotifsChanged();
    } catch {}
    navigate("/dashboard/support", { state: { focus: "chat" } });
  };

  const openBroadcast = (b) => {
    markBroadcastSeen(b._id);
    setBroadcasts((prev) => prev.filter((x) => String(x._id) !== String(b._id)));
    setActiveBc(b);
  };

  const total = chatItems.length + broadcasts.length;

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "min(100dvh - 7.25rem, 960px)",
        bgcolor: "#eff3f7",
        borderRadius: { xs: 0, md: "18px 0 0 18px" },
        overflow: "auto",
        p: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <IconButton
            size="small"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to portal"
            sx={{ border: "1px solid #dbe4ea", bgcolor: "#fff" }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 22 }, color: PORTAL_TEAL, lineHeight: 1.2 }}>
              Notifications
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {total > 0 ? `${total} unread update${total === 1 ? "" : "s"}` : "You're all caught up"}
            </Typography>
          </Box>
        </Stack>

        {total > 0 && (
          <Button
            variant="outlined"
            size="small"
            disabled={busy}
            startIcon={<DoneAllRoundedIcon />}
            onClick={markAllRead}
            sx={{
              borderColor: PORTAL_TEAL,
              color: PORTAL_TEAL,
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              alignSelf: { xs: "stretch", sm: "center" },
            }}
          >
            Mark all read
          </Button>
        )}
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress size={34} sx={{ color: PORTAL_ACCENT }} />
        </Box>
      ) : total === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px dashed #d0dae3",
            textAlign: "center",
            bgcolor: "#fff",
          }}
        >
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 36, color: "#94a3b8", mb: 1 }} />
          <Typography sx={{ fontWeight: 700, color: PORTAL_TEAL }}>No notifications</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
            New support messages and admin broadcasts will appear here.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.25}>
          {chatItems.map((m) => (
            <Paper
              key={m._id}
              component="button"
              type="button"
              elevation={0}
              onClick={() => openChatMessage(m._id)}
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                textAlign: "left",
                width: "100%",
                p: 1.75,
                borderRadius: 2.5,
                border: "1px solid #dbe4ea",
                bgcolor: "#fff",
                cursor: "pointer",
                transition: "border-color .2s, transform .15s",
                "&:hover": { borderColor: PORTAL_ACCENT, transform: "translateY(-1px)" },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,107,71,.12)",
                  color: PORTAL_ACCENT,
                  flexShrink: 0,
                }}
              >
                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: PORTAL_TEAL }}>
                    Support message
                  </Typography>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PORTAL_ACCENT, mt: 0.7, flexShrink: 0 }} />
                </Stack>
                <Typography sx={{ mt: 0.35, fontSize: 13, color: "#334155", lineHeight: 1.4 }}>
                  {previewText(m.body)}
                </Typography>
                <Typography sx={{ mt: 0.6, fontSize: 11, color: "text.secondary" }}>
                  {formatPkt(m.createdAt)}
                </Typography>
              </Box>
            </Paper>
          ))}

          {broadcasts.map((b) => (
            <Paper
              key={b._id}
              component="button"
              type="button"
              elevation={0}
              onClick={() => openBroadcast(b)}
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                textAlign: "left",
                width: "100%",
                p: 1.75,
                borderRadius: 2.5,
                border: "1px solid #dbe4ea",
                bgcolor: "#fff",
                cursor: "pointer",
                transition: "border-color .2s, transform .15s",
                "&:hover": { borderColor: PORTAL_ACCENT, transform: "translateY(-1px)" },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(11,47,60,.08)",
                  color: PORTAL_TEAL,
                  flexShrink: 0,
                }}
              >
                <CampaignOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: PORTAL_TEAL }}>
                    Admin broadcast
                  </Typography>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PORTAL_ACCENT, mt: 0.7, flexShrink: 0 }} />
                </Stack>
                <Typography sx={{ mt: 0.35, fontSize: 13, color: "#334155", lineHeight: 1.4 }}>
                  {previewText(b.message)}
                </Typography>
                <Typography sx={{ mt: 0.6, fontSize: 11, color: "text.secondary" }}>
                  {formatPkt(b.createdAt)}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(activeBc)} onClose={() => setActiveBc(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: PORTAL_TEAL }}>Admin broadcast</DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {activeBc?.message}
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 12, color: "text.secondary" }}>
            {formatPkt(activeBc?.createdAt)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveBc(null)} sx={{ textTransform: "none", fontWeight: 700 }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setActiveBc(null);
              navigate("/dashboard/support", { state: { focus: "broadcasts" } });
            }}
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: PORTAL_TEAL }}
          >
            Open in Support
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
