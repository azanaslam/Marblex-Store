import { useEffect, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const AccountMenu = ({
  authUser,
  isUserLoggedIn,
  isAdmin,
  isCustomer,
  notifCount = 0,
  isOpen = false,
  onToggle,
  onClose,
  onLogout,
  openNotifications,
  isDark = false,
  compact = false, // When used in mobile header
}) => {
  const { t } = useTranslation();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const displayFirstName = authUser?.name ? authUser.name.split(" ")[0] : "Client";
  const accountAvatarUrl = String(authUser?.avatarUrl || "").trim();
  const accountInitial = (displayFirstName || "M").charAt(0).toUpperCase();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // If not logged in:
  if (!isUserLoggedIn) {
    if (compact) {
      return (
        <RouterLink
          to="/login"
          aria-label={t("nav.login", "Login")}
          title={t("nav.login", "Login")}
          className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all touch-manipulation cursor-pointer ${
            isDark
              ? "border-slate-700 bg-[#0e2735] text-slate-200 hover:text-white hover:border-[#ff6b4a]"
              : "border-slate-200 bg-[#f8fafc] text-[#0a3d52] hover:border-slate-300"
          }`}
        >
          <PersonOutlinedIcon sx={{ fontSize: 19 }} />
        </RouterLink>
      );
    }

    return (
      <div className="inline-flex glowing-border-wrap">
        <div className="glowing-border-beam" />
        <div className="glowing-border-body">
          <RouterLink
            to="/login"
            className="shimmer-btn bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] active:scale-95 text-white h-9 sm:h-10 px-4 sm:px-5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ff6b4a]/25 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff6b4a]"
          >
            <PersonOutlinedIcon sx={{ fontSize: 17 }} />
            <span>{t("nav.login", "Login")}</span>
            <ArrowForwardIcon sx={{ fontSize: 13 }} className="rtl:rotate-180" />
          </RouterLink>
        </div>
      </div>
    );
  }

  // If logged in:
  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        id="account-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account Menu"
        onClick={() => onToggle(!isOpen)}
        className={`group flex items-center rounded-full border transition-all duration-150 touch-manipulation cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] ${
          isOpen
            ? isDark
              ? "border-[#ff6b4a]/60 bg-[#ff6b4a]/15 text-[#ff8c73]"
              : "border-[#0a3d52]/30 bg-[#0a3d52]/5 text-[#0a3d52]"
            : isDark
            ? "border-slate-700 bg-[#0e2735] hover:border-slate-600 shadow-xs"
            : "border-slate-200 bg-[#f8fafc] hover:border-slate-300 shadow-xs"
        } ${compact ? "p-0.5" : "p-1 sm:px-2.5 sm:py-1 gap-2"}`}
      >
        {/* Avatar */}
        <span className="relative flex h-8 w-8 sm:h-8 sm:w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0a3d52] to-[#ff6b4a] font-extrabold text-[12px] text-white shadow-xs">
          {accountAvatarUrl ? (
            <img src={accountAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            accountInitial
          )}
          {notifCount > 0 && compact && (
            <span className="absolute top-0 end-0 h-2 w-2 rounded-full bg-[#ff6b4a] ring-2 ring-white dark:ring-slate-900" />
          )}
        </span>

        {/* Text details for desktop */}
        {!compact && (
          <>
            <div className="hidden min-w-0 text-start lg:block">
              <span
                className={`block max-w-[6.5rem] truncate text-[12.5px] font-bold leading-tight ${
                  isDark ? "text-white" : "text-[#0a3d52]"
                }`}
              >
                {displayFirstName}
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {isAdmin ? t("nav.admin", "Admin") : t("nav.account", "Account")}
              </span>
            </div>
            <KeyboardArrowDownIcon
              sx={{ fontSize: 16 }}
              className={`hidden lg:inline text-slate-400 transition-transform duration-200 group-hover:text-current ${
                isOpen ? "rotate-180 text-[#ff6b4a]" : ""
              }`}
            />
          </>
        )}
      </button>

      {/* Account Menu Dropdown */}
      {isOpen && (
        <div
          ref={panelRef}
          role="menu"
          aria-labelledby="account-menu-button"
          className={`absolute end-0 top-[calc(100%+8px)] z-[85] w-72 rounded-2xl border shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 overflow-hidden ${
            isDark
              ? "bg-[#0c222f]/95 border-slate-700/80 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.65)]"
              : "bg-white/95 border-slate-200/90 shadow-[0_20px_45px_-15px_rgba(10,61,82,0.18)]"
          }`}
        >
          {/* Header user identity */}
          <div
            className={`flex items-center gap-3 p-3.5 border-b ${
              isDark ? "bg-white/[0.03] border-slate-800" : "bg-slate-50/80 border-slate-100"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0a3d52] to-[#ff6b4a] font-extrabold text-[13px] text-white shadow-xs">
              {accountAvatarUrl ? (
                <img src={accountAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                accountInitial
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-[13px] font-bold leading-tight ${
                  isDark ? "text-white" : "text-[#0a3d52]"
                }`}
              >
                {authUser?.name || displayFirstName}
              </p>
              <p className="truncate text-[11px] text-slate-400 mt-0.5">
                {authUser?.email || (isAdmin ? "Administrator" : "Client Account")}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-1">
            {/* Notifications */}
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                onClose();
                openNotifications(e);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
                isDark
                  ? "text-slate-200 hover:bg-white/5"
                  : "text-[#0a3d52] hover:bg-slate-50"
              }`}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
              <span className="flex-1 text-start">{t("nav.notifications", "Notifications")}</span>
              {notifCount > 0 && (
                <span className="rounded-full bg-[#ff6b4a] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </button>

            {/* Admin Console */}
            {isAdmin && (
              <RouterLink
                to="/admin"
                role="menuitem"
                onClick={onClose}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
                  isDark
                    ? "text-slate-200 hover:bg-white/5"
                    : "text-[#0a3d52] hover:bg-slate-50"
                }`}
              >
                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18, color: "#38bdf8" }} />
                <span className="flex-1 text-start">{t("nav.admin", "Admin Console")}</span>
              </RouterLink>
            )}

            {/* Client Portal / Dashboard */}
            {isCustomer && (
              <RouterLink
                to="/dashboard"
                role="menuitem"
                onClick={onClose}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
                  isDark
                    ? "text-slate-200 hover:bg-white/5"
                    : "text-[#0a3d52] hover:bg-slate-50"
                }`}
              >
                <BusinessCenterOutlinedIcon sx={{ fontSize: 18, color: "#10b981" }} />
                <span className="flex-1 text-start">{t("nav.portal", "Client Portal")}</span>
              </RouterLink>
            )}

            {/* Logout button */}
            <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              >
                <LogoutRoundedIcon sx={{ fontSize: 18 }} />
                <span className="flex-1 text-start">{t("nav.logout", "Sign Out")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
