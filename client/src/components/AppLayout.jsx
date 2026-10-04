import { lazy, Suspense, useEffect, useState, useRef, useCallback } from "react";
import { Badge, Container } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, onAuthSessionChangeEvent } from "../auth/session";
import { SiteFooter } from "./SiteFooter";
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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("marblex_theme") || "light";
  });

  const announcementRef = useRef(null);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navPillsRef = useRef(null);
  const actionsRef = useRef(null);
  const mobileMenuPanelRef = useRef(null);
  const mobileMenuItemsRef = useRef(null);
  const accountMenuRef = useRef(null);
  const hasNavAnimatedRef = useRef(false);

  let tokenPayload = null;
  const isHomePage = location.pathname === "/";

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
  const AccountAvatar = ({ className = "" }) => (
    <span
      className={`relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0a3d52] to-[#ff6b4a] font-extrabold text-white shadow-sm ${className}`}
    >
      {accountAvatarUrl ? (
        <img src={accountAvatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        accountInitial
      )}
    </span>
  );

  const syncPortalTheme = useCallback((theme) => {
    try {
      localStorage.setItem("mx_dash_theme", theme);
    } catch {}
    const frame = document.querySelector("iframe.mx-portal-frame");
    if (frame?.contentWindow) {
      try {
        frame.contentWindow.postMessage(
          { type: "MARBLEX_THEME", theme },
          window.location.origin
        );
      } catch {}
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
    setAccountMenuOpen(false);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onDocClick = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || !mobileMenuItemsRef.current) return;
    const items = mobileMenuItemsRef.current.querySelectorAll("[data-mobile-nav-item]");
    const footer = mobileMenuItemsRef.current.querySelectorAll("[data-mobile-nav-footer]");
    gsap.fromTo(
      items,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.28, stagger: 0.035, ease: "power2.out" }
    );
    if (footer.length) {
      gsap.fromTo(footer, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.12, ease: "power2.out" });
    }
  }, [isMenuOpen]);

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
        .catch(() => {});

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
    setAccountMenuOpen(false);
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
    } catch {}
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
        { y: 0, opacity: 1, duration: 0.65 },
        0
      );
    }

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { y: -28, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.85, clearProps: "filter" },
        0.12
      );
    }

    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.88, x: -18 },
        { opacity: 1, scale: 1, x: 0, duration: 0.7 },
        0.28
      );
    }

    if (navPillsRef.current) {
      tl.fromTo(
        navPillsRef.current.children,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.045 },
        0.35
      );
    }

    if (actionsRef.current) {
      tl.fromTo(
        actionsRef.current.children,
        { opacity: 0, scale: 0.9, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.05 },
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
          return sessionStorage.getItem("marblex_intro_done") === "1";
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
    }, 4200);

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

  const navLinks = [
    { label: "Home", path: "/", icon: HomeOutlinedIcon, desc: "Products & industrial catalog" },
    { label: "About Us", path: "/about", icon: InfoOutlinedIcon, desc: "Company legacy & mission" },
    { label: "Services", path: "/services", icon: ConstructionOutlinedIcon, desc: "Site systems & applications" },
    { label: "Contact", path: "/contact", icon: EmailOutlinedIcon, desc: "Engineering desk & support" },
    { label: "Blogs", path: "/blogs", icon: ArticleOutlinedIcon, desc: "Field guides & insights" },
    { label: "Catalogs", path: "/catalogs", icon: MenuBookOutlinedIcon, desc: "TDS packs & brochures" },
  ];

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortalRoute = location.pathname.startsWith("/dashboard");
  // Clients: Azzan dropdown badge = portal activity-feed unread only (0 when all read)
  const notifCount = isAdmin
    ? chatUnreadNav
    : isPortalRoute || portalUnread > 0
      ? portalUnread
      : chatUnreadNav + broadcastUnread;

  if (isAdminRoute) {
    return (
      <div className="min-h-screen w-full bg-[#f5f7fa] text-[#0f1929] flex flex-col selection:bg-[#ff6b4a] selection:text-white">
        <main className="flex-grow flex flex-col w-full">{children}</main>
      </div>
    );
  }

  const isDark = themeMode === "dark";

  return (
    <div className={`flex flex-col min-h-screen relative transition-colors duration-300 ${isDark ? "bg-[#091b24] text-slate-100" : "bg-[#f5f7fa] text-[#0f1929]"
      } ${isPortalRoute ? "portal-shell" : ""}`}>

      {/* 1. Top Brand Announcement & Trust Badges Header */}
      <div
        ref={announcementRef}
        className="bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#082a38] text-white py-1 md:py-2 px-2 sm:px-6 md:px-8 text-xs font-semibold z-50 border-b border-white/10 shadow-sm overflow-hidden"
      >
        {/* Desktop View (md and up) */}
        <div className="hidden md:flex max-w-[1440px] mx-auto items-center justify-between gap-6">
          {/* Left: Brand Announcement */}
          <div className="flex items-center gap-2.5 text-slate-100 text-xs shrink-0">
            <span className="text-[#ff8c73] text-sm font-bold">⚡</span>
            <span className="text-white/30 font-normal">|</span>
            <span className="tracking-wide">MARBLEX — Premium Construction Chemical & Industrial Rubber Solutions</span>
          </div>

          {/* Right: 3 Trust Badges */}
          <div className="flex items-center gap-6 text-[11px] shrink-0">
            <div className="flex items-center gap-2">
              <ShieldOutlinedIcon sx={{ fontSize: 17, color: "#10b981" }} />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-white text-[11px]">ISO Certified</span>
                <span className="text-[9px] text-slate-200/80 font-normal">Quality You Can Trust</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 17, color: "#10b981" }} />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-white text-[11px]">15+ Years</span>
                <span className="text-[9px] text-slate-200/80 font-normal">Proven Performance</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SpaOutlinedIcon sx={{ fontSize: 17, color: "#10b981" }} />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-white text-[11px]">Sustainable</span>
                <span className="text-[9px] text-slate-200/80 font-normal">For a Better Tomorrow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: Continuous Smooth Marquee Ticker (Shows all text & badges seamlessly) */}
        <div className="md:hidden flex items-center overflow-hidden whitespace-nowrap">
          <div className="animate-marquee-left flex items-center gap-6 text-[11px]">
            {[1, 2].map((k) => (
              <div key={k} className="flex items-center gap-6 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-slate-100">
                  <span className="text-[#ff8c73] text-xs font-bold">⚡</span>
                  <span className="font-bold tracking-wide">MARBLEX</span>
                  <span className="text-slate-300 font-normal">— Premium Construction Chemical & Industrial Rubber Solutions</span>
                </span>
                <span className="text-white/30">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>ISO Certified (Quality You Can Trust)</span>
                </span>
                <span className="text-white/30">•</span>
                <span className="inline-flex items-center gap-1 text-sky-300 font-bold">
                  <WorkspacePremiumOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>15+ Years Proven Performance</span>
                </span>
                <span className="text-white/30">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                  <SpaOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>Sustainable Eco Formulations</span>
                </span>
                <span className="text-white/30">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Sleek Compact Main Navbar */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow,padding] duration-200 ease-in-out ${isMenuOpen ? "z-[70]" : "z-40"} ${isDark
            ? scrolled || isMenuOpen
              ? "bg-[#0c222f]/95 backdrop-blur-md border-slate-800 shadow-md shadow-black/20 py-1.5 sm:py-2"
              : "bg-[#091b24] border-slate-800/80 py-2 sm:py-2.5"
            : scrolled || isMenuOpen
              ? "bg-white/95 backdrop-blur-md border-slate-200/90 shadow-md shadow-[#0a3d52]/5 py-1.5 sm:py-2"
              : "bg-white border-slate-200/80 py-2 sm:py-2.5"
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8">
          <div className="flex items-center justify-between gap-2">

            {/* MARBLEX Logo (Left) */}
            <div ref={logoRef} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              {!isHomePage && (
                <button
                  onClick={() => navigate(-1)}
                  className={`md:hidden p-1.5 -ml-1 rounded-lg transition-colors shrink-0 ${isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-[#0a3d52]"
                    }`}
                  aria-label="Go Back"
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: 15 }} />
                </button>
              )}
              <RouterLink to="/" className="flex min-w-0 items-center gap-2 group">
                <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border p-1 sm:p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0 overflow-hidden ${isDark ? "bg-[#0e2735] border-slate-700" : "bg-white border-slate-200"
                  }`}>
                  <img
                    src="/logo-icon-transparent.png"
                    alt="MARBLEX Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className={`text-[1.05rem] sm:text-2xl font-black tracking-tight font-heading leading-none ${isDark ? "text-white" : "text-[#0a3d52]"
                    }`}>
                    MAR<span className="text-[#ff6b4a]">BLEX</span>
                  </span>
                  <span className={`text-[8px] sm:text-[9.5px] font-bold tracking-[0.12em] sm:tracking-[0.16em] uppercase font-subheading mt-0.5 ${isDark ? "text-slate-400" : "text-[#475569]"
                    }`}>
                    CHEMICAL & RUBBER
                  </span>
                </div>
              </RouterLink>
            </div>

            {/* Main Navigation - Desktop (Center Capsule Pill Bar) */}
            <nav
              ref={navPillsRef}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full border ${isDark ? "bg-[#0e2735] border-slate-700/80" : "bg-[#f1f5f9] border-slate-200/80"
                }`}
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <RouterLink
                    key={link.label}
                    to={link.path}
                    className={`relative px-4 py-2 text-[13px] font-semibold font-subheading rounded-full transition-all duration-150 flex items-center gap-1 ${isActive
                        ? "bg-[#0a3d52] text-white shadow-xs"
                        : isDark
                          ? "text-slate-300 hover:text-white hover:bg-white/10"
                          : "text-slate-700 hover:text-[#0a3d52] hover:bg-white/70"
                      }`}
                  >
                    <span>{link.label}</span>
                    {link.hasDropdown && (
                      <KeyboardArrowDownIcon sx={{ fontSize: 16 }} className="opacity-70" />
                    )}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-[#ff6b4a] rounded-full shadow-xs" />
                    )}
                  </RouterLink>
                );
              })}
            </nav>

            {/* Action Buttons (Right) */}
            <div ref={actionsRef} className="flex shrink-0 items-center gap-2.5 sm:gap-2.5 lg:gap-3">

              {/* Theme toggle — always in navbar */}
              <button
                type="button"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                aria-label="Toggle Theme"
                className={`flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all items-center justify-center shrink-0 ${isDark
                    ? "bg-[#0e2735] border-slate-700 text-amber-400 hover:bg-slate-800 hover:border-amber-400/50 shadow-xs"
                    : "bg-[#f8fafc] border-slate-200 text-[#0a3d52] hover:bg-white hover:border-[#0a3d52]/40 shadow-xs"
                  }`}
              >
                {isDark ? (
                  <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <DarkModeOutlinedIcon sx={{ fontSize: 18, color: "#0a3d52" }} />
                )}
              </button>

              {/* Cart — desktop always visible; on mobile visible only when not logged in (shifts down to floating FAB when logged in) */}
              <RouterLink
                to="/cart"
                aria-label="Cart"
                className={`relative ${
                  isUserLoggedIn ? "hidden sm:flex" : "flex"
                } w-9 h-9 sm:w-auto sm:h-auto items-center justify-center sm:justify-start gap-2 sm:px-3.5 sm:py-2 rounded-full border transition-all font-semibold text-xs sm:text-[13px] ${
                  isDark
                    ? "border-slate-700 bg-[#0e2735] text-white hover:border-[#ff6b4a]"
                    : "border-slate-200 bg-[#f8fafc] hover:border-slate-300 text-[#0a3d52]"
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
                      fontSize: "9px",
                      height: "15px",
                      minWidth: "15px",
                      top: -4,
                      right: -4,
                    },
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 17, color: isDark ? "#ff8c73" : "#0a3d52" }} />
                </Badge>
                <span className="hidden sm:inline font-subheading">Cart</span>
              </RouterLink>

              {/* Vertical Divider Stick */}
              <span className="hidden lg:block h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5" />

              {/* Login / Portal Button with User Icon + Arrow (Visible ONLY on desktop >= lg, inside mobile menu on mobile) */}
              {!isUserLoggedIn ? (
                <div className="hidden lg:inline-flex glowing-border-wrap">
                  <div className="glowing-border-beam" />
                  <div className="glowing-border-body">
                    <RouterLink
                      to="/login"
                      className="shimmer-btn bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] active:scale-95 text-white h-9 sm:h-10 px-5 sm:px-6 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ff6b4a]/30 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <PersonOutlinedIcon sx={{ fontSize: 17 }} />
                      <span>LOGIN</span>
                      <ArrowForwardIcon sx={{ fontSize: 14 }} className="ml-0.5" />
                    </RouterLink>
                  </div>
                </div>
              ) : (
                <div className="relative" ref={accountMenuRef}>
                  <div
                    className={`flex items-center rounded-full border transition-all ${
                      accountMenuOpen
                        ? isDark
                          ? "border-[#ff6b4a]/40 bg-[#ff6b4a]/10"
                          : "border-[#0a3d52]/25 bg-[#0a3d52]/5"
                        : isDark
                          ? "border-slate-700 bg-[#0e2735] hover:border-slate-600"
                          : "border-slate-200 bg-[#f8fafc] hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setAccountMenuOpen((o) => !o);
                      }}
                      aria-expanded={accountMenuOpen}
                      aria-haspopup="menu"
                      aria-label="Account menu"
                      className="flex items-center gap-0 rounded-full p-0 lg:gap-2 lg:pl-1.5 lg:pr-2 lg:py-1.5"
                    >
                      <AccountAvatar className="h-8 w-8 text-[11px] sm:h-9 sm:w-9 lg:h-8 lg:w-8 lg:text-[12px]" />
                      <span className="hidden min-w-0 text-left lg:block">
                        <span className={`block max-w-[7.5rem] truncate text-[12px] font-bold leading-tight ${isDark ? "text-white" : "text-[#0a3d52]"}`}>
                          {displayFirstName}
                        </span>
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {isAdmin ? "Admin" : "Account"}
                        </span>
                      </span>
                      <KeyboardArrowDownIcon
                        sx={{ fontSize: 18 }}
                        className={`mr-1 hidden text-slate-400 transition-transform lg:inline ${accountMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {accountMenuOpen && (
                    <div
                      role="menu"
                      className={`absolute right-0 top-[calc(100%+8px)] z-[80] w-[min(16.5rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border shadow-[0_18px_40px_-22px_rgba(8,34,46,.5)] ${
                        isDark ? "border-slate-700/80 bg-[#0c222f]" : "border-slate-200/90 bg-white"
                      }`}
                    >
                      <div className={`flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3 ${isDark ? "bg-white/[0.02]" : "bg-slate-50/80"}`}>
                        <AccountAvatar className="h-8 w-8 shrink-0 text-[11px] sm:h-9 sm:w-9 sm:text-[12px]" />
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-[12.5px] font-bold leading-tight sm:text-[13px] ${isDark ? "text-white" : "text-[#0a3d52]"}`}>
                            {authUser?.name || displayFirstName}
                          </p>
                          <p className="truncate text-[10.5px] text-slate-400 sm:text-[11px]">
                            {authUser?.email || (isAdmin ? "Administrator" : "Client account")}
                          </p>
                        </div>
                      </div>

                      <div className={`border-t p-1 sm:p-1.5 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                        {!isAdmin && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={openNotifications}
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition sm:gap-2.5 sm:px-3 sm:py-2.5 sm:text-[13px] ${
                              isDark ? "text-slate-200 hover:bg-white/5" : "text-[#0a3d52] hover:bg-slate-50"
                            }`}
                          >
                            <NotificationsNoneOutlinedIcon sx={{ fontSize: 17 }} />
                            <span className="flex-1 text-left">Notifications</span>
                            {notifCount > 0 && (
                              <span className="rounded-full bg-[#ff6b4a] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                                {notifCount > 99 ? "99+" : notifCount}
                              </span>
                            )}
                          </button>
                        )}
                        {isAdmin && notifCount > 0 && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={openNotifications}
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition sm:gap-2.5 sm:px-3 sm:py-2.5 sm:text-[13px] ${
                              isDark ? "text-slate-200 hover:bg-white/5" : "text-[#0a3d52] hover:bg-slate-50"
                            }`}
                          >
                            <NotificationsNoneOutlinedIcon sx={{ fontSize: 17 }} />
                            <span className="flex-1 text-left">Notifications</span>
                            <span className="rounded-full bg-[#ff6b4a] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                              {notifCount > 99 ? "99+" : notifCount}
                            </span>
                          </button>
                        )}
                        {isAdmin && (
                          <RouterLink
                            to="/admin"
                            role="menuitem"
                            onClick={() => setAccountMenuOpen(false)}
                            className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition sm:gap-2.5 sm:px-3 sm:py-2.5 sm:text-[13px] ${
                              isDark ? "text-slate-200 hover:bg-white/5" : "text-[#0a3d52] hover:bg-slate-50"
                            }`}
                          >
                            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 17 }} />
                            <span className="flex-1">Admin console</span>
                          </RouterLink>
                        )}
                        {isCustomer && (
                          <RouterLink
                            to="/dashboard"
                            role="menuitem"
                            onClick={() => setAccountMenuOpen(false)}
                            className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition sm:gap-2.5 sm:px-3 sm:py-2.5 sm:text-[13px] ${
                              isDark ? "text-slate-200 hover:bg-white/5" : "text-[#0a3d52] hover:bg-slate-50"
                            }`}
                          >
                            <BusinessCenterOutlinedIcon sx={{ fontSize: 17 }} />
                            <span className="flex-1">Client portal</span>
                          </RouterLink>
                        )}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold text-rose-600 transition hover:bg-rose-50 sm:gap-2.5 sm:px-3 sm:py-2.5 sm:text-[13px] dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <LogoutRoundedIcon sx={{ fontSize: 17 }} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                className={`lg:hidden relative z-[70] flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${isMenuOpen
                    ? isDark
                      ? "border-[#ff6b4a]/50 bg-[#ff6b4a]/15 text-[#ff8c73] rotate-90"
                      : "border-[#ff6b4a]/40 bg-[#ff6b4a]/10 text-[#ff6b4a] rotate-90"
                    : isDark
                      ? "border-slate-700 bg-[#0e2735] text-white hover:bg-slate-800"
                      : "border-slate-200 bg-[#f8fafc] text-[#08222e] hover:bg-slate-100"
                  }`}
                onClick={() => {
                  setAccountMenuOpen(false);
                  setIsMenuOpen((open) => !open);
                }}
                aria-label={isMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <CloseIcon sx={{ fontSize: 18 }} /> : <MenuIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation — simple professional drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-[opacity,visibility] duration-300 ${
          isMenuOpen ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          aria-label="Close menu backdrop"
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          ref={mobileMenuPanelRef}
          className={`absolute inset-x-3 top-[4.6rem] max-h-[min(78dvh,520px)] overflow-hidden rounded-2xl border shadow-xl transition-all duration-300 ease-out sm:inset-x-4 ${
            isDark ? "border-slate-700 bg-[#0c222f]" : "border-slate-200 bg-white"
          } ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
        >
          <div ref={mobileMenuItemsRef} className="overflow-y-auto overscroll-contain px-3 py-3.5 sm:px-4">
            <div data-mobile-nav-brand className="mb-3 flex items-center justify-between px-1">
              <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Menu
              </p>
              <span className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Quick links
              </span>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <RouterLink
                    key={link.label}
                    to={link.path}
                    data-mobile-nav-item
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition active:scale-[0.99] ${
                      isActive
                        ? isDark
                          ? "bg-[#ff6b4a]/15 text-[#ff8c73]"
                          : "bg-[#0a3d52]/8 text-[#0a3d52]"
                        : isDark
                          ? "text-slate-200 hover:bg-white/5"
                          : "text-[#0a3d52] hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? isDark
                            ? "bg-[#ff6b4a]/20 text-[#ff8c73]"
                            : "bg-[#0a3d52] text-white"
                          : isDark
                            ? "bg-slate-800 text-slate-300"
                            : "bg-slate-100 text-[#0a3d52]"
                      }`}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </span>
                    <span className="flex-1 text-[14px] font-semibold tracking-tight">{link.label}</span>
                    <EastRoundedIcon
                      sx={{ fontSize: 16 }}
                      className={isActive ? "opacity-80" : "opacity-30"}
                    />
                  </RouterLink>
                );
              })}
            </nav>

            <div data-mobile-nav-footer className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://wa.me/923084585792"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white"
                >
                  <WhatsAppIcon sx={{ fontSize: 16 }} />
                  WhatsApp
                </a>
                <a
                  href="tel:03084585792"
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? "bg-slate-800 text-slate-100" : "bg-[#0a3d52] text-white"
                  }`}
                >
                  <LocalPhoneOutlinedIcon sx={{ fontSize: 16 }} />
                  Call
                </a>
              </div>

              {!isUserLoggedIn ? (
                <RouterLink
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b4a] py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PersonOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>Login</span>
                </RouterLink>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className={`flex-grow flex flex-col relative z-10 w-full ${isPortalRoute ? "min-h-0" : ""}`}>
        {isPortalRoute ? (
          <div className="page-content-portal flex w-full min-h-0 flex-1 flex-col">{children}</div>
        ) : (
          <Container maxWidth={false} sx={{ py: { xs: 1.5, md: 2.5 }, px: { xs: 1.5, sm: 2, md: 4 } }} className="page-content">
            {children}
          </Container>
        )}
      </main>

      {/* Store footer / floating widgets stay off the portal workspace */}
      {!isPortalRoute && <SiteFooter />}

      {!isPortalRoute && isUserLoggedIn && (
        <RouterLink
          to="/cart"
          aria-label="Cart"
          className={`sm:hidden fixed z-[9998] flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition active:scale-95 ${
            isCustomer ? "bottom-[5.25rem] right-5" : "bottom-5 right-6"
          } ${
            isDark
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

      <Suspense fallback={null}>
        <FloatingChatWidget />
      </Suspense>
    </div>
  );
};
