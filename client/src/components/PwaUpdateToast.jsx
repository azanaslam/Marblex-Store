import { useEffect, useState } from "react";
import SystemUpdateAltRoundedIcon from "@mui/icons-material/SystemUpdateAltRounded";
import { useStandaloneApp } from "../hooks/useStandaloneApp";

/**
 * Jab naya deploy / page / code live hota hai, service worker nayi build detect karta hai.
 * Installed app open hoti hai → "Update required" — Update Now se fresh cache + reload.
 */
export function PwaUpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);
  const [updating, setUpdating] = useState(false);
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
            if (!cancelled) setNeedRefresh(true);
          },
          onOfflineReady() {
            /* precache ready for offline */
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
        if (!cancelled) setUpdateSW(() => sw);
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
      updateSW?.(true);
    } catch {
      window.location.reload();
    }
  };

  if (!needRefresh) return null;

  if (isApp) {
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
            Website pe naye changes / pages live hain. Update Now dabao — MARBLEX app latest
            version pe aa jayegi.
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

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[10050] flex justify-center px-3">
      <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#0a3d52]/20 bg-[#0a3d52] px-3.5 py-2.5 text-white shadow-xl">
        <SystemUpdateAltRoundedIcon sx={{ fontSize: 20 }} className="text-[#ff8c73]" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold">Update available</p>
          <p className="text-[10px] text-slate-300">Naye pages / changes ready hain.</p>
        </div>
        <button
          type="button"
          disabled={updating}
          className="rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-[#0a3d52] disabled:opacity-70"
          onClick={applyUpdate}
        >
          {updating ? "…" : "Update"}
        </button>
        <button
          type="button"
          className="text-[10px] font-semibold text-slate-300"
          onClick={() => setNeedRefresh(false)}
        >
          Later
        </button>
      </div>
    </div>
  );
}
