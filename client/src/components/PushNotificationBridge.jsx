import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, onAuthSessionChangeEvent } from "../auth/session";
import { getIsStandaloneApp } from "../hooks/useStandaloneApp";
import { resyncPushSubscriptionIfEnabled } from "../push/webPush";
import { NOTIFS_CHANGED_EVENT } from "../notifications/broadcastSeen";
import { authHeaders, http } from "../api/http";

export const updateAppBadge = (count) => {
  if (typeof navigator === "undefined") return;
  try {
    if ("setAppBadge" in navigator) {
      if (Number(count) > 0) {
        navigator.setAppBadge(Number(count)).catch(() => {});
      } else if ("clearAppBadge" in navigator) {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  } catch {}
};

/**
 * - SW notificationclick → in-app navigate
 * - Re-bind push only inside installed MARBLEX app (never Chrome tab)
 * - Updates OS app badge (navigator.setAppBadge) for unread notifications
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
    const syncBadge = async () => {
      const token = getAuthToken();
      if (!token) {
        updateAppBadge(0);
        return;
      }
      try {
        const headers = authHeaders(token);
        const inboxRes = await http.get("/chat/inbox", headers).catch(() => null);
        const unreadChat = Array.isArray(inboxRes?.data?.messages) ? inboxRes.data.messages.length : 0;
        updateAppBadge(unreadChat);
      } catch {
        /* ignore */
      }
    };

    syncBadge();
    window.addEventListener(NOTIFS_CHANGED_EVENT, syncBadge);
    window.addEventListener(onAuthSessionChangeEvent, syncBadge);
    return () => {
      window.removeEventListener(NOTIFS_CHANGED_EVENT, syncBadge);
      window.removeEventListener(onAuthSessionChangeEvent, syncBadge);
    };
  }, []);

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
