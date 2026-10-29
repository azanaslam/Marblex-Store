import { useEffect, useRef } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { Badge } from "@mui/material";
import gsap from "gsap";

const WA = "https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20need%20help%20from%20the%20app.";

/**
 * Native-style bottom tabs — only shown in installed PWA (standalone) mode.
 * Includes smooth GSAP entrance animation matching BrandSplashPreloader timing.
 */
export function AppBottomNav({
  cartCount = 0,
  isLoggedIn = false,
  isAdmin = false,
  isDark = false,
  avatarUrl = "",
  avatarInitial = "M",
}) {
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const itemsRef = useRef([]);
  const hasAnimatedRef = useRef(false);

  // ── Entrance animation: slides up from below, staggered tabs ──
  useEffect(() => {
    if (hasAnimatedRef.current || !navRef.current) return;

    const items = itemsRef.current.filter(Boolean);
    if (!items.length) return;

    // Check if intro is already done (navigating between pages)
    const introDone =
      window.__MARBLEX_INTRO_DONE__ === true ||
      (() => {
        try { return sessionStorage.getItem("marblex_intro_done") === "1"; } catch { return false; }
      })();

    const runEntrance = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      // Set initial hidden state
      gsap.set(navRef.current, { y: 80, opacity: 0 });
      gsap.set(items, { opacity: 0, y: 14, scale: 0.88 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Nav bar slides up smoothly
      tl.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
      }, 0);

      // Tab icons stagger in with spring pop
      tl.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.07,
        ease: "back.out(1.4)",
      }, 0.2);
    };

    if (introDone) {
      // Page already loaded — animate immediately with short delay
      gsap.delayedCall(0.15, runEntrance);
    } else {
      // Wait for brand splash to finish
      const handler = () => gsap.delayedCall(0.6, runEntrance);
      window.addEventListener("marblex:intro_reveal", handler);
      // Safety fallback
      const timer = setTimeout(runEntrance, 4800);
      return () => {
        window.removeEventListener("marblex:intro_reveal", handler);
        clearTimeout(timer);
      };
    }
  }, []);

  // ── Active tab tap feedback — quick elastic bounce ──
  const handleTabTap = (el) => {
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 0.82 },
      { scale: 1, duration: 0.45, ease: "elastic.out(1.2, 0.5)" }
    );
  };

  const itemCls = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-bold tracking-wide transition ${active
      ? isDark
        ? "text-emerald-300"
        : "text-[#0a3d52]"
      : isDark
        ? "text-slate-500"
        : "text-slate-400"
    }`;

  const isHome = pathname === "/";
  const isCart = pathname.startsWith("/cart");
  const dashPath = isAdmin ? "/admin" : "/dashboard";
  const isDashboard =
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin");

  const photo = String(avatarUrl || "").trim();

  return (
    <nav
      ref={navRef}
      className={`fixed inset-x-0 bottom-0 z-[9990] border-t backdrop-blur-xl lg:hidden ${isDark
          ? "border-slate-800 bg-[#0a1a23]/95"
          : "border-slate-200/90 bg-white/95"
        }`}
      style={{ paddingBottom: "max(0.45rem, env(safe-area-inset-bottom, 0px))", WebkitBackdropFilter: "blur(20px)" }}
      aria-label="App navigation"
    >
      <div className="mx-auto flex h-[3.65rem] max-w-lg items-stretch px-1">

          <RouterLink
            to="/"
            ref={(el) => (itemsRef.current[0] = el)}
            className={itemCls(isHome)}
            aria-current={isHome ? "page" : undefined}
            onClick={(e) => handleTabTap(e.currentTarget)}
          >
            <HomeRoundedIcon sx={{ fontSize: 22 }} />
            Home
          </RouterLink>

          <a
            href="/#shop-problem-heading"
            ref={(el) => (itemsRef.current[1] = el)}
            className={itemCls(false)}
            onClick={(e) => {
              handleTabTap(e.currentTarget);
              if (pathname === "/") {
                e.preventDefault();
                document.getElementById("shop-problem-heading")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }}
          >
            <StorefrontRoundedIcon sx={{ fontSize: 22 }} />
            Shop
          </a>

            <RouterLink
              to="/cart"
              ref={(el) => (itemsRef.current[2] = el)}
              className={itemCls(isCart)}
              aria-current={isCart ? "page" : undefined}
              onClick={(e) => handleTabTap(e.currentTarget)}
            >
              <Badge
                badgeContent={cartCount}
                invisible={!cartCount}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#ff6b4a",
                    color: "#fff",
                    fontSize: "9px",
                    height: 14,
                    minWidth: 14,
                    top: 2,
                    right: 2,
                  },
                }}
              >
                <ShoppingCartRoundedIcon sx={{ fontSize: 22 }} />
              </Badge>
              Cart
            </RouterLink>

              <a
                href={WA}
                ref={(el) => (itemsRef.current[3] = el)}
                target="_blank"
                rel="noreferrer"
                className={itemCls(false)}
                onClick={(e) => handleTabTap(e.currentTarget)}
              >
                <WhatsAppIcon sx={{ fontSize: 22 }} className="text-emerald-500" />
                Chat
              </a>

              <RouterLink
                to={isLoggedIn ? dashPath : "/login"}
                ref={(el) => (itemsRef.current[4] = el)}
                className={itemCls(isDashboard)}
                aria-current={isDashboard ? "page" : undefined}
                aria-label={
                  isLoggedIn
                    ? isAdmin
                      ? "Open admin console"
                      : "Open client portal"
                    : "Account"
                }
                onClick={(e) => handleTabTap(e.currentTarget)}
              >
                {isLoggedIn ? (
                  <span
                    className={`flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full text-[9px] font-extrabold text-white ring-2 ${isDashboard
                        ? isDark
                          ? "ring-emerald-300/80"
                          : "ring-[#0a3d52]/70"
                        : isDark
                          ? "ring-slate-600"
                          : "ring-slate-300"
                      } bg-gradient-to-br from-[#0a3d52] to-[#ff6b4a]`}
                  >
                    {photo ? (
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      String(avatarInitial || "M").charAt(0).toUpperCase()
                    )}
                  </span>
                ) : (
                  <PersonRoundedIcon sx={{ fontSize: 22 }} />
                )}
                {isLoggedIn ? "Dashboard" : "Account"}
              </RouterLink>
            </div>
          </nav>
          );
}
