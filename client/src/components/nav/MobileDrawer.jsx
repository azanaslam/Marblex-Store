import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import { setAppLanguage } from "../../i18n/i18n";
import { useInstallState } from "../../hooks/useInstallState";
import { NAV_ITEMS, WHATSAPP_QUOTE_URL, PHONE_NUMBER } from "./navConfig";

export const MobileDrawer = ({
  isOpen = false,
  onClose,
  isDark = false,
  toggleTheme,
  isApp = false,
  isUserLoggedIn = false,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isUrdu = i18n.language === "ur";
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Accordion open states for dropdown items
  const [expandedSections, setExpandedSections] = useState({
    tools: true,
    resources: true,
  });

  const { installed, ready, requestInstall } = useInstallState();
  const isInstallable = ready && !installed && !isApp;

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("marblex-menu-open");

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove("marblex-menu-open");
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10100] lg:hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#091b24]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Drawer Sheet */}
      <div
        ref={drawerRef}
        className={`relative z-10 flex h-full w-[min(24rem,calc(100vw-1.5rem))] flex-col border-s shadow-2xl transition-transform duration-300 ease-out ${
          isDark
            ? "bg-[#0c222f] border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-[#0a3d52]"
        }`}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Header row: Logo & Close Button */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 border-slate-100 dark:border-slate-800/80">
          <RouterLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div
              className={`h-9 w-9 rounded-xl border p-1 flex items-center justify-center overflow-hidden ${
                isDark ? "bg-[#0e2735] border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <img
                src="/logo-icon-transparent.png"
                alt="MARBLEX"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-[1.1rem] font-black font-heading ${isDark ? "text-white" : "text-[#0a3d52]"}`}>
                MAR<span className="text-[#ff6b4a]">BLEX</span>
              </span>
              <span className="text-[7.5px] font-bold tracking-[0.14em] uppercase text-slate-400">
                CHEMICAL & RUBBER
              </span>
            </div>
          </RouterLink>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border transition active:scale-95 touch-manipulation cursor-pointer ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Quick Settings Bar (Language chip, Theme toggle, Install app) */}
        <div className="shrink-0 border-b px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          {/* Language Toggle Chip */}
          <button
            type="button"
            onClick={() => setAppLanguage(isUrdu ? "en" : "ur")}
            className={`flex h-8 px-3 items-center justify-center rounded-full border text-xs font-bold gap-1.5 transition touch-manipulation cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-emerald-300 hover:border-emerald-400/50"
                : "bg-white border-slate-200 text-[#0a3d52] hover:border-slate-300 shadow-xs"
            }`}
          >
            <TranslateOutlinedIcon sx={{ fontSize: 15 }} />
            <span>{isUrdu ? "English" : "اردو"}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition touch-manipulation cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-amber-400 hover:border-amber-400/50"
                : "bg-white border-slate-200 text-[#0a3d52] hover:border-slate-300 shadow-xs"
            }`}
          >
            {isDark ? (
              <LightModeOutlinedIcon sx={{ fontSize: 16 }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ fontSize: 16, color: "#0a3d52" }} />
            )}
          </button>

          {/* Install App button if available */}
          {isInstallable && (
            <button
              type="button"
              onClick={async () => {
                onClose();
                await requestInstall();
              }}
              className="flex h-8 px-3 items-center justify-center rounded-full bg-[#0a3d52] dark:bg-[#ff6b4a] text-white text-[11px] font-bold uppercase tracking-wider gap-1 shadow-xs touch-manipulation cursor-pointer"
            >
              <GetAppRoundedIcon sx={{ fontSize: 15 }} />
              <span>{t("nav.installApp", "Install")}</span>
            </button>
          )}
        </div>

        {/* Navigation Item List */}
        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            // Accordion Dropdown Group (Tools & Resources)
            if (item.isDropdown) {
              const isSectionOpen = expandedSections[item.id] ?? true;
              const hasActiveChild = item.children?.some(
                (child) => location.pathname === child.path
              );

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-colors ${
                    isDark
                      ? hasActiveChild
                        ? "border-[#ff6b4a]/30 bg-slate-900/60"
                        : "border-slate-800/80 bg-slate-900/30"
                      : hasActiveChild
                      ? "border-[#0a3d52]/20 bg-slate-50"
                      : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(item.id)}
                    className="flex w-full min-h-[44px] items-center justify-between px-3.5 py-2.5 text-start font-bold text-sm touch-manipulation cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          hasActiveChild
                            ? "bg-[#ff6b4a] text-white"
                            : isDark
                            ? "bg-slate-800 text-slate-300"
                            : "bg-slate-200/80 text-[#0a3d52]"
                        }`}
                      >
                        <Icon sx={{ fontSize: 17 }} />
                      </span>
                      <span className="font-subheading text-[13.5px]">
                        {t(item.labelKey, item.defaultLabel)}
                      </span>
                    </span>
                    <KeyboardArrowDownIcon
                      sx={{ fontSize: 18 }}
                      className={`text-slate-400 transition-transform duration-200 ${
                        isSectionOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isSectionOpen && (
                    <div className="space-y-1 px-2 pb-2.5 pt-0.5 border-t border-slate-100/60 dark:border-slate-800/60">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const isSelected = location.pathname === child.path;

                        return (
                          <RouterLink
                            key={child.id}
                            to={child.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition active:scale-[0.99] touch-manipulation min-h-[44px] ${
                              isSelected
                                ? isDark
                                  ? "bg-[#ff6b4a]/15 text-[#ff8c73] ring-1 ring-[#ff6b4a]/30"
                                  : "bg-[#0a3d52]/10 text-[#0a3d52] ring-1 ring-[#0a3d52]/15"
                                : isDark
                                ? "text-slate-300 hover:bg-white/5"
                                : "text-slate-700 hover:bg-white"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? "bg-[#0a3d52] dark:bg-[#ff6b4a] text-white"
                                  : isDark
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-slate-100 text-[#0a3d52]"
                              }`}
                            >
                              <ChildIcon sx={{ fontSize: 17 }} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-bold leading-tight">
                                {t(child.labelKey, child.defaultLabel)}
                              </span>
                              <span
                                className={`block text-[10.5px] truncate mt-0.5 ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                {t(child.descKey, child.defaultDesc)}
                              </span>
                            </span>
                            <EastRoundedIcon
                              sx={{ fontSize: 14 }}
                              className={`rtl:rotate-180 ${
                                isSelected ? "opacity-90 text-[#ff6b4a]" : "opacity-30"
                              }`}
                            />
                          </RouterLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Flat Navigation Link
            const isActive = location.pathname === item.path;
            return (
              <RouterLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 transition active:scale-[0.99] touch-manipulation min-h-[44px] ${
                  isActive
                    ? isDark
                      ? "bg-[#ff6b4a]/15 ring-1 ring-[#ff6b4a]/35 text-[#ff8c73]"
                      : "bg-[#0a3d52]/10 ring-1 ring-[#0a3d52]/15 text-[#0a3d52]"
                    : isDark
                    ? "text-slate-200 hover:bg-white/5"
                    : "text-[#0a3d52] hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? isDark
                        ? "bg-[#ff6b4a]/25 text-[#ff8c73]"
                        : "bg-[#0a3d52] text-white"
                      : isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-[#0a3d52]"
                  }`}
                >
                  <Icon sx={{ fontSize: 19 }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-bold tracking-tight">
                    {t(item.labelKey, item.defaultLabel)}
                  </span>
                  <span
                    className={`block truncate text-[11px] font-medium mt-0.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {t(item.descKey, item.defaultDesc)}
                  </span>
                </span>
                <EastRoundedIcon
                  sx={{ fontSize: 16 }}
                  className={`rtl:rotate-180 ${isActive ? "opacity-80 text-[#ff6b4a]" : "opacity-25"}`}
                />
              </RouterLink>
            );
          })}
        </nav>

        {/* Sticky Drawer Footer */}
        <div
          className={`shrink-0 space-y-2 border-t px-4 py-3.5 ${
            isDark ? "border-slate-800 bg-[#0a1a23]/90" : "border-slate-100 bg-slate-50/90"
          }`}
        >
          {/* Quick Communication Grid */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={WHATSAPP_QUOTE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs touch-manipulation cursor-pointer"
            >
              <WhatsAppIcon sx={{ fontSize: 17 }} />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${PHONE_NUMBER}`}
              className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider shadow-xs touch-manipulation cursor-pointer ${
                isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-100" : "bg-[#0a3d52] hover:bg-[#0d4b65] text-white"
              }`}
            >
              <LocalPhoneOutlinedIcon sx={{ fontSize: 17 }} />
              <span>{t("nav.call", "Call")}</span>
            </a>
          </div>

          {/* Primary "Get Free Quote" Button */}
          <a
            href={WHATSAPP_QUOTE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#ff6b4a]/20 touch-manipulation cursor-pointer"
          >
            <RequestQuoteOutlinedIcon sx={{ fontSize: 18 }} />
            <span>{t("nav.getQuote", "Get Free Quote")}</span>
          </a>

          {/* Login button if logged out */}
          {!isUserLoggedIn && (
            <RouterLink
              to="/login"
              onClick={onClose}
              className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                  : "border-slate-200 bg-white text-[#0a3d52] hover:bg-slate-100 shadow-xs"
              }`}
            >
              <PersonOutlinedIcon sx={{ fontSize: 17 }} />
              <span>{t("nav.login", "Login / Account")}</span>
            </RouterLink>
          )}
        </div>
      </div>
    </div>
  );
};
