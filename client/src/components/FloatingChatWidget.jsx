import { useState, useEffect, useRef, useCallback } from "react";
import { Box, IconButton, Badge, Typography, Fade, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import { MarblexAiChat } from "./MarblexAiChat";
import { getAuthToken, getAuthUser } from "../auth/session";
import { authHeaders, http } from "../api/http";

const BOT_SRC = "/marblex-bot-peek.mp4";
const CYCLE_PAUSE_MS = 3800;
const FADE_MS = 720;
/** Brief hold after wave ends before fade-out */
const BOT_STAY_MS = 900;

function keyWhiteBackdrop(ctx, w, h) {
  const frame = ctx.getImageData(0, 0, w, h);
  const d = frame.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const isOrange = r > 180 && g < 140 && b < 120 && r > g + 40;
    if (isOrange) continue;
    const maxc = Math.max(r, g, b);
    const minc = Math.min(r, g, b);
    const sat = maxc - minc;
    if (minc > 228 && sat < 28) {
      d[i + 3] = 0;
    } else if (minc > 210 && sat < 18) {
      d[i + 3] = Math.min(d[i + 3], 40);
    }
  }
  ctx.putImageData(frame, 0, 0);
}

export const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showHey, setShowHey] = useState(false);
  const [botVisible, setBotVisible] = useState(false);
  const [botOpacity, setBotOpacity] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const cycleTimer = useRef(null);
  const fadeTimer = useRef(null);
  const stayTimer = useRef(null);

  const user = getAuthUser();
  const token = getAuthToken();
  const isAdmin = user?.role === "admin";
  const showLauncher = !isAdmin;
  const isLoggedInUser = Boolean(token && user && user.role !== "admin");

  useEffect(() => {
    if (!isLoggedInUser) return;
    const fetchUnread = () => {
      http
        .get("/chat/unread-count", authHeaders(token))
        .then((res) => setUnreadCount(Number(res.data?.count) || 0))
        .catch(() => {});
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, [token, isLoggedInUser]);

  useEffect(() => {
    if (!botVisible || isOpen) {
      cancelAnimationFrame(rafRef.current);
      return undefined;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return undefined;

    const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
    let frameHandle = 0;

    const paint = () => {
      if (video.readyState >= 2) {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(video, 0, 0, w, h);
        keyWhiteBackdrop(ctx, w, h);
      }
    };

    const tick = () => {
      paint();
      if (typeof video.requestVideoFrameCallback === "function") {
        frameHandle = video.requestVideoFrameCallback(tick);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (typeof video.cancelVideoFrameCallback === "function" && frameHandle) {
        video.cancelVideoFrameCallback(frameHandle);
      }
    };
  }, [botVisible, isOpen]);

  const playCycle = useCallback(() => {
    const v = videoRef.current;
    if (!v || isOpen) return;
    clearTimeout(cycleTimer.current);
    clearTimeout(fadeTimer.current);
    clearTimeout(stayTimer.current);
    v.playbackRate = 0.68;
    v.currentTime = 0;
    setBotVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setBotOpacity(1));
    });
    setShowHey(true);
    const p = v.play();
    if (p?.catch) p.catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!showLauncher || isOpen) return undefined;

    const v = videoRef.current;
    if (!v) return undefined;

    const onEnded = () => {
      // Stay visible a beat after the wave, then fade out smoothly
      stayTimer.current = window.setTimeout(() => {
        setBotOpacity(0);
        fadeTimer.current = window.setTimeout(() => {
          setShowHey(false);
          setBotVisible(false);
          cycleTimer.current = window.setTimeout(playCycle, CYCLE_PAUSE_MS);
        }, FADE_MS);
      }, BOT_STAY_MS);
    };

    v.addEventListener("ended", onEnded);
    cycleTimer.current = window.setTimeout(playCycle, 700);

    return () => {
      v.removeEventListener("ended", onEnded);
      clearTimeout(cycleTimer.current);
      clearTimeout(fadeTimer.current);
      clearTimeout(stayTimer.current);
    };
  }, [showLauncher, isOpen, playCycle]);

  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(cycleTimer.current);
    clearTimeout(fadeTimer.current);
    clearTimeout(stayTimer.current);
    videoRef.current?.pause();
    setBotOpacity(0);
    setShowHey(false);
    setBotVisible(false);
  }, [isOpen]);

  if (!showLauncher) return null;

  const toggleOpen = () => {
    setIsOpen((open) => {
      const next = !open;
      if (next) setUnreadCount(0);
      return next;
    });
  };

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <>
      {/* ── Chat panel: fixed to viewport (NOT tied to bot Y offset) ── */}
      <Fade in={isOpen} timeout={{ enter: 380, exit: 280 }}>
        <Box
          onClick={() => setIsOpen(false)}
          sx={{
            display: { xs: "block", sm: "none" },
            position: "fixed",
            inset: 0,
            zIndex: 10040,
            bgcolor: "rgba(9, 27, 36, 0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        />
      </Fade>

      <Slide direction="up" in={isOpen} timeout={{ enter: 420, exit: 320 }} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            zIndex: 10055,
            pointerEvents: "auto",
            // Always anchored to screen bottom-right — independent of bot position
            bottom: { xs: 12, sm: 24 },
            right: { xs: 12, sm: 24 },
            left: { xs: 12, sm: "auto" },
            width: { xs: "auto", sm: 400 },
            maxWidth: { xs: "calc(100vw - 24px)", sm: 400 },
            height: { xs: "min(78vh, 620px)", sm: 540 },
            maxHeight: { xs: "calc(100dvh - 72px)", sm: 540 },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: { xs: "22px", sm: "24px" },
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 24px 64px rgba(9,27,36,0.35), 0 0 0 1px rgba(10,61,82,0.08)",
              background: "linear-gradient(180deg, #0c222f 0%, #0a3d52 42%, #f4f7fa 42%)",
            }}
          >
            {/* Premium header */}
            <Box
              sx={{
                px: 2,
                pt: 1.75,
                pb: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                background:
                  "linear-gradient(135deg, #0a3d52 0%, #0d4e68 55%, #123a4a 100%)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.35, minWidth: 0 }}>
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                  <SupportAvatar size={42} />
                  <Box
                    sx={{
                      position: "absolute",
                      right: 1,
                      bottom: 1,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "#34d399",
                      border: "2px solid #0a3d52",
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#fff",
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Marblex AI Concierge
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.35 }}>
                    <CircleIcon sx={{ fontSize: 7, color: "#34d399" }} />
                    <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>
                      Online · Catalogs & products
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton
                size="small"
                className="no-shimmer"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                  width: 34,
                  height: 34,
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Body — remount on each open so welcome question always leads */}
            <Box
              sx={{
                flex: 1,
                overflow: "hidden",
                bgcolor: "#f1f5f9",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <MarblexAiChat key={isOpen ? "open" : "closed"} />
            </Box>
          </Box>
        </Box>
      </Slide>

      {/* ── Bot launcher (position independent of chat panel) ── */}
      <Box
        sx={{
          position: "fixed",
          top: {
            xs: "calc(46vh + 300px)",
            sm: "calc(44vh + 150px)",
            md: "calc(42vh + 350px)",
            lg: "calc(42vh + 350px)",
          },
          right: -40,
          zIndex: 10050,
          pointerEvents: "none",
          transform: "translateY(-50%)",
        }}
      >
        <Box
          component="button"
          type="button"
          className="no-shimmer"
          aria-label="Open Marblex AI chat"
          onClick={toggleOpen}
          sx={{
            pointerEvents: botVisible && !isOpen && botOpacity > 0.25 ? "auto" : "none",
            opacity: !isOpen ? botOpacity : 0,
            transform: !isOpen && botOpacity > 0.5 ? "translateX(0)" : "translateX(12px)",
            transition: `opacity ${FADE_MS}ms ${ease}, transform ${FADE_MS}ms ${ease}`,
            position: "relative",
            display: "block",
            border: "none",
            background: "transparent",
            p: 0,
            m: 0,
            cursor: "pointer",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            width: { xs: 118, sm: 140, md: 160 },
            height: { xs: 128, sm: 150, md: 170 },
            overflow: "visible",
            "&::before": { display: "none !important", content: '""', animation: "none !important" },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: { xs: 10, sm: 14 },
              left: { xs: -2, sm: 2 },
              zIndex: 3,
              opacity: showHey && !isOpen ? botOpacity : 0,
              transform:
                showHey && botOpacity > 0.45 ? "translateX(0) scale(1)" : "translateX(8px) scale(0.94)",
              transition: `opacity ${FADE_MS}ms ${ease}, transform ${FADE_MS}ms ${ease}`,
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                bgcolor: "#0a3d52",
                color: "#fff",
                px: 1.1,
                py: 0.4,
                borderRadius: "12px 12px 4px 12px",
                fontWeight: 800,
                fontSize: 11,
                boxShadow: "0 6px 14px rgba(10,61,82,0.28)",
                whiteSpace: "nowrap",
              }}
            >
              Hey!
            </Box>
          </Box>

          <Badge
            badgeContent={unreadCount}
            overlap="circular"
            sx={{
              width: "100%",
              height: "100%",
              display: "block",
              overflow: "hidden",
              "& .MuiBadge-badge": {
                fontWeight: 900,
                bgcolor: "#ff6b4a",
                top: 6,
                left: 6,
                right: "auto",
              },
            }}
          >
            <Box
              component="video"
              ref={videoRef}
              src={BOT_SRC}
              muted
              playsInline
              preload="auto"
              sx={{
                position: "absolute",
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: "none",
                left: 0,
                top: 0,
              }}
            />
            <Box
              component="canvas"
              ref={canvasRef}
              width={300}
              height={330}
              sx={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
                objectPosition: "right center",
                filter: "drop-shadow(-2px 4px 12px rgba(10,61,82,0.3))",
                pointerEvents: "none",
              }}
            />
          </Badge>
        </Box>
      </Box>
    </>
  );
};

function SupportAvatar({ size = 32, rounded = true }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: rounded ? "50%" : "20px",
        overflow: "hidden",
        border: "1.5px solid rgba(255,107,74,0.55)",
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
