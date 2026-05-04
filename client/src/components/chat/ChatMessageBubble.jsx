import { useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import { QUICK_REACTION_EMOJIS } from "../../chat/chatEmojiData";
import { EmojiPickerPanel } from "./ChatEmojiPickerButton";

function groupReactions(reactions) {
  if (!Array.isArray(reactions) || !reactions.length) return [];
  const map = new Map();
  for (const r of reactions) {
    const e = r.emoji;
    if (!map.has(e)) map.set(e, { emoji: e, count: 0, userIds: new Set() });
    const g = map.get(e);
    g.count += 1;
    const id = r.user?._id != null ? String(r.user._id) : String(r.user);
    g.userIds.add(id);
  }
  return [...map.values()];
}

/**
 * @param {"outgoing" | "incoming"} variant — outgoing = your message (gradient), incoming = other party (glass card)
 */
export const ChatMessageBubble = ({
  message,
  currentUserId,
  variant = "incoming",
  headerLabel,
  onReact,
  reactingId,
  sx: sxExtra = {},
}) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [hover, setHover] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const alignRight = variant === "outgoing";
  const uid = currentUserId != null ? String(currentUserId) : "";
  const groups = groupReactions(message.reactions);
  const busy = reactingId === message._id;

  const sendReact = (emoji) => {
    onReact?.(message._id, emoji);
    setMenuAnchor(null);
  };

  const showTopQuick = isMdUp && hover && !menuAnchor;

  const primary = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark;

  const bubbleShell =
    variant === "outgoing"
      ? {
          background: `linear-gradient(152deg, ${primaryDark} 0%, ${primary} 48%, ${theme.palette.primary.light} 160%)`,
          color: "#fff",
          border: "none",
          borderRadius: "20px 20px 6px 20px",
          boxShadow: `0 6px 22px ${primary}55, 0 2px 8px rgba(15, 23, 42, 0.12)`,
        }
      : {
          background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.98) 100%)",
          color: "text.primary",
          border: "1px solid rgba(15, 23, 42, 0.07)",
          borderRadius: "20px 20px 20px 6px",
          boxShadow: "0 8px 28px rgba(15, 23, 42, 0.07), 0 2px 8px rgba(15, 23, 42, 0.04)",
        };

  const reactBtnSx =
    variant === "outgoing"
      ? {
          bgcolor: "rgba(255,255,255,0.22)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.35)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.32)" },
        }
      : {
          bgcolor: "#fff",
          color: "text.secondary",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
          "&:hover": { bgcolor: "#fafafa", color: "primary.main" },
        };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: alignRight ? "flex-end" : "flex-start",
        position: "relative",
        alignItems: "flex-end",
        gap: 0.5,
        py: 0.25,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {showTopQuick && (
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            top: -42,
            ...(alignRight ? { right: 4 } : { left: 4 }),
            display: "flex",
            alignItems: "center",
            gap: 0.15,
            px: 1,
            py: 0.35,
            borderRadius: 999,
            zIndex: 2,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.12)",
          }}
        >
          {QUICK_REACTION_EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              disabled={busy}
              onClick={() => sendReact(emoji)}
              sx={{
                fontSize: "1.2rem",
                p: 0.4,
                transition: "transform 0.15s ease",
                "&:hover": { transform: "scale(1.15)", bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              <span>{emoji}</span>
            </IconButton>
          ))}
          <IconButton
            size="small"
            disabled={busy}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label="More reactions"
            sx={{ p: 0.4, color: "text.secondary" }}
          >
            <AddReactionOutlinedIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      <Box sx={{ maxWidth: { xs: "92%", sm: "82%" }, minWidth: 0, position: "relative" }}>
        <Box
          sx={{
            ...bubbleShell,
            position: "relative",
            px: 2,
            pt: 1.25,
            pb: 3.25,
            pr: alignRight ? 2.25 : 2.5,
            pl: alignRight ? 2.5 : 2.25,
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            ...sxExtra,
            ...(hover && variant === "outgoing" ? { boxShadow: `0 10px 30px ${primary}66` } : {}),
            ...(hover && variant === "incoming"
              ? { boxShadow: "0 12px 36px rgba(15, 23, 42, 0.11)" }
              : {}),
          }}
        >
          <Typography
            variant="caption"
            fontWeight={800}
            display="block"
            sx={{
              mb: 0.35,
              opacity: variant === "outgoing" ? 0.92 : 0.75,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: "0.65rem",
            }}
          >
            {headerLabel}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.55,
              fontSize: "0.9375rem",
              fontWeight: 500,
            }}
          >
            {message.body}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              opacity: variant === "outgoing" ? 0.8 : 0.55,
              fontSize: "0.68rem",
              fontWeight: 500,
            }}
          >
            {new Date(message.createdAt).toLocaleString()}
          </Typography>

          <IconButton
            size="small"
            disabled={busy}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label="React to message"
            sx={{
              position: "absolute",
              bottom: 6,
              ...(alignRight ? { left: 6 } : { right: 6 }),
              p: 0.35,
              opacity: hover || menuAnchor ? 1 : 0.5,
              ...reactBtnSx,
            }}
          >
            <AddReactionOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Popover
          open={Boolean(menuAnchor)}
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          slotProps={{
            paper: {
              sx: {
                width: 320,
                maxHeight: 400,
                overflow: "hidden",
                borderRadius: 3,
                border: "1px solid rgba(15, 23, 42, 0.08)",
                boxShadow: "0 24px 48px rgba(15, 23, 42, 0.15), 0 8px 16px rgba(15, 23, 42, 0.08)",
              },
            },
          }}
        >
          <Box
            sx={{
              p: 1.25,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
              bgcolor: "grey.50",
            }}
          >
            {QUICK_REACTION_EMOJIS.map((emoji) => (
              <IconButton
                key={emoji}
                size="small"
                disabled={busy}
                onClick={() => sendReact(emoji)}
                sx={{ fontSize: "1.35rem", "&:hover": { bgcolor: "rgba(0,0,0,0.05)", transform: "scale(1.1)" } }}
              >
                <span>{emoji}</span>
              </IconButton>
            ))}
          </Box>
          <EmojiPickerPanel onPick={(e) => sendReact(e)} />
        </Popover>

        {groups.length > 0 && (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={0.75}
            sx={{ mt: 0.75, justifyContent: alignRight ? "flex-end" : "flex-start" }}
          >
            {groups.map((g) => {
              const mine = g.userIds.has(uid);
              return (
                <Chip
                  key={g.emoji}
                  size="small"
                  label={`${g.emoji} ${g.count}`}
                  onClick={() => !busy && onReact?.(message._id, g.emoji)}
                  variant={mine ? "filled" : "outlined"}
                  color={mine ? "primary" : "default"}
                  sx={{
                    height: 28,
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: mine ? undefined : "rgba(255,255,255,0.95)",
                    borderColor: "rgba(15, 23, 42, 0.1)",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
                    "& .MuiChip-label": { px: 1, fontSize: 13 },
                    cursor: busy ? "default" : "pointer",
                    transition: "transform 0.12s ease",
                    "&:hover": { transform: busy ? "none" : "scale(1.03)" },
                  }}
                />
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
