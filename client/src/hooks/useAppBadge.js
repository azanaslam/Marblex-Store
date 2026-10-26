import { useEffect } from "react";

/** Sync OS app-icon badge with cart (+ optional notif) count when installed */
export function useAppBadge(count = 0) {
  useEffect(() => {
    const n = Math.max(0, Number(count) || 0);
    try {
      if (!("setAppBadge" in navigator)) return;
      if (n > 0) navigator.setAppBadge(n);
      else if ("clearAppBadge" in navigator) navigator.clearAppBadge();
    } catch {
      /* unsupported */
    }
  }, [count]);
}
