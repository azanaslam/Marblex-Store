import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const DISMISS_KEY = "marblex_pwa_prompt_dismissed";
const INSTALLED_KEY = "marblex_pwa_installed";
/** Homepage load ke baad popup delay */
const PROMPT_DELAY_MS = 2800;
const PROMPT_MS = 8000;

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

function clearInstalledFlag() {
  try {
    localStorage.removeItem(INSTALLED_KEY);
  } catch {
    /* ignore */
  }
}

function markInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, "1");
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Chromium: related webapp still on device? */
async function relatedAppInstalled() {
  if (typeof navigator === "undefined" || !navigator.getInstalledRelatedApps) {
    return null;
  }
  try {
    const apps = await navigator.getInstalledRelatedApps();
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return null;
  }
}

/**
 * Install state:
 * - standalone / related apps → installed (hide UI)
 * - beforeinstallprompt → NOT installed (user deleted / never installed) → show UI
 * - localStorage flag only until BIP / related-apps contradicts it
 */
async function resolveInstalled(hasDeferredPrompt) {
  if (isStandalone()) return true;
  if (hasDeferredPrompt) {
    clearInstalledFlag();
    return false;
  }
  const related = await relatedAppInstalled();
  if (related === true) {
    markInstalled();
    return true;
  }
  if (related === false) {
    clearInstalledFlag();
    return false;
  }
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Shared deferred prompt across multiple Install buttons */
let sharedDeferred = null;
const deferredListeners = new Set();

function setSharedDeferred(event) {
  sharedDeferred = event;
  deferredListeners.forEach((fn) => fn(event));
}

function subscribeDeferred(fn) {
  deferredListeners.add(fn);
  fn(sharedDeferred);
  return () => deferredListeners.delete(fn);
}

/**
 * Navbar / mobile Install control.
 * Pass `withPrompt` on ONE instance (navbar) so the toast popup is managed once.
 */
export function InstallPwaButton({
  variant = "nav",
  isDark = false,
  withPrompt = false,
  fullWidth = false,
}) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [deferred, setDeferred] = useState(sharedDeferred);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [ready, setReady] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => subscribeDeferred(setDeferred), []);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const next = await resolveInstalled(!!sharedDeferred);
      if (!cancelled) {
        setInstalled(next);
        setReady(true);
      }
    };

    sync();

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      // Browser says installable → app is NOT on device (or was removed)
      clearInstalledFlag();
      setSharedDeferred(e);
      setInstalled(false);
      setReady(true);
    };

    const onInstalled = () => {
      markInstalled();
      setInstalled(true);
      setSharedDeferred(null);
      setBannerOpen(false);
      setShowIosHelp(false);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Home page: kuch seconds baad install popup (sirf jab app installed na ho)
  useEffect(() => {
    if (!withPrompt || !ready || installed || !isHome) {
      setBannerOpen(false);
      return undefined;
    }

    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      dismissed = false;
    }
    if (dismissed) return undefined;

    const showTimer = window.setTimeout(() => setBannerOpen(true), PROMPT_DELAY_MS);
    const hideTimer = window.setTimeout(() => {
      setBannerOpen(false);
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* ignore */
      }
    }, PROMPT_DELAY_MS + PROMPT_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [withPrompt, ready, installed, isHome]);

  const dismissBanner = () => {
    setBannerOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleInstall = useCallback(async () => {
    const promptEvent = sharedDeferred || deferred;
    if (promptEvent) {
      promptEvent.prompt();
      try {
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === "accepted") {
          markInstalled();
          setInstalled(true);
        }
      } catch {
        /* dismissed */
      }
      setSharedDeferred(null);
      setBannerOpen(false);
      return;
    }
    setShowIosHelp(true);
  }, [deferred]);

  // Installed / running as app → Install button & popup completely gone
  if (!ready || installed || isStandalone()) {
    return null;
  }

  const navBtnClass =
    variant === "menu" || fullWidth
      ? `flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider ${
          isDark
            ? "bg-slate-800 text-emerald-300 border border-slate-700"
            : "bg-[#0a3d52] text-white"
        }`
      : `inline-flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center sm:gap-1.5 sm:px-3 sm:py-2 rounded-full border text-[11px] font-bold uppercase tracking-wide transition ${
          isDark
            ? "border-slate-700 bg-[#0e2735] text-emerald-300 hover:border-emerald-500/50"
            : "border-slate-200 bg-[#f8fafc] text-[#0a3d52] hover:border-[#0a3d52]/40"
        }`;

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        title="Install MARBLEX as an app"
        aria-label="Install app"
        className={navBtnClass}
      >
        <GetAppRoundedIcon sx={{ fontSize: variant === "menu" ? 16 : 17 }} />
        <span className={variant === "menu" || fullWidth ? "" : "hidden sm:inline"}>
          Install
        </span>
      </button>

      {withPrompt && bannerOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[90] animate-[pwaSlideUp_0.35s_ease-out] px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] sm:px-4"
          role="status"
        >
          <style>{`
            @keyframes pwaSlideUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-[#0a3d52]/15 bg-white/95 p-3 shadow-[0_12px_40px_-12px_rgba(10,61,82,0.45)] backdrop-blur-md dark:border-slate-700 dark:bg-[#0c222e]/95">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
              <img src="/marblex-mark.png" alt="" className="h-[85%] w-[85%] object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[13px] font-bold text-[#0a3d52] dark:text-white">
                Install MARBLEX App
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Home screen pe rakho — faster, app jaisi feel.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="shrink-0 rounded-xl bg-[#0a3d52] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white"
            >
              Install
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              className="shrink-0 rounded-full p-1 text-slate-400 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      ) : null}

      {showIosHelp ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          onClick={() => setShowIosHelp(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-[#0c222e]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="pwa-help-title"
          >
            <h3
              id="pwa-help-title"
              className="font-heading text-base font-extrabold text-[#0a3d52] dark:text-white"
            >
              {isIos() ? "iPhone / iPad pe install" : "App install"}
            </h3>
            {isIos() ? (
              <ol className="mt-3 space-y-2 text-[13px] text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#ff6b4a]">1.</span>
                  <span>
                    Safari me Share dabao{" "}
                    <IosShareRoundedIcon sx={{ fontSize: 16 }} className="inline text-[#0a3d52]" />
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#ff6b4a]">2.</span>
                  <span>
                    <b>Add to Home Screen</b> select karo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#ff6b4a]">3.</span>
                  <span>
                    <b>Add</b> — MARBLEX icon home pe aa jayega
                  </span>
                </li>
              </ol>
            ) : (
              <p className="mt-3 text-[13px] text-slate-600 dark:text-slate-300">
                Chrome / Edge me <b>Install</b> dabao. Agar prompt na aaye to address bar ke right
                pe install icon check karo. Live site pe HTTPS zaroori hai.
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className="mt-4 w-full rounded-xl bg-[#0a3d52] py-2.5 text-[13px] font-bold text-white"
            >
              Samajh gaya
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
