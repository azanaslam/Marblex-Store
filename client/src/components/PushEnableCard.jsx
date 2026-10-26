import { useCallback, useEffect, useState } from "react";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";
import { subscribeWebPush } from "../push/webPush";

const PREF_KEY = "marblex_push_pref";

/**
 * Opt-in for phone notifications (works when app is closed).
 * After enable → card disappears from hamburger.
 */
export function PushEnableCard({ isDark = false }) {
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(PREF_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, []);

  const enable = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    setBusy(true);
    setError("");
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result !== "granted") {
        setError("Permission denied. Allow notifications in phone settings.");
        return;
      }
      await subscribeWebPush();
      setEnabled(true);
      try {
        // Local welcome only (also confirms OS permission works)
        new Notification("MARBLEX alerts on", {
          body: "You will get messages and updates even when the app is closed.",
          icon: "/logo-icon.png",
          badge: "/marblex-mark.png",
          tag: "marblex-welcome",
        });
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e?.message || "Could not enable push. Try again on HTTPS / installed app.");
    } finally {
      setBusy(false);
    }
  }, []);

  if (typeof window === "undefined") return null;

  if (enabled && perm === "granted") return null;

  if (perm === "denied") {
    return (
      <div
        className={`rounded-2xl border p-3.5 ${
          isDark ? "border-slate-700 bg-[#0c222e]" : "border-slate-200 bg-white"
        }`}
      >
        <p className="text-[11px] font-semibold text-amber-600">
          Notifications blocked. Allow them in phone Settings → Apps → MARBLEX.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isDark ? "border-slate-700 bg-[#0c222e]" : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
          <NotificationsOffRoundedIcon sx={{ fontSize: 22 }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-sm font-bold text-[#0a3d52] dark:text-white">
            App notifications
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Get chat replies and announcements on your phone — even when MARBLEX is closed.
          </p>
          {error ? (
            <p className="mt-2 text-[11px] font-semibold text-amber-600">{error}</p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={enable}
            className="mt-2.5 rounded-xl bg-[#0a3d52] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white disabled:opacity-60"
          >
            {busy ? "Enabling…" : "Enable alerts"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function notifyMarblex(title, body, tag = "marblex") {
  try {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (localStorage.getItem(PREF_KEY) !== "1") return;
    new Notification(title, {
      body,
      icon: "/logo-icon.png",
      badge: "/marblex-mark.png",
      tag,
    });
  } catch {
    /* ignore */
  }
}
