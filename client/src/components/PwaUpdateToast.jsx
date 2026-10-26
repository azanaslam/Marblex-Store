import { useEffect, useRef, useState } from "react";
import SystemUpdateAltRoundedIcon from "@mui/icons-material/SystemUpdateAltRounded";
import { getIsStandaloneApp, useStandaloneApp } from "../hooks/useStandaloneApp";

/**
 * Website (browser): auto-apply new SW — no popup.
 * Installed app only: English "Update required" modal.
 */
export function PwaUpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updating, setUpdating] = useState(false);
  const updateSWRef = useRef(null);
  const isApp = useStandaloneApp();

  useEffect(() => {
    let cancelled = false;
    let registration = null;
    let intervalId = 0;

    const checkUpdate = () => {
      try {
        registration?.update?.();
      } catch {
        /* ignore */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") checkUpdate();
    };

    (async () => {
      try {
        const { registerSW } = await import("virtual:pwa-register");
        const sw = registerSW({
          immediate: true,
          onNeedRefresh() {
            if (cancelled) return;
            // Browser / website → silent refresh with new assets
            if (!getIsStandaloneApp()) {
              try {
                sw(true);
              } catch {
                window.location.reload();
              }
              return;
            }
            // Installed app → ask user
            setNeedRefresh(true);
          },
          onOfflineReady() {
            /* precache ready */
          },
          onRegisteredSW(_url, reg) {
            if (cancelled) return;
            registration = reg;
            checkUpdate();
            document.addEventListener("visibilitychange", onVisible);
            window.addEventListener("focus", checkUpdate);
            intervalId = window.setInterval(checkUpdate, 60 * 60 * 1000);
          },
        });
        if (!cancelled) updateSWRef.current = sw;
      } catch {
        /* PWA plugin unavailable */
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", checkUpdate);
    };
  }, []);

  const applyUpdate = () => {
    setUpdating(true);
    try {
      updateSWRef.current?.(true);
    } catch {
      window.location.reload();
    }
  };

  // Never show update UI on website — only installed app
  if (!needRefresh || !isApp) return null;

  return (
    <div
      className="fixed inset-0 z-[10060] flex items-end justify-center bg-[#091b24]/55 p-4 backdrop-blur-[2px] sm:items-center"
      role="alertdialog"
      aria-labelledby="pwa-update-title"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a3d52] p-5 text-white shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
          <SystemUpdateAltRoundedIcon sx={{ fontSize: 26 }} className="text-[#ff8c73]" />
        </div>
        <h2 id="pwa-update-title" className="font-heading mt-3 text-lg font-extrabold">
          Update required
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
          New pages and features are live on MARBLEX. Tap Update Now to load the latest
          version in your app.
        </p>
        <button
          type="button"
          disabled={updating}
          onClick={applyUpdate}
          className="mt-5 w-full rounded-xl bg-white py-3 text-[13px] font-bold text-[#0a3d52] disabled:opacity-70"
        >
          {updating ? "Updating…" : "Update Now"}
        </button>
      </div>
    </div>
  );
}
