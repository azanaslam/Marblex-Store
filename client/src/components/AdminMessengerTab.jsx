import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { authHeaders, http } from "../api/http";
import { getAuthUser } from "../auth/session";
import { ChatEmojiPickerButton } from "./chat/ChatEmojiPickerButton";
import { ChatMessageBubble } from "./chat/ChatMessageBubble";
import { useChatAutoScroll } from "../hooks/useChatAutoScroll";
import { getAuthedSocket } from "../realtime/socket";

const threadListSx = {
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(15, 23, 42, 0.15)",
    borderRadius: 3,
  },
};

const chatScrollSx = {
  flex: 1,
  overflow: "auto",
  p: { xs: 1.5, sm: 2.5 },
  minHeight: 280,
  bgcolor: "#e6e9f0",
  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.055) 1px, transparent 0)`,
  backgroundSize: "22px 22px",
  ...threadListSx,
};

export const AdminMessengerTab = ({ token, showToast, initialUserId, onUserSelected }) => {
  const adminUser = getAuthUser();
  const [threads, setThreads] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reactingId, setReactingId] = useState(null);
  const { scrollContainerRef, bottomMarkerRef, onScroll, stickToBottomNext } = useChatAutoScroll(
    messages,
    loadingMessages
  );

  const headers = useMemo(() => authHeaders(token), [token]);

  const loadThreads = useCallback(async () => {
    const res = await http.get("/admin/chat/threads", headers);
    setThreads(res.data || []);
    setLoadingThreads(false);
  }, [headers]);

  const loadMessages = useCallback(
    async (userId) => {
      if (!userId) return;
      setLoadingMessages(true);
      const res = await http.get(`/admin/chat/thread/${userId}`, headers);
      setMessages(res.data || []);
      setLoadingMessages(false);
    },
    [headers]
  );

  useEffect(() => {
    loadThreads().catch(() => {
      setLoadingThreads(false);
      showToast?.("error", "Could not load chat threads.");
    });
  }, [loadThreads, showToast]);

  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);

  const loadUserDetails = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await http.get(`/admin/users/${userId}`, headers);
      setSelectedUserDetails(res.data);
    } catch (err) {
      console.error("Failed to load user details", err);
    }
  }, [headers]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      const thread = threads.find((t) => t.userId === selectedUserId);
      if (thread) {
        setSelectedUserDetails(thread.user);
      } else {
        loadUserDetails(selectedUserId);
      }
    }
  }, [selectedUserId, loadMessages, threads, loadUserDetails]);

  useEffect(() => {
    if (selectedUserId) stickToBottomNext();
  }, [selectedUserId, stickToBottomNext]);

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

    const maybeMergeSelectedThread = (msg) => {
      if (!selectedUserId) return;
      const sid = String(msg?.sender?._id || msg?.sender);
      const rid = String(msg?.recipient?._id || msg?.recipient);
      if (sid === String(selectedUserId) || rid === String(selectedUserId)) {
        mergeMessage(msg);
      }
    };

    const onNewMessage = (msg) => {
      loadThreads().catch(() => {});
      maybeMergeSelectedThread(msg);
    };
    const onMessageUpdated = (msg) => {
      loadThreads().catch(() => {});
      maybeMergeSelectedThread(msg);
    };

    socket.on("new_message", onNewMessage);
    socket.on("message_updated", onMessageUpdated);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("message_updated", onMessageUpdated);
    };
  }, [token, selectedUserId, loadThreads]);

  const sendReply = async () => {
    if (!selectedUserId || !draft.trim()) return;
    try {
      stickToBottomNext();
      await http.post(`/admin/chat/thread/${selectedUserId}`, { body: draft.trim() }, headers);
      setDraft("");
      await loadMessages(selectedUserId);
      await loadThreads();
      showToast?.("success", "Message sent.");
    } catch {
      showToast?.("error", "Failed to send message.");
    }
  };

  const reactTo = async (messageId, emoji) => {
    setReactingId(messageId);
    try {
      await http.post(`/chat/messages/${messageId}/react`, { emoji }, headers);
      if (selectedUserId) await loadMessages(selectedUserId);
      await loadThreads();
    } catch {
      showToast?.("error", "Could not update reaction.");
    } finally {
      setReactingId(null);
    }
  };

  const selectedThread = threads.find((t) => t.userId === selectedUserId);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #c62828 0%, #e53935 50%, #ff6b6b 140%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(198, 40, 40, 0.35)",
          }}
        >
          <ChatRoundedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.14em", lineHeight: 1.2 }}>
            Support inbox
          </Typography>
          <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, maxWidth: 520 }}>
            Reply to customers in real time — polished chat experience.
          </Typography>
        </Box>
      </Stack>

      <GridLikeMessenger>
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", md: 336 },
            flexShrink: 0,
            borderRadius: 3,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            maxHeight: { md: 580 },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            boxShadow: "0 4px 28px rgba(15, 23, 42, 0.07), 0 1px 3px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 2,
              background: "linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, transparent 55%)",
              borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={900} letterSpacing="-0.01em">
              Conversations
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {threads.length} thread{threads.length === 1 ? "" : "s"}
            </Typography>
          </Box>
          <Box sx={{ overflow: "auto", flex: 1, py: 1, ...threadListSx }}>
            {loadingThreads ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
              </Box>
            ) : (
              <Stack spacing={0.5} sx={{ px: 1, pb: 1 }}>
                {!threads.length && (
                  <Typography color="text.secondary" sx={{ px: 1.5, py: 4, textAlign: "center" }} variant="body2" fontWeight={500}>
                    No messages yet. Customers can write from their dashboard (Support chat).
                  </Typography>
                )}
                {threads.map((th) => {
                  const selected = selectedUserId === th.userId;
                  return (
                    <Box
                      key={th.userId}
                      onClick={() => {
                        setSelectedUserId(th.userId);
                        onUserSelected?.(th.userId);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.25,
                        p: 1.5,
                        borderRadius: 2.5,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: "1px solid transparent",
                        bgcolor: selected ? "rgba(211, 47, 47, 0.1)" : "transparent",
                        borderLeft: selected ? "4px solid" : "4px solid transparent",
                        borderLeftColor: selected ? "primary.main" : "transparent",
                        boxShadow: selected ? "0 4px 16px rgba(211, 47, 47, 0.12)" : "none",
                        "&:hover": {
                          bgcolor: selected ? "rgba(211, 47, 47, 0.12)" : "rgba(15, 23, 42, 0.04)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Badge
                        badgeContent={th.unreadCount > 99 ? "99+" : th.unreadCount}
                        color="error"
                        invisible={!th.unreadCount}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontWeight: 800,
                            fontSize: "0.65rem",
                            minWidth: 18,
                            height: 18,
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 46,
                            height: 46,
                            fontWeight: 800,
                            fontSize: "1rem",
                            background: "linear-gradient(145deg, #1e293b 0%, #475569 100%)",
                            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
                            border: "2px solid #fff",
                          }}
                        >
                          {(th.user?.name || "U").charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight={800} fontSize="0.95rem" letterSpacing="-0.01em" noWrap>
                          {th.user?.name || "User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block" fontWeight={500}>
                          {th.lastMessage?.body || "—"}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            borderRadius: 3,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
            maxHeight: { md: 580 },
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(15, 23, 42, 0.09), 0 2px 8px rgba(15, 23, 42, 0.04)",
            background: "#fff",
          }}
        >
          {!selectedUserId ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                textAlign: "center",
                background: "linear-gradient(180deg, #fafbfc 0%, #fff 100%)",
              }}
            >
              <ChatRoundedIcon sx={{ fontSize: 56, color: "grey.300", mb: 2 }} />
              <Typography fontWeight={800} color="text.primary" gutterBottom>
                Select a conversation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }} fontWeight={500}>
                Choose a customer on the left to view messages and reply.
              </Typography>
            </Box>
          ) : (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  px: 2.5,
                  py: 2,
                  background: "linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.94) 100%)",
                  borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
                }}
              >
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    fontWeight: 900,
                    fontSize: "1.15rem",
                    bgcolor: "primary.main",
                    boxShadow: "0 6px 20px rgba(211, 47, 47, 0.4)",
                    border: "3px solid #fff",
                  }}
                >
                  {(selectedUserDetails?.name || "U").charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} fontSize="1.1rem" letterSpacing="-0.02em" noWrap>
                    {selectedUserDetails?.name || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap fontWeight={500}>
                    {selectedUserDetails?.email || "No email provided"}
                  </Typography>
                </Box>
              </Stack>

              <Box ref={scrollContainerRef} onScroll={onScroll} sx={chatScrollSx}>
                {loadingMessages ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={36} thickness={4} />
                  </Box>
                ) : (
                  <Stack spacing={1.75}>
                    {messages.map((m) => {
                      const isStaff = m.sender?.role === "admin" || m.sender?.role === "subowner";
                      return (
                        <ChatMessageBubble
                          key={m._id}
                          message={m}
                          currentUserId={adminUser?.id}
                          variant={isStaff ? "outgoing" : "incoming"}
                          headerLabel={isStaff ? "You (Staff)" : m.sender?.name || "User"}
                          reactingId={reactingId}
                          onReact={reactTo}
                        />
                      );
                    })}
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
                        sendReply();
                      }
                    }}
                    multiline
                    maxRows={4}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "#fff",
                        fontWeight: 500,
                        transition: "box-shadow 0.2s ease",
                        "&:hover fieldset": { borderColor: "primary.light" },
                        "&.Mui-focused": {
                          boxShadow: "0 0 0 3px rgba(211, 47, 47, 0.15)",
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={sendReply}
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
            </>
          )}
        </Paper>
      </GridLikeMessenger>
    </Stack>
  );
};

function GridLikeMessenger({ children }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2.5}
      sx={{ alignItems: { xs: "stretch", md: "stretch" } }}
    >
      {children}
    </Stack>
  );
}
