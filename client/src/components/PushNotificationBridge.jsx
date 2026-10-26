import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthSessionChangeEvent } from "../auth/session";
import { resyncPushSubscriptionIfEnabled } from "../push/webPush";

/**
 * - Listens for SW notificationclick → navigate inside the app
 * - Re-links push subscription to user after login
 */
export function PushNotificationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const onMessage = (event) => {
      const data = event?.data;
      if (!data || data.type !== "MARBLEX_NOTIFICATION_CLICK") return;
      const url = typeof data.url === "string" ? data.url : "/";
      try {
        const path = url.startsWith("http") ? new URL(url).pathname + new URL(url).search : url;
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
      resyncPushSubscriptionIfEnabled();
    };
    sync();
    window.addEventListener(onAuthSessionChangeEvent, sync);
    return () => window.removeEventListener(onAuthSessionChangeEvent, sync);
  }, []);

  return null;
}
