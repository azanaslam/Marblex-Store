import { useState, useEffect } from "react";
import { Box, Fab, Zoom, Paper, IconButton, Badge, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { UserSupportChat } from "./UserSupportChat";
import { getAuthToken, getAuthUser } from "../auth/session";
import { authHeaders, http } from "../api/http";

export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = getAuthUser();
  const token = getAuthToken();

  // Only show for logged in customers (not admins, admins have their own dashboard)
  const isCustomer = user && user.role !== "admin";

  useEffect(() => {
    if (!token || !isCustomer) return;

    const fetchUnread = () => {
      http.get("/chat/unread-count", authHeaders(token))
        .then(res => setUnreadCount(Number(res.data?.count) || 0))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [token, isCustomer]);

  if (!isCustomer) return null;

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Chat Window */}
      <Zoom in={isOpen}>
        <Paper
          elevation={24}
          sx={{
            position: "absolute",
            bottom: 80,
            right: 0,
            width: { xs: "calc(100vw - 48px)", sm: 380 },
            height: { xs: "70vh", sm: 500 },
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Custom Header */}
          <Box sx={{ bgcolor: "secondary.main", color: "white", p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <SupportAgentIcon sx={{ color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>Marblex Support</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Typically replies in minutes</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflow: "hidden", bgcolor: "#f8fafc" }}>
            <UserSupportChat token={token} />
          </Box>
        </Paper>
      </Zoom>

      {/* Floating Button */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setUnreadCount(0);
          }}
          sx={{
            width: 64,
            height: 64,
            bgcolor: isOpen ? "secondary.main" : "primary.main",
            "&:hover": {
              bgcolor: isOpen ? "secondary.dark" : "primary.dark",
              transform: "scale(1.05) rotate(5deg)",
            },
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            boxShadow: "0 8px 24px rgba(227, 30, 36, 0.3)",
          }}
        >
          {isOpen ? <CloseIcon /> : (
            <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { fontWeight: 900, top: 2, right: 2 } }}>
              <ChatIcon sx={{ fontSize: 30 }} />
            </Badge>
          )}
        </Fab>
      </Zoom>
    </Box>
  );
};
