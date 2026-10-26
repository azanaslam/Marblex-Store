import { Link as RouterLink, useLocation } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { Badge } from "@mui/material";

const WA = "https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20need%20help%20from%20the%20app.";

/**
 * Native-style bottom tabs — only shown in installed PWA (standalone) mode.
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

  const itemCls = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-bold tracking-wide transition ${
      active
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
      className={`fixed inset-x-0 bottom-0 z-[9990] border-t backdrop-blur-xl lg:hidden ${
        isDark
          ? "border-slate-800 bg-[#0a1a23]/95"
          : "border-slate-200/90 bg-white/95"
      }`}
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      aria-label="App navigation"
    >
      <div className="mx-auto flex h-[3.65rem] max-w-lg items-stretch px-1">
        <RouterLink to="/" className={itemCls(isHome)} aria-current={isHome ? "page" : undefined}>
          <HomeRoundedIcon sx={{ fontSize: 22 }} />
          Home
        </RouterLink>

        <a
          href="/#shop-problem-heading"
          className={itemCls(false)}
          onClick={(e) => {
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

        <RouterLink to="/cart" className={itemCls(isCart)} aria-current={isCart ? "page" : undefined}>
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

        <a href={WA} target="_blank" rel="noreferrer" className={itemCls(false)}>
          <WhatsAppIcon sx={{ fontSize: 22 }} className="text-emerald-500" />
          Chat
        </a>

        <RouterLink
          to={isLoggedIn ? dashPath : "/login"}
          className={itemCls(isDashboard)}
          aria-current={isDashboard ? "page" : undefined}
          aria-label={
            isLoggedIn
              ? isAdmin
                ? "Open admin console"
                : "Open client portal"
              : "Account"
          }
        >
          {isLoggedIn ? (
            <span
              className={`flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full text-[9px] font-extrabold text-white ring-2 ${
                isDashboard
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
