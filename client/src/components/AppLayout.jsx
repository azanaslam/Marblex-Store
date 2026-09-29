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
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, onAuthSessionChangeEvent } from "../auth/session";
import { SiteFooter } from "./SiteFooter";

const FloatingChatWidget = lazy(() =>
  import("./FloatingChatWidget").then((m) => ({ default: m.FloatingChatWidget }))
);

export const AppLayout = ({ cartCount, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authUserFromStorage, setAuthUserFromStorage] = useState(getAuthUser());
  const [token, setToken] = useState(getAuthToken());
  const [chatUnreadNav, setChatUnreadNav] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("marblex_theme") || "light";
  });

  const announcementRef = useRef(null);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navPillsRef = useRef(null);
  const actionsRef = useRef(null);
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
  const customerLabel = authUser?.name ? `${authUser.name.split(" ")[0]}'s Dashboard` : "My Dashboard";
  
  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("marblex_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  const logout = () => {
    clearAuthSession();
    setIsMenuOpen(false);
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
        return;
      }
      http
        .get("/chat/unread-count", authHeaders(t))
        .then((r) => setChatUnreadNav(Number(r.data?.count) || 0))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [location.pathname, authUserFromStorage, token]);

  const runNavEntrance = useCallback(() => {
    if (hasNavAnimatedRef.current) return;
    hasNavAnimatedRef.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (announcementRef.current) {
      tl.fromTo(
        announcementRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      );
    }

    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { y: -30, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9 },
        "-=0.45"
      );
    }

    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.9, x: -15 },
        { opacity: 1, scale: 1, x: 0, duration: 0.7 },
        "-=0.6"
      );
    }

    if (navPillsRef.current) {
      tl.fromTo(
        navPillsRef.current.children,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.04 },
        "-=0.5"
      );
    }

    if (actionsRef.current) {
      tl.fromTo(
        actionsRef.current.children,
        { opacity: 0, scale: 0.92, y: -8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.06 },
        "-=0.45"
      );
    }
  }, []);

  // Synchronize navbar entrance with splash reveal or safety timeout
  useEffect(() => {
    const handleIntroReveal = () => {
      runNavEntrance();
    };

    window.addEventListener("marblex:intro_reveal", handleIntroReveal);

    const safetyTimer = setTimeout(() => {
      runNavEntrance();
    }, 2800);

    return () => {
      window.removeEventListener("marblex:intro_reveal", handleIntroReveal);
      clearTimeout(safetyTimer);
    };
  }, [runNavEntrance]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Services", path: "/services", hasDropdown: true },
    { label: "Contact", path: "/contact" },
    { label: "Blogs", path: "/blogs" },
    { label: "Catalogs", path: "/catalogs" },
  ];

  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <div className="min-h-screen w-full bg-[#f5f7fa] text-[#0f1929] flex flex-col selection:bg-[#ff6b4a] selection:text-white">
        <main className="flex-grow flex flex-col w-full">{children}</main>
      </div>
    );
  }

  const isDark = themeMode === "dark";

  return (
    <div className={`flex flex-col min-h-screen relative transition-colors duration-300 ${
      isDark ? "bg-[#091b24] text-slate-100" : "bg-[#f5f7fa] text-[#0f1929]"
    }`}>
      
      {/* 1. Top Brand Announcement & Trust Badges Header (Exact Match with Hero Teal) */}
      <div 
        ref={announcementRef}
        className="bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#082a38] text-white py-2 px-4 md:px-8 text-xs font-semibold z-50 border-b border-white/10 overflow-x-auto scrollbar-none shadow-sm"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6 min-w-max md:min-w-0">
          
          {/* Left: Brand Announcement */}
          <div className="flex items-center gap-2.5 text-slate-100 text-[11px] sm:text-xs shrink-0">
            <span className="text-[#ff8c73] text-sm font-bold">⚡</span>
            <span className="text-white/30 font-normal">|</span>
            <span className="tracking-wide">MARBLEX — Premium Construction Chemical & Industrial Rubber Solutions</span>
          </div>

          {/* Right: 3 Trust Badges (Exact 1:1 Match with Client SS) */}
          <div className="flex items-center gap-5 sm:gap-7 text-[11px] shrink-0">
            {/* Badge 1: ISO Certified */}
            <div className="flex items-center gap-2">
              <ShieldOutlinedIcon sx={{ fontSize: 17, color: "#10b981" }} />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-white text-[11px]">ISO Certified</span>
                <span className="text-[9px] text-slate-200/80 font-normal">Quality You Can Trust</span>
              </div>
            </div>

            {/* Badge 2: 15+ Years */}
            <div className="flex items-center gap-2">
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 17, color: "#10b981" }} />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-white text-[11px]">15+ Years</span>
                <span className="text-[9px] text-slate-200/80 font-normal">Proven Performance</span>
              </div>
            </div>

            {/* Badge 3: Sustainable */}
            <div className="flex items-center gap-2">
              <SpaOutlinedIcon sx={{ fontSize: 17, color: "#10b981" }} />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-white text-[11px]">Sustainable</span>
                <span className="text-[9px] text-slate-200/80 font-normal">For a Better Tomorrow</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Sleek Compact Main Navbar */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 transition-all duration-200 ease-in-out w-full border-b ${
          isDark
            ? scrolled || isMenuOpen
              ? "bg-[#0c222f]/95 backdrop-blur-md border-slate-800 shadow-md shadow-black/20 py-2"
              : "bg-[#091b24] border-slate-800/80 py-2.5"
            : scrolled || isMenuOpen
              ? "bg-white/95 backdrop-blur-md border-slate-200/90 shadow-md shadow-[#0a3d52]/5 py-2"
              : "bg-white border-slate-200/80 py-2.5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">

            {/* MARBLEX Logo (Left) */}
            <div ref={logoRef} className="flex items-center gap-2">
              {!isHomePage && (
                <button
                  onClick={() => navigate(-1)}
                  className={`md:hidden p-1.5 -ml-1.5 rounded-lg transition-colors ${
                    isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-[#0a3d52]"
                  }`}
                  aria-label="Go Back"
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                </button>
              )}
              <RouterLink to="/" className="flex items-center gap-2.5 group">
                <div className={`h-11 w-11 rounded-2xl border p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0 overflow-hidden ${
                  isDark ? "bg-[#0e2735] border-slate-700" : "bg-white border-slate-200"
                }`}>
                  <img
                    src="/logo-icon-transparent.png"
                    alt="MARBLEX Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xl sm:text-2xl font-black tracking-tight font-heading leading-none ${
                    isDark ? "text-white" : "text-[#0a3d52]"
                  }`}>
                    MAR<span className="text-[#ff6b4a]">BLEX</span>
                  </span>
                  <span className={`text-[9.5px] font-bold tracking-[0.16em] uppercase font-subheading mt-0.5 ${
                    isDark ? "text-slate-400" : "text-[#475569]"
                  }`}>
                    CHEMICAL & RUBBER
                  </span>
                </div>
              </RouterLink>
            </div>

            {/* Main Navigation - Desktop (Center Capsule Pill Bar) */}
            <nav 
              ref={navPillsRef}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full border ${
                isDark ? "bg-[#0e2735] border-slate-700/80" : "bg-[#f1f5f9] border-slate-200/80"
              }`}
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <RouterLink
                    key={link.label}
                    to={link.path}
                    className={`relative px-4 py-2 text-[13px] font-semibold font-subheading rounded-full transition-all duration-150 flex items-center gap-1 ${
                      isActive
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
            <div ref={actionsRef} className="flex items-center gap-2 sm:gap-3">
              
              {/* Theme Toggle Button (Icon Only - ☀️ / 🌙) */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                aria-label="Toggle Theme"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                  isDark
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

              {/* Cart Button with Dynamic Coral Badge (Only visible when items > 0) */}
              <RouterLink
                to="/cart"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all font-semibold text-xs sm:text-[13px] relative ${
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
                      right: -4
                    } 
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 17, color: isDark ? "#ff8c73" : "#0a3d52" }} />
                </Badge>
                <span className="hidden sm:inline font-subheading">Cart</span>
              </RouterLink>

              {/* Vertical Divider Stick */}
              <span className="hidden sm:block h-5 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5" />

              {/* Login / Portal Button with User Icon + Arrow (Exact Match) */}
              {!isUserLoggedIn ? (
                <RouterLink
                  to="/login"
                  className="bg-gradient-to-r from-[#ff6243] to-[#f35231] hover:from-[#f35231] hover:to-[#e04524] active:scale-95 text-white h-10 px-5 sm:px-6 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ff6b4a]/25 hidden sm:flex items-center gap-2 transition-all"
                >
                  <PersonOutlinedIcon sx={{ fontSize: 17 }} />
                  <span>LOGIN</span>
                  <ArrowForwardIcon sx={{ fontSize: 14 }} className="ml-0.5" />
                </RouterLink>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  {isAdmin && (
                    <RouterLink
                      to="/admin"
                      className="bg-gradient-to-r from-[#ff6243] to-[#f35231] hover:from-[#f35231] hover:to-[#e04524] text-white px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#ff6b4a]/25"
                    >
                      <PersonOutlinedIcon sx={{ fontSize: 15 }} />
                      <span>ADMIN PORTAL</span>
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0} />
                    </RouterLink>
                  )}
                  {isCustomer && (
                    <RouterLink
                      to="/dashboard"
                      className={`px-3.5 py-2 text-xs font-semibold rounded-full transition-colors font-subheading ${
                        isDark ? "text-slate-200 hover:bg-slate-800" : "text-[#08222e] hover:bg-slate-100"
                      }`}
                    >
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0}>
                        {customerLabel}
                      </Badge>
                    </RouterLink>
                  )}
                  <button
                    onClick={logout}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#ff6b4a] transition-colors font-subheading"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-slate-800 text-white" : "hover:bg-slate-100 text-[#08222e]"
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open Navigation Menu"
              >
                {isMenuOpen ? <CloseIcon sx={{ fontSize: 22 }} /> : <MenuIcon sx={{ fontSize: 22 }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full border-b transition-all duration-200 ease-in-out overflow-hidden ${
            isDark ? "bg-[#0c222f] border-slate-800" : "bg-white border-[#e0e6ed]"
          } ${isMenuOpen ? "max-h-[480px] opacity-100 py-5" : "max-h-0 opacity-0 py-0"}`}
        >
          <div className="flex flex-col px-6 gap-2.5">
            {navLinks.map((link) => (
              <RouterLink
                key={link.label}
                to={link.path}
                className={`text-sm font-bold font-subheading transition-colors py-2 border-b ${
                  isDark
                    ? "text-slate-200 hover:text-[#ff6b4a] border-slate-800"
                    : "text-[#0a3d52] hover:text-[#ff6b4a] border-slate-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </RouterLink>
            ))}

            <div className="pt-2 flex flex-col gap-2">
              {!isUserLoggedIn ? (
                <RouterLink
                  to="/login"
                  className="bg-gradient-to-r from-[#ff6b4a] to-[#f95738] flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-xs uppercase text-white shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PersonOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>LOGIN</span>
                  <ArrowForwardIcon sx={{ fontSize: 14 }} />
                </RouterLink>
              ) : (
                <>
                  {isAdmin && (
                    <RouterLink
                      to="/admin"
                      className="bg-gradient-to-r from-[#ff6b4a] to-[#f95738] flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>ADMIN PORTAL</span>
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0} />
                    </RouterLink>
                  )}
                  {isCustomer && (
                    <RouterLink
                      to="/dashboard"
                      className={`flex items-center justify-between w-full py-2.5 px-4 rounded-xl font-bold text-xs ${
                        isDark ? "bg-slate-800 text-white" : "bg-slate-50 text-[#0a3d52]"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {customerLabel}
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0} />
                    </RouterLink>
                  )}
                  <button
                    onClick={logout}
                    className="w-full py-2 text-center font-bold text-xs text-[#565e69] hover:text-[#ff6b4a]"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10 w-full">
        <Container maxWidth={false} sx={{ py: { xs: 1.5, md: 2.5 }, px: { xs: 1.5, sm: 2, md: 4 } }} className="page-content">
          {children}
        </Container>
      </main>

      {/* Store Footer */}
      <SiteFooter />

      {/* Floating Chat */}
      <Suspense fallback={null}>
        <FloatingChatWidget />
      </Suspense>
    </div>
  );
};
