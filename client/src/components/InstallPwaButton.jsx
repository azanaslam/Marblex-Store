import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const DISMISS_KEY = "marblex_pwa_prompt_dismissed";
const INSTALLED_KEY = "marblex_pwa_installed";
const PROMPT_DELAY_MS = 2800;
const PROMPT_MS = 9000;

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

let sharedDeferred = null;
const deferredListeners = new Set();
const installedListeners = new Set();
let sharedInstalled = typeof window !== "undefined" ? isStandalone() : false;

function setSharedDeferred(event) {
  sharedDeferred = event;
  deferredListeners.forEach((fn) => fn(event));
}

function setSharedInstalled(value) {
  sharedInstalled = value;
  installedListeners.forEach((fn) => fn(value));
}

function subscribeDeferred(fn) {
  deferredListeners.add(fn);
  fn(sharedDeferred);
  return () => deferredListeners.delete(fn);
}

function subscribeInstalled(fn) {
  installedListeners.add(fn);
  fn(sharedInstalled);
  return () => installedListeners.delete(fn);
}

let bootstrapped = false;
let readyFlag = false;
const readyListeners = new Set();

function setReadyFlag(v) {
  readyFlag = v;
  readyListeners.forEach((fn) => fn(v));
}

function subscribeReady(fn) {
  readyListeners.add(fn);
  fn(readyFlag);
  return () => readyListeners.delete(fn);
}

function bootstrapInstallListeners() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  const sync = async () => {
    const next = await resolveInstalled(!!sharedDeferred);
    setSharedInstalled(next);
    setReadyFlag(true);
  };

  sync();

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    clearInstalledFlag();
    setSharedDeferred(e);
    setSharedInstalled(false);
    setReadyFlag(true);
  });

  window.addEventListener("appinstalled", () => {
    markInstalled();
    setSharedInstalled(true);
    setSharedDeferred(null);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") sync();
  });
}

/** Mobile browser chrome ke upar bottom offset (iOS Chrome / Safari) */
function useMobileBottomOffset() {
  const [bottomPx, setBottomPx] = useState(88);

  useEffect(() => {
    const sync = () => {
      const vv = window.visualViewport;
      if (!vv) {
        setBottomPx(88);
        return;
      }
      const chromeGap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // Chrome bottom bar (~56–72) + thoda gap — popup hamesha neeche
      setBottomPx(Math.max(80, chromeGap + 16));
    };
    sync();
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return bottomPx;
}

function useInstallState() {
  const [deferred, setDeferred] = useState(sharedDeferred);
  const [installed, setInstalled] = useState(() => sharedInstalled || isStandalone());
  const [ready, setReady] = useState(readyFlag);

  useEffect(() => {
    bootstrapInstallListeners();
    return subscribeDeferred(setDeferred);
  }, []);
  useEffect(() => subscribeInstalled(setInstalled), []);
  useEffect(() => subscribeReady(setReady), []);

  const requestInstall = useCallback(async () => {
    const promptEvent = sharedDeferred || deferred;
    if (promptEvent) {
      promptEvent.prompt();
      try {
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === "accepted") {
          markInstalled();
          setSharedInstalled(true);
        }
      } catch {
        /* dismissed */
      }
      setSharedDeferred(null);
      return "prompted";
    }
    return "help";
  }, [deferred]);

  return { deferred, installed, ready, requestInstall };
}

/**
 * Bottom install toast — mount OUTSIDE the animated header (AppLayout root).
 * Always portals to document.body with visualViewport bottom offset.
 */
export function InstallPwaPrompt() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { installed, ready, requestInstall } = useInstallState();
  const [bannerOpen, setBannerOpen] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const bottomPx = useMobileBottomOffset();

  useEffect(() => {
    if (!ready || installed || !isHome || isStandalone()) {
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
  }, [ready, installed, isHome]);

  const dismissBanner = () => {
    setBannerOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleInstall = async () => {
    const result = await requestInstall();
    if (result === "help") setShowIosHelp(true);
    else setBannerOpen(false);
  };

  if (typeof document === "undefined") return null;

  return (
    <>
      {bannerOpen &&
        !installed &&
        createPortal(
          <div
            id="marblex-install-prompt"
            className="marblex-install-prompt"
            role="status"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: "auto",
              bottom: `${bottomPx}px`,
              zIndex: 2147483000,
              transform: "none",
              pointerEvents: "none",
              paddingLeft: 12,
              paddingRight: 12,
              display: "flex",
              justifyContent: "center",
              margin: 0,
            }}
          >
            <style>{`
              @keyframes marblexPwaUp {
                from { opacity: 0; transform: translate3d(0, 20px, 0); }
                to { opacity: 1; transform: translate3d(0, 0, 0); }
              }
              .marblex-install-prompt__card {
                pointer-events: auto;
                width: 100%;
                max-width: 32rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                border-radius: 1rem;
                border: 1px solid rgba(10, 61, 82, 0.15);
                background: #fff;
                padding: 0.85rem;
                box-shadow: 0 16px 48px -12px rgba(10, 61, 82, 0.55);
                animation: marblexPwaUp 0.35s ease-out;
              }
            `}</style>
            <div className="marblex-install-prompt__card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/marblex-mark.png"
                  alt=""
                  style={{ width: "85%", height: "85%", objectFit: "contain" }}
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#0a3d52",
                    lineHeight: 1.25,
                  }}
                >
                  Install MARBLEX App
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 11,
                    color: "#64748b",
                    lineHeight: 1.3,
                  }}
                >
                  Add MARBLEX to your home screen for a faster, app-like experience.
                </p>
              </div>
              <button
                type="button"
                onClick={handleInstall}
                style={{
                  flexShrink: 0,
                  border: "none",
                  borderRadius: 12,
                  background: "#0a3d52",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss"
                style={{
                  flexShrink: 0,
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  padding: 4,
                  cursor: "pointer",
                  borderRadius: 999,
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>,
          document.body
        )}

      {showIosHelp &&
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
              transform: "none",
            }}
            onClick={() => setShowIosHelp(false)}
            role="presentation"
          >
            <div
              style={{
                width: "100%",
                maxWidth: 24 * 16,
                borderRadius: 16,
                background: "#fff",
                padding: 20,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="pwa-help-title"
            >
              <h3
                id="pwa-help-title"
                style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0a3d52" }}
              >
                {isIos() ? "Install on iPhone / iPad" : "Install app"}
              </h3>
              {isIos() ? (
                <ol style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13, color: "#475569" }}>
                  <li style={{ marginBottom: 8 }}>
                    Tap Share <IosShareRoundedIcon sx={{ fontSize: 16 }} />
                  </li>
                  <li style={{ marginBottom: 8 }}>
                    Choose <b>Add to Home Screen</b>
                  </li>
                  <li>
                    Tap <b>Add</b> — the MARBLEX icon will appear on your home screen
                  </li>
                </ol>
              ) : (
                <p style={{ margin: "12px 0 0", fontSize: 13, color: "#475569" }}>
                  In Chrome or Edge, tap <b>Install</b> (or use Add to Home Screen). HTTPS is
                  required on the live site.
                </p>
              )}
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
                  fontSize: 13,
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
}

/**
 * Navbar / mobile Install button only (no toast — toast is InstallPwaPrompt).
 */
export function InstallPwaButton({
  variant = "nav",
  isDark = false,
  withPrompt = false, // kept for API compat; unused — prompt is InstallPwaPrompt
  fullWidth = false,
}) {
  void withPrompt;
  const { installed, ready, requestInstall } = useInstallState();
  const [showIosHelp, setShowIosHelp] = useState(false);

  const handleInstall = useCallback(async () => {
    const result = await requestInstall();
    if (result === "help") setShowIosHelp(true);
  }, [requestInstall]);

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
                {isIos() ? "Install on iPhone / iPad" : "Install app"}
              </h3>
              <p style={{ margin: "12px 0 0", fontSize: 13, color: "#475569" }}>
                {isIos()
                  ? "Share → Add to Home Screen → Add"
                  : "Use Install or Add to Home Screen in your browser to add MARBLEX."}
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
}
