import { useCallback, useEffect, useState } from "react";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";

const PREF_KEY = "marblex_push_pref";

/**
 * Client-side notification opt-in (local + future Web Push ready).
 * Works great in installed PWA for order / quote reminders.
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

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, []);

  const enable = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPerm(result);
    if (result === "granted") {
      try {
        localStorage.setItem(PREF_KEY, "1");
      } catch {
        /* ignore */
      }
      setEnabled(true);
      try {
        new Notification("MARBLEX alerts on", {
          body: "Order & quote updates is app me milenge.",
          icon: "/logo-icon.png",
          badge: "/marblex-mark.png",
          tag: "marblex-welcome",
        });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const disable = () => {
    try {
      localStorage.setItem(PREF_KEY, "0");
    } catch {
      /* ignore */
    }
    setEnabled(false);
  };

  if (typeof window === "undefined") return null;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isDark
          ? "border-slate-700 bg-[#0c222e]"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
          {enabled && perm === "granted" ? (
            <NotificationsActiveRoundedIcon sx={{ fontSize: 22 }} />
          ) : (
            <NotificationsOffRoundedIcon sx={{ fontSize: 22 }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-sm font-bold text-[#0a3d52] dark:text-white">
            App notifications
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Quotes, dispatch alerts aur survey follow-ups — installed app me native feel.
          </p>
          {perm === "denied" ? (
            <p className="mt-2 text-[11px] font-semibold text-amber-600">
              Browser ne block kiya — Settings → Notifications se allow karo.
            </p>
          ) : (
            <button
              type="button"
              onClick={enabled ? disable : enable}
              className={`mt-2.5 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${
                enabled
                  ? "border border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                  : "bg-[#0a3d52] text-white"
              }`}
            >
              {enabled ? "Disable alerts" : "Enable alerts"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Helper for other modules to fire a local notification if user opted in */
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
