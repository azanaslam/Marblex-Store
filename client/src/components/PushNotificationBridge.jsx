import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthSessionChangeEvent } from "../auth/session";
import { getIsStandaloneApp } from "../hooks/useStandaloneApp";
import { resyncPushSubscriptionIfEnabled } from "../push/webPush";

/**
 * - SW notificationclick → in-app navigate
 * - Re-bind push only inside installed MARBLEX app (never Chrome tab)
 */
export function PushNotificationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const onMessage = (event) => {
      const data = event?.data;
      if (!data || data.type !== "MARBLEX_NOTIFICATION_CLICK") return;
      const url = typeof data.url === "string" ? data.url : "/";
      try {
        const path = url.startsWith("http")
          ? new URL(url).pathname + new URL(url).search
          : url;
        navigate(path || "/");
      } catch {
        navigate("/");
      }
    };

    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", onMessage);
  }, [navigate]);

  useEffect(() => {
    const sync = () => {
      if (!getIsStandaloneApp()) return;
      resyncPushSubscriptionIfEnabled();
    };
    // After splash / SW ready
    const t = window.setTimeout(sync, 1500);
    window.addEventListener(onAuthSessionChangeEvent, sync);
    window.addEventListener("appinstalled", sync);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(onAuthSessionChangeEvent, sync);
      window.removeEventListener("appinstalled", sync);
    };
  }, []);

  return null;
}
