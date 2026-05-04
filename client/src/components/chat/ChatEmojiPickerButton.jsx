import { useState } from "react";
import { Box, IconButton, Popover, Tab, Tabs, Typography } from "@mui/material";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import { EMOJI_CATEGORIES } from "../../chat/chatEmojiData";

/** Grid used in composer and in message reaction “more” menu */
export const EmojiPickerPanel = ({ onPick }) => {
  const [cat, setCat] = useState(0);

  return (
    <>
      <Tabs
        value={cat}
        onChange={(_, v) => setCat(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 44,
          px: 0.5,
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          bgcolor: "grey.50",
          "& .MuiTab-root": {
            minHeight: 44,
            py: 0,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "none",
            color: "text.secondary",
            "&.Mui-selected": { color: "primary.main" },
          },
          "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
        }}
      >
        {EMOJI_CATEGORIES.map((c) => (
          <Tab key={c.key} label={c.label} />
        ))}
      </Tabs>
      <Box sx={{ p: 1.25, maxHeight: 268, overflow: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 0.35,
          }}
        >
          {EMOJI_CATEGORIES[cat]?.emojis.map((emoji) => (
            <IconButton
              key={`${EMOJI_CATEGORIES[cat].key}-${emoji}`}
              size="small"
              onClick={() => onPick?.(emoji)}
              sx={{
                fontSize: "1.35rem",
                borderRadius: 2,
                aspectRatio: "1",
                transition: "transform 0.12s ease, background-color 0.12s",
                "&:hover": {
                  bgcolor: "rgba(211, 47, 47, 0.12)",
                  transform: "scale(1.12)",
                },
              }}
            >
              <Typography component="span" sx={{ fontSize: "inherit", lineHeight: 1 }}>
                {emoji}
              </Typography>
            </IconButton>
          ))}
        </Box>
      </Box>
    </>
  );
};

/**
 * Opens a WhatsApp-style emoji grid; calls onPick(emoji) for composer insert.
 */
export const ChatEmojiPickerButton = ({ onPick, size = "medium" }) => {
  const [anchor, setAnchor] = useState(null);

  const open = Boolean(anchor);
  const pick = (emoji) => {
    onPick?.(emoji);
    setAnchor(null);
  };

  return (
    <>
      <IconButton
        size={size}
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label="Insert emoji"
        sx={{
          flexShrink: 0,
          width: 44,
          height: 44,
          bgcolor: "grey.100",
          border: "1px solid rgba(15, 23, 42, 0.06)",
          color: "primary.main",
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "primary.main",
            color: "#fff",
            borderColor: "primary.main",
            transform: "scale(1.05)",
            boxShadow: "0 6px 16px rgba(211, 47, 47, 0.35)",
          },
        }}
      >
        <EmojiEmotionsOutlinedIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: 328,
              maxHeight: 360,
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.14), 0 8px 20px rgba(15, 23, 42, 0.08)",
            },
          },
        }}
      >
        <EmojiPickerPanel onPick={pick} />
      </Popover>
    </>
  );
};
