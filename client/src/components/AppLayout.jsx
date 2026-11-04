import { lazy, Suspense, useEffect, useState, useRef, useCallback } from "react";
import { Badge, Container } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, onAuthSessionChangeEvent } from "../auth/session";
import { SiteFooter } from "./SiteFooter";
import { InstallPwaPrompt } from "./InstallPwaButton";
import { AppBottomNav } from "./AppBottomNav";
import { OfflineBanner } from "./OfflineBanner";
import { PwaUpdateToast } from "./PwaUpdateToast";
import { PullToRefresh } from "./PullToRefresh";
import { PushEnableCard } from "./PushEnableCard";
import { Navbar } from "./nav/Navbar";
import { MobileDrawer } from "./nav/MobileDrawer";
import { useStandaloneApp } from "../hooks/useStandaloneApp";
import { useAppBadge } from "../hooks/useAppBadge";
import {
  getUnseenBroadcasts,
  NOTIFS_CHANGED_EVENT,
} from "../notifications/broadcastSeen";

const FloatingChatWidget = lazy(() =>
  import("./FloatingChatWidget").then((m) => ({ default: m.FloatingChatWidget }))
);

export const AppLayout = ({ cartCount, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authUserFromStorage, setAuthUserFromStorage] = useState(getAuthUser());
  const [token, setToken] = useState(getAuthToken());
  const [chatUnreadNav, setChatUnreadNav] = useState(0);
  const [broadcastUnread, setBroadcastUnread] = useState(0);
  const [portalUnread, setPortalUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileAnnounceIdx, setMobileAnnounceIdx] = useState(0);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("marblex_theme") || "light";
  });

  const announcementRef = useRef(null);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navPillsRef = useRef(null);
  const actionsRef = useRef(null);
  const hasNavAnimatedRef = useRef(false);

  const mobileAnnouncements = [
    "⚡ MARBLEX — Construction Chemicals & Industrial Rubber",
    "🛡️ ISO Certified — Lab Tested & Trusted Performance",
    "🌿 15+ Years Proven Performance in Pakistan",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMobileAnnounceIdx((prev) => (prev + 1) % mobileAnnouncements.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [mobileAnnouncements.length]);

  let tokenPayload = null;

  if (token) {
    try {
      tokenPayload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      tokenPayload = null;
    }
  }

  const authUser = authUserFromStorage || (tokenPayload ? { role: tokenPayload.role } : null);
  const isUserLoggedIn = Boolean(authUser);
  const isCustomer = Boolean(authUser) && authUser?.role !== "admin";
  const isAdmin = authUser?.role === "admin";
  const displayFirstName = authUser?.name ? authUser.name.split(" ")[0] : "Client";
  const accountAvatarUrl = String(authUser?.avatarUrl || "").trim();
  const accountInitial = (displayFirstName || "M").charAt(0).toUpperCase();

  const syncPortalTheme = useCallback((theme) => {
    try {
      localStorage.setItem("mx_dash_theme", theme);
    } catch {
      /* ignore */
    }
    const frame = document.querySelector("iframe.mx-portal-frame");
    if (frame?.contentWindow) {
      try {
        frame.contentWindow.postMessage(
          { type: "MARBLEX_THEME", theme },
          window.location.origin
        );
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("marblex_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    syncPortalTheme(newTheme);
  };

  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    syncPortalTheme(themeMode);
  }, [themeMode, syncPortalTheme]);

  const logout = () => {
    clearAuthSession();
    setIsMenuOpen(false);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncAuth = () => {
      setAuthUserFromStorage(getAuthUser());
      setToken(getAuthToken());
    };

    window.addEventListener(onAuthSessionChangeEvent, syncAuth);
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => {
      window.removeEventListener(onAuthSessionChangeEvent, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [location.pathname]);

  useEffect(() => {
    const load = () => {
      const t = getAuthToken();
      const u = getAuthUser();
      if (!t || !u || (u.role !== "admin" && u.role !== "user" && u.role !== "subowner")) {
        setChatUnreadNav(0);
        setBroadcastUnread(0);
        return;
      }
      http
        .get("/chat/unread-count", authHeaders(t))
        .then((r) => setChatUnreadNav(Number(r.data?.count) || 0))
        .catch(() => { });

      if (u.role !== "admin") {
        http
          .get("/chat/broadcasts", authHeaders(t))
          .then((r) => {
            const items = Array.isArray(r.data) ? r.data : [];
            setBroadcastUnread(getUnseenBroadcasts(items).length);
          })
          .catch(() => setBroadcastUnread(0));
      } else {
        setBroadcastUnread(0);
      }
    };
    load();
    const id = setInterval(load, 20000);
    window.addEventListener(NOTIFS_CHANGED_EVENT, load);
    return () => {
      clearInterval(id);
      window.removeEventListener(NOTIFS_CHANGED_EVENT, load);
    };
  }, [location.pathname, authUserFromStorage, token]);

  // Client portal iframe pushes unread count for activity-feed notifications
  useEffect(() => {
    const onPortalNotify = (e) => {
      if (e?.origin && e.origin !== window.location.origin) return;
      if (e?.data?.type !== "MARBLEX_PORTAL_NOTIFY") return;
      const next = Number(e.data.unread) || 0;
      setPortalUnread((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("message", onPortalNotify);
    return () => window.removeEventListener("message", onPortalNotify);
  }, []);

  const openNotifications = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setIsMenuOpen(false);

    if (isAdmin) {
      navigate("/admin", { state: { chatUnread: chatUnreadNav, adminTab: 6 } });
      return;
    }

    navigate("/dashboard/notifications");
  };

  const showNavInstant = useCallback(() => {
    const targets = [
      announcementRef.current,
      headerRef.current,
      logoRef.current,
      ...(navPillsRef.current ? Array.from(navPillsRef.current.children) : []),
      ...(actionsRef.current ? Array.from(actionsRef.current.children) : []),
    ].filter(Boolean);

    if (!targets.length) return;
    gsap.set(targets, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: "none",
      clearProps: "filter",
    });
  }, []);

  const runNavEntrance = useCallback(() => {
    if (hasNavAnimatedRef.current) {
      showNavInstant();
      return;
    }
    hasNavAnimatedRef.current = true;
    try {
      sessionStorage.setItem("marblex_intro_done", "1");
    } catch {
      /* ignore */
    }
    window.__MARBLEX_INTRO_DONE__ = true;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        showNavInstant();
      },
    });

    if (announcementRef.current) {
      tl.fromTo(
        announcementRef.current,
        { y: -36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        0
      );
    }

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { y: -28, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.05, clearProps: "filter" },
        0.12
      );
    }

    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.88, x: -18 },
        { opacity: 1, scale: 1, x: 0, duration: 0.9, ease: "power4.out" },
        0.28
      );
    }

    if (navPillsRef.current) {
      tl.fromTo(
        navPillsRef.current.children,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.065 },
        0.35
      );
    }

    if (actionsRef.current) {
      tl.fromTo(
        actionsRef.current.children,
        { opacity: 0, scale: 0.9, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.065 },
        0.4
      );
    }
  }, [showNavInstant]);

  // Keep navbar hidden until MARBLEX splash finishes, then animate in.
  // Never re-hide after intro is done (Suspense remounts / Strict Mode used to blank the bar).
  useEffect(() => {
    const introDone =
      hasNavAnimatedRef.current ||
      window.__MARBLEX_INTRO_DONE__ === true ||
      (() => {
        try {
          if (sessionStorage.getItem("marblex_intro_done") === "1") return true;
          const ts = Number(localStorage.getItem("marblex_intro_ts") || 0);
          return ts > 0 && Date.now() - ts < 24 * 60 * 60 * 1000;
        } catch {
          return false;
        }
      })();

    if (introDone) {
      hasNavAnimatedRef.current = true;
      showNavInstant();
      return undefined;
    }

    if (announcementRef.current) gsap.set(announcementRef.current, { opacity: 0, y: -36 });
    if (headerRef.current) gsap.set(headerRef.current, { opacity: 0, y: -28, filter: "blur(10px)" });
    if (logoRef.current) gsap.set(logoRef.current, { opacity: 0 });
    if (navPillsRef.current) gsap.set(navPillsRef.current.children, { opacity: 0 });
    if (actionsRef.current) gsap.set(actionsRef.current.children, { opacity: 0 });

    let delayedCall = null;
    let cancelled = false;

    const handleIntroReveal = () => {
      if (cancelled || hasNavAnimatedRef.current) return;
      delayedCall = gsap.delayedCall(0.55, () => {
        if (!cancelled) runNavEntrance();
      });
    };

    window.addEventListener("marblex:intro_reveal", handleIntroReveal);

    // Fallback if splash event was missed (remount after reveal already fired)
    const safetyTimer = setTimeout(() => {
      if (!cancelled) runNavEntrance();
    }, 5800);

    return () => {
      cancelled = true;
      window.removeEventListener("marblex:intro_reveal", handleIntroReveal);
      clearTimeout(safetyTimer);
      if (delayedCall) delayedCall.kill();
      // If cleanup runs after intro already completed, leave navbar visible for next mount
      if (hasNavAnimatedRef.current || window.__MARBLEX_INTRO_DONE__) {
        showNavInstant();
      }
    };
  }, [runNavEntrance, showNavInstant]);

  // Force navbar entrance animation when directly landing without splash
  useEffect(() => {
    if (!hasNavAnimatedRef.current) {
      // Slight delay to allow layout to settle
      const timer = setTimeout(() => {
        runNavEntrance();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortalRoute = location.pathname.startsWith("/dashboard");
  // Clients: Azzan dropdown badge = portal activity-feed unread only (0 when all read)
  const notifCount = isAdmin
    ? chatUnreadNav
    : isPortalRoute || portalUnread > 0
      ? portalUnread
      : chatUnreadNav + broadcastUnread;

  const isDark = themeMode === "dark";
  const isApp = useStandaloneApp();
  useAppBadge((Number(cartCount) || 0) + (Number(notifCount) || 0));

  if (isAdminRoute) {
    return (
      <div className="min-h-screen w-full bg-[#f5f7fa] text-[#0f1929] flex flex-col selection:bg-[#ff6b4a] selection:text-white">
        <main className="flex-grow flex flex-col w-full">{children}</main>
      </div>
    );
  }

  // Installed app + client portal: one full-screen portal (no site header stacked on top)
  if (isApp && isPortalRoute) {
    return (
      <div
        className={`flex min-h-dvh flex-col portal-shell is-marblex-app ${
          isDark ? "bg-[#091b24] text-slate-100" : "bg-[#f5f7fa] text-[#0f1929]"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <PwaUpdateToast />
        <OfflineBanner />
        <div className="shrink-0 px-3 pt-2">
          <PushEnableCard isDark={isDark} />
        </div>
        <main className="page-content-portal relative z-10 flex min-h-0 w-full flex-1 flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </main>
        <AppBottomNav
          cartCount={cartCount}
          isLoggedIn={isUserLoggedIn}
          isAdmin={isAdmin}
          isDark={isDark}
          avatarUrl={accountAvatarUrl}
          avatarInitial={accountInitial}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col min-h-screen relative transition-colors duration-300 ${isDark ? "bg-[#091b24] text-slate-100" : "bg-[#f5f7fa] text-[#0f1929]"
      } ${isPortalRoute ? "portal-shell" : ""} ${isApp ? "is-marblex-app" : ""}`}
      style={undefined}
    >
      <PwaUpdateToast />
      <OfflineBanner />

      {/* 1. Top Brand Announcement & Trust Badges Header */}
      <div
        ref={announcementRef}
        className={`bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#082a38] text-white text-xs font-semibold z-50 border-b border-white/10 shadow-xs overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out ${
          isApp || scrolled
            ? "max-h-0 opacity-0 py-0 border-transparent pointer-events-none"
            : "max-h-12 opacity-100 py-1.5 md:py-2 px-3 sm:px-6 md:px-8"
        }`}
      >
        {/* Desktop View (md and up) */}
        <div className="hidden md:flex max-w-[1440px] mx-auto items-center justify-between gap-6 overflow-hidden">
          {/* Left: Brand Announcement */}
          <div className="flex items-center gap-2 text-slate-100 text-xs shrink min-w-0 truncate">
            <span className="text-[#ff8c73] text-sm font-bold shrink-0">⚡</span>
            <span className="text-white/30 font-normal shrink-0">|</span>
            <span className="tracking-wide truncate">
              MARBLEX — Premium Construction Chemical & Industrial Rubber Solutions
            </span>
          </div>

          {/* Right: Trust Badges */}
          <div className="flex items-center gap-5 text-[11px] shrink-0 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <ShieldOutlinedIcon sx={{ fontSize: 16, color: "#10b981" }} />
              <span className="font-bold text-white">ISO Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 16, color: "#10b981" }} />
              <span className="font-bold text-white">15+ Years Performance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SpaOutlinedIcon sx={{ fontSize: 16, color: "#10b981" }} />
              <span className="font-bold text-white">Sustainable Formulations</span>
            </div>
          </div>
        </div>

        {/* Mobile View: Single rotating announcement message */}
        <div className="md:hidden flex items-center justify-center text-[11px] text-center truncate">
          <span className="truncate tracking-tight font-medium text-slate-100">
            {mobileAnnouncements[mobileAnnounceIdx]}
          </span>
        </div>
      </div>

      {/* 2. Sleek Compact Main Navbar */}
      <Navbar
        cartCount={cartCount}
        authUser={authUser}
        isUserLoggedIn={isUserLoggedIn}
        isAdmin={isAdmin}
        isCustomer={isCustomer}
        notifCount={notifCount}
        onLogout={logout}
        openNotifications={openNotifications}
        isDark={isDark}
        toggleTheme={toggleTheme}
        isApp={isApp}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrolled={scrolled}
        logoRef={logoRef}
        navPillsRef={navPillsRef}
        actionsRef={actionsRef}
        headerRef={headerRef}
      />

      {/* 3. Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isDark={isDark}
        toggleTheme={toggleTheme}
        isApp={isApp}
        isUserLoggedIn={isUserLoggedIn}
      />

      {/* Main Content Area */}
      <PullToRefresh disabled={isPortalRoute}>
        <main
          className={`flex-grow flex flex-col relative z-10 w-full ${isPortalRoute ? "min-h-0" : ""} ${
            isApp ? "pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0" : ""
          }`}
        >
          {isPortalRoute ? (
            <div className="page-content-portal flex w-full min-h-0 flex-1 flex-col">{children}</div>
          ) : (
            <Container maxWidth={false} sx={{ py: { xs: 1.5, md: 2.5 }, px: { xs: 1.5, sm: 2, md: 4 } }} className="page-content">
              {children}
            </Container>
          )}
        </main>
      </PullToRefresh>

      {/* Store footer / floating widgets stay off the portal workspace */}
      {!isPortalRoute && <SiteFooter />}

      {/* Floating cart FAB — browser only; installed app uses bottom tab Cart */}
      {!isPortalRoute && isUserLoggedIn && !isApp && (
        <RouterLink
          to="/cart"
          aria-label="Cart"
          className={`sm:hidden fixed z-[9998] flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition active:scale-95 ${isCustomer ? "bottom-[5.25rem] right-5" : "bottom-5 right-6"
            } ${isDark
              ? "border-slate-600 bg-[#0e2735] text-[#ff8c73] shadow-black/40"
              : "border-slate-200 bg-white text-[#0a3d52] shadow-[#0a3d52]/20"
            }`}
        >
          <Badge
            badgeContent={cartCount}
            invisible={!cartCount || cartCount <= 0}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#ff6b4a",
                color: "white",
                fontWeight: 800,
                fontSize: "10px",
                height: "18px",
                minWidth: "18px",
              },
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 24 }} />
          </Badge>
        </RouterLink>
      )}

      {isApp && !isPortalRoute ? (
        <AppBottomNav
          cartCount={cartCount}
          isLoggedIn={isUserLoggedIn}
          isAdmin={isAdmin}
          isDark={isDark}
          avatarUrl={accountAvatarUrl}
          avatarInitial={accountInitial}
        />
      ) : null}

      <Suspense fallback={null}>
        <FloatingChatWidget />
      </Suspense>

      {/* Install toast — OUTSIDE header (GSAP transform se top pe nahi chipkega) */}
      {!isApp ? <InstallPwaPrompt /> : null}
    </div>
  );
};
