import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Link as RouterLink } from "react-router-dom";
import {
  WELCOME_QUESTION,
  SUGGESTIONS,
  answerMarblexAi,
} from "../chat/marblexAiKnowledge";

const BOT_SRC = "/marblex-bot-peek.mp4";
const CHAT_STORAGE_KEY = "mx_ai_chat_v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function welcomeMessage() {
  return {
    id: uid(),
    role: "ai",
    text: WELCOME_QUESTION,
    links: [
      { label: "View catalogs", href: "/catalogs" },
      { label: "Browse shop", href: "/shop" },
    ],
  };
}

function loadSavedMessages() {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [welcomeMessage()];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return [welcomeMessage()];
    return parsed;
  } catch {
    return [welcomeMessage()];
  }
}

export function MarblexAiChat() {
  const [messages, setMessages] = useState(loadSavedMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore quota / private mode */
    }
  }, [messages]);

  const pushUserAndReply = (text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed || typing) return;

    setMessages((prev) => [...prev, { id: uid(), role: "user", text: trimmed }]);
    setDraft("");
    setTyping(true);

    const delay = 480 + Math.min(900, trimmed.length * 18);
    window.setTimeout(() => {
      const reply = answerMarblexAi(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "ai",
          text: reply.text,
          links: reply.links || [],
        },
      ]);
      setTyping(false);
    }, delay);
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background:
          "linear-gradient(165deg, #f7fafc 0%, #eef4f7 38%, #e8f0f4 72%, #f3f6f8 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 8% -10%, rgba(10,61,82,0.09), transparent 55%),
            radial-gradient(ellipse 70% 45% at 100% 12%, rgba(255,107,74,0.08), transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(10,61,82,0.05), transparent 55%),
            linear-gradient(125deg, transparent 0%, rgba(255,255,255,0.45) 42%, transparent 68%)
          `,
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.35,
          backgroundImage: `
            repeating-linear-gradient(
              -18deg,
              transparent 0px,
              transparent 11px,
              rgba(10,61,82,0.025) 11px,
              rgba(10,61,82,0.025) 12px
            )
          `,
          zIndex: 0,
        },
      }}
    >
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflow: "auto",
          px: { xs: 1.25, sm: 1.75 },
          py: { xs: 1.15, sm: 1.75 },
          minHeight: 0,
          position: "relative",
          zIndex: 1,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(10,61,82,0.2)",
            borderRadius: 3,
          },
        }}
      >
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}

        {typing && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, pl: 0.5 }}>
            <AiAvatar size={28} />
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: "14px 14px 14px 4px",
                bgcolor: "#fff",
                border: "1px solid rgba(10,61,82,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={12} thickness={5} sx={{ color: "#0a3d52" }} />
              <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                Thinking…
              </Typography>
            </Box>
          </Box>
        )}
        <div ref={endRef} />
      </Box>

      {/* Suggestion chips — compact on mobile (2 chips), fuller on desktop */}
      {messages.length <= 2 && !typing && (
        <Box
          sx={{
            px: { xs: 1.15, sm: 1.5 },
            pb: { xs: 0.65, sm: 1 },
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 0.55, sm: 0.75 },
            position: "relative",
            zIndex: 1,
            maxHeight: { xs: 72, sm: "none" },
            overflow: "hidden",
          }}
        >
          {SUGGESTIONS.map((s, i) => (
            <Box
              key={s}
              component="button"
              type="button"
              className="no-shimmer"
              onClick={() => pushUserAndReply(s)}
              sx={{
                display: i >= 2 ? { xs: "none", sm: "inline-flex" } : "inline-flex",
                border: "1px solid rgba(10,61,82,0.14)",
                bgcolor: "rgba(255,255,255,0.92)",
                color: "#0a3d52",
                fontSize: { xs: 10.5, sm: 11 },
                fontWeight: 700,
                px: { xs: 1, sm: 1.25 },
                py: { xs: 0.5, sm: 0.65 },
                borderRadius: 999,
                cursor: "pointer",
                textAlign: "left",
                lineHeight: 1.25,
                transition: "background 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  bgcolor: "#fff",
                  borderColor: "rgba(255,107,74,0.45)",
                },
                "&::before": { display: "none !important" },
              }}
            >
              {s}
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          px: { xs: 1.15, sm: 1.5 },
          py: { xs: 0.9, sm: 1.25 },
          borderTop: "1px solid rgba(10,61,82,0.1)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(248,251,252,0.96) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0.85,
            borderRadius: { xs: 2.75, sm: 3.5 },
            border: "1px solid rgba(10,61,82,0.12)",
            bgcolor: "#fff",
            px: { xs: 1, sm: 1.25 },
            py: { xs: 0.45, sm: 0.65 },
            boxShadow: "0 4px 16px rgba(10,61,82,0.06)",
          }}
        >
          <Box
            component="textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                pushUserAndReply(draft);
              }
            }}
            placeholder="Ask about products, catalogs…"
            rows={1}
            sx={{
              flex: 1,
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              fontSize: { xs: 13, sm: 13.5 },
              fontWeight: 500,
              color: "#0f172a",
              lineHeight: 1.45,
              py: { xs: 0.65, sm: 0.85 },
              maxHeight: { xs: 64, sm: 88 },
              bgcolor: "transparent",
              "&::placeholder": { color: "#94a3b8" },
            }}
          />
          <IconButton
            className="no-shimmer"
            onClick={() => pushUserAndReply(draft)}
            disabled={!draft.trim() || typing}
            aria-label="Send"
            sx={{
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              bgcolor: draft.trim() ? "#ff6b4a" : "rgba(10,61,82,0.08)",
              color: draft.trim() ? "#fff" : "#94a3b8",
              "&:hover": {
                bgcolor: draft.trim() ? "#f05a3a" : "rgba(10,61,82,0.12)",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(10,61,82,0.06)",
                color: "#cbd5e1",
              },
              mb: 0.1,
            }}
          >
            <SendRoundedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        </Box>
        <Typography
          sx={{
            mt: { xs: 0.45, sm: 0.75 },
            fontSize: { xs: 9, sm: 10 },
            color: "#94a3b8",
            fontWeight: 600,
            textAlign: "center",
            letterSpacing: "0.02em",
            display: { xs: "none", sm: "block" },
          }}
        >
          No login needed · Catalog & product guidance
        </Typography>
      </Box>
    </Box>
  );
}

function MessageRow({ message }) {
  const isAi = message.role === "ai";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isAi ? "flex-start" : "flex-end",
        alignItems: "flex-end",
        gap: 0.85,
        mb: 1.5,
      }}
    >
      {isAi && <AiAvatar size={28} />}
      <Box sx={{ maxWidth: "82%" }}>
        <Box
          sx={{
            px: 1.6,
            py: 1.15,
            borderRadius: isAi ? "16px 16px 16px 5px" : "16px 16px 5px 16px",
            bgcolor: isAi ? "#fff" : "#0a3d52",
            color: isAi ? "#0f172a" : "#fff",
            border: isAi ? "1px solid rgba(10,61,82,0.08)" : "none",
            boxShadow: isAi
              ? "0 6px 18px rgba(10,61,82,0.07)"
              : "0 8px 20px rgba(10,61,82,0.22)",
          }}
        >
          {isAi && (
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#ff6b4a",
                mb: 0.45,
              }}
            >
              Marblex AI
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 560,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              letterSpacing: "-0.01em",
            }}
          >
            {message.text}
          </Typography>
        </Box>
        {isAi && message.links?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.65, mt: 0.75 }}>
            {message.links.map((link) => (
              <Box
                key={`${link.href}-${link.label}`}
                component={RouterLink}
                to={link.href}
                sx={{
                  fontSize: 11,
                  fontWeight: 750,
                  color: "#0a3d52",
                  textDecoration: "none",
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 999,
                  bgcolor: "rgba(10,61,82,0.06)",
                  border: "1px solid rgba(10,61,82,0.12)",
                  "&:hover": {
                    bgcolor: "rgba(255,107,74,0.1)",
                    borderColor: "rgba(255,107,74,0.35)",
                  },
                }}
              >
                {link.label} →
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function AiAvatar({ size = 28 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        border: "1.5px solid rgba(255,107,74,0.5)",
        bgcolor: "#fff",
      }}
    >
      <Box
        component="video"
        src={BOT_SRC}
        muted
        playsInline
        sx={{
          width: "140%",
          height: "140%",
          objectFit: "cover",
          ml: "-20%",
          mt: "-10%",
        }}
      />
    </Box>
  );
}
