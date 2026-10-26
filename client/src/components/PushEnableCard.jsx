import { useCallback, useEffect, useState } from "react";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";
import { getIsStandaloneApp } from "../hooks/useStandaloneApp";
import { showAppNotification, subscribeWebPush } from "../push/webPush";

const PREF_KEY = "marblex_push_pref";

/**
 * Opt-in ONLY inside the installed MARBLEX app (not Chrome browser tab).
 * After enable → card disappears. Push then shows as MARBLEX on the phone.
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
  const isApp = getIsStandaloneApp();

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, []);

  const enable = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    if (!getIsStandaloneApp()) {
      setError("Open MARBLEX from the home-screen app icon (not Chrome), then enable alerts.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result !== "granted") {
        setError("Permission denied. In the popup choose Allow for MARBLEX.");
        return;
      }
      await subscribeWebPush({ forceFresh: true });
      setEnabled(true);
      // Must use Service Worker notification — page Notification() shows as Chrome
      await showAppNotification("MARBLEX alerts on", {
        body: "Messages and updates will appear as MARBLEX — even when the app is closed.",
        tag: "marblex-welcome",
      });
    } catch (e) {
      setError(e?.message || "Could not enable app alerts. Open the installed MARBLEX app and try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  if (typeof window === "undefined") return null;

  // Never offer Chrome-tab push — that attributes to Google Chrome
  if (!isApp) return null;

  if (enabled && perm === "granted") return null;

  if (perm === "denied") {
    return (
      <div
        className={`rounded-2xl border p-3.5 ${
          isDark ? "border-slate-700 bg-[#0c222e]" : "border-slate-200 bg-white"
        }`}
      >
        <p className="text-[11px] font-semibold text-amber-600">
          Notifications blocked. Phone Settings → Apps → MARBLEX → Notifications → Allow.
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
            Allow once — alerts show as <b>MARBLEX</b> on your phone (not Chrome), even when the
            app is closed.
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
    if (!getIsStandaloneApp()) return;
    showAppNotification(title, { body, tag }).catch(() => {});
  } catch {
    /* ignore */
  }
}
