import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { setAppLanguage } from "../../i18n/i18n";
import { useInstallState } from "../../hooks/useInstallState";
import { createPortal } from "react-dom";

export const SettingsMenu = ({
  isOpen = false,
  onToggle,
  onClose,
  isDark = false,
  toggleTheme,
  isApp = false,
}) => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === "ur";
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const { installed, ready, requestInstall } = useInstallState();
  const [showIosHelp, setShowIosHelp] = useState(false);

  const isInstallable = ready && !installed && !isApp;

  const handleInstallClick = async () => {
    onClose();
    const result = await requestInstall();
    if (result === "help") {
      setShowIosHelp(true);
    }
  };

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

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={triggerRef}
          type="button"
          id="settings-menu-button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={t("nav.settings", "Settings")}
          title={t("nav.settings", "Settings")}
          onClick={() => onToggle(!isOpen)}
          className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-150 touch-manipulation cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] ${
            isOpen
              ? isDark
                ? "border-[#ff6b4a]/60 bg-[#ff6b4a]/15 text-[#ff8c73]"
                : "border-[#0a3d52]/40 bg-[#0a3d52]/10 text-[#0a3d52]"
              : isDark
              ? "border-slate-700 bg-[#0e2735] text-slate-300 hover:text-white hover:border-slate-600 shadow-xs"
              : "border-slate-200 bg-[#f8fafc] text-slate-700 hover:text-[#0a3d52] hover:bg-white hover:border-slate-300 shadow-xs"
          }`}
        >
          <TuneOutlinedIcon sx={{ fontSize: 18 }} />
        </button>

        {isOpen && (
          <div
            ref={panelRef}
            role="menu"
            aria-labelledby="settings-menu-button"
            className={`absolute end-0 top-[calc(100%+8px)] z-[85] w-72 rounded-2xl border p-3 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 ${
              isDark
                ? "bg-[#0c222f]/95 border-slate-700/80 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.65)]"
                : "bg-white/95 border-slate-200/90 shadow-[0_20px_45px_-15px_rgba(10,61,82,0.18)]"
            }`}
          >
            <div className="mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                {t("nav.settings", "Preferences")}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-[#0a3d52]"
              }`}>
                v2.0
              </span>
            </div>

            <div className="space-y-3">
              {/* Language Selector */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  <span className="flex items-center gap-1.5">
                    <TranslateOutlinedIcon sx={{ fontSize: 15 }} />
                    {t("nav.language", "Language")}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setAppLanguage("en")}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      !isUrdu
                        ? "bg-white dark:bg-[#0a3d52] text-[#0a3d52] dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {!isUrdu && <CheckRoundedIcon sx={{ fontSize: 14 }} />}
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppLanguage("ur")}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      isUrdu
                        ? "bg-white dark:bg-[#0a3d52] text-[#0a3d52] dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {isUrdu && <CheckRoundedIcon sx={{ fontSize: 14 }} />}
                    <span>اردو (Urdu)</span>
                  </button>
                </div>
              </div>

              {/* Theme Mode Toggle */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  <span className="flex items-center gap-1.5">
                    {isDark ? (
                      <DarkModeOutlinedIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <LightModeOutlinedIcon sx={{ fontSize: 15 }} />
                    )}
                    {t("nav.theme", "Appearance")}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={() => isDark && toggleTheme()}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      !isDark
                        ? "bg-white text-[#0a3d52] shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LightModeOutlinedIcon sx={{ fontSize: 15, color: !isDark ? "#f59e0b" : "inherit" }} />
                    <span>{t("nav.light", "Light")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => !isDark && toggleTheme()}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      isDark
                        ? "bg-[#0a3d52] text-white shadow-xs"
                        : "text-slate-500 hover:text-[#0a3d52]"
                    }`}
                  >
                    <DarkModeOutlinedIcon sx={{ fontSize: 15, color: isDark ? "#38bdf8" : "inherit" }} />
                    <span>{t("nav.dark", "Dark")}</span>
                  </button>
                </div>
              </div>

              {/* PWA App Install Action */}
              {isInstallable && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0a3d52] hover:bg-[#0d4b65] dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    <GetAppRoundedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                    <span>{t("nav.installApp", "Install MARBLEX App")}</span>
                  </button>
                </div>
              )}

              {/* If already running as installed app */}
              {(installed || isApp) && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckRoundedIcon sx={{ fontSize: 15 }} />
                  <span>{t("nav.appInstalled", "Installed & Offline Ready")}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* iOS Install Help Portal */}
      {showIosHelp &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483001,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              background: "rgba(0,0,0,0.45)",
              padding: 16,
            }}
            onClick={() => setShowIosHelp(false)}
            role="presentation"
          >
            <div
              style={{
                width: "100%",
                maxWidth: 384,
                borderRadius: 16,
                background: "#fff",
                padding: 20,
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0a3d52" }}>
                Install on iPhone / iPad
              </h3>
              <p style={{ margin: "12px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                Tap the <strong>Share</strong> button at the bottom of Safari, then choose <strong>&ldquo;Add to Home Screen&rdquo;</strong> to install MARBLEX.
              </p>
              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                style={{
                  marginTop: 16,
                  width: "100%",
                  border: "none",
                  borderRadius: 12,
                  background: "#0a3d52",
                  color: "#fff",
                  fontWeight: 700,
                  padding: "10px 0",
                  cursor: "pointer",
                }}
              >
                Got it
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
