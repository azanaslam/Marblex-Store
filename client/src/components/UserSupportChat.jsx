import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import { authHeaders, http } from "../api/http";
import { getAuthUser } from "../auth/session";
import { ChatEmojiPickerButton } from "./chat/ChatEmojiPickerButton";
import { ChatMessageBubble } from "./chat/ChatMessageBubble";
import { useChatAutoScroll } from "../hooks/useChatAutoScroll";
import { getAuthedSocket } from "../realtime/socket";

const scrollSx = {
  flex: 1,
  overflow: "auto",
  p: { xs: 1.5, sm: 2.5 },
  minHeight: 280,
  bgcolor: "#e6e9f0",
  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.055) 1px, transparent 0)`,
  backgroundSize: "22px 22px",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(15, 23, 42, 0.15)",
    borderRadius: 3,
  },
};

export const UserSupportChat = ({ token, showToast }) => {
  const user = getAuthUser();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [reactingId, setReactingId] = useState(null);
  const { scrollContainerRef, bottomMarkerRef, onScroll, stickToBottomNext } = useChatAutoScroll(messages, loading);

  const headers = useMemo(() => authHeaders(token), [token]);

  const loadMessages = useCallback(async () => {
    const res = await http.get("/chat/messages", headers);
    setMessages(res.data || []);
    setLoading(false);
  }, [headers]);

  useEffect(() => {
    loadMessages().catch(() => {
      setLoading(false);
      showToast?.("error", "Could not load messages.");
    });
  }, [loadMessages, showToast]);

  useEffect(() => {
    const socket = getAuthedSocket(token);
    if (!socket) return;

    const mergeMessage = (msg) => {
      if (!msg?._id) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m._id === msg._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = msg;
          return next;
        }
        const next = [...prev, msg];
        next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return next;
      });
    };

    const onNewMessage = (msg) => mergeMessage(msg);
    const onMessageUpdated = (msg) => mergeMessage(msg);

    socket.on("new_message", onNewMessage);
    socket.on("message_updated", onMessageUpdated);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("message_updated", onMessageUpdated);
    };
  }, [token]);

  const send = async () => {
    if (!draft.trim()) return;
    try {
      stickToBottomNext();
      await http.post("/chat/messages", { body: draft.trim() }, headers);
      setDraft("");
      await loadMessages();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to send.";
      showToast?.("error", msg);
    }
  };

  const reactTo = async (messageId, emoji) => {
    setReactingId(messageId);
    try {
      await http.post(`/chat/messages/${messageId}/react`, { emoji }, headers);
      await loadMessages();
    } catch {
      showToast?.("error", "Could not update reaction.");
    } finally {
      setReactingId(null);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 460,
        boxShadow: "0 8px 40px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          p: 2.5,
          background: "linear-gradient(135deg, rgba(211, 47, 47, 0.09) 0%, #ffffff 45%, #fafafa 100%)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #c62828 0%, #e53935 55%, #ff7961 130%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(198, 40, 40, 0.35)",
          }}
        >
          <SupportAgentRoundedIcon sx={{ fontSize: 30 }} />
        </Box>
        <Box>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.12em", lineHeight: 1.2 }}>
            Marblex support
          </Typography>
          <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em">
            Chat with us
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.25 }}>
            Messages go to the store team. Replies show up here.
          </Typography>
        </Box>
      </Stack>

      <Box ref={scrollContainerRef} onScroll={onScroll} sx={scrollSx}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
          </Box>
        ) : (
          <Stack spacing={1.75}>
            {messages.map((m) => {
              const isStaff = m.sender?.role === "admin" || m.sender?.role === "subowner";
              const isMine = String(m.sender?._id) === String(user?.id);
              const outgoing = isMine && !isStaff;
              return (
                <ChatMessageBubble
                  key={m._id}
                  message={m}
                  currentUserId={user?.id}
                  variant={outgoing ? "outgoing" : "incoming"}
                  headerLabel={isStaff ? "Marblex Team" : "You"}
                  reactingId={reactingId}
                  onReact={reactTo}
                />
              );
            })}
            {!messages.length && (
              <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                <Typography color="text.secondary" variant="body1" fontWeight={600}>
                  No messages yet
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }} fontWeight={500}>
                  Say hello below — we typically reply soon.
                </Typography>
              </Box>
            )}
            <div ref={bottomMarkerRef} />
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          borderTop: "1px solid rgba(15, 23, 42, 0.06)",
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-end">
          <ChatEmojiPickerButton onPick={(emoji) => setDraft((d) => d + emoji)} />
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            multiline
            maxRows={4}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "#fff",
                fontWeight: 500,
                "&:hover fieldset": { borderColor: "primary.light" },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 3px rgba(211, 47, 47, 0.15)",
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={send}
            disabled={!draft.trim()}
            sx={{
              minWidth: 54,
              height: 54,
              borderRadius: 2.5,
              flexShrink: 0,
              boxShadow: draft.trim() ? "0 8px 24px rgba(211, 47, 47, 0.45)" : "none",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 10px 28px rgba(211, 47, 47, 0.5)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <SendRoundedIcon />
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};
