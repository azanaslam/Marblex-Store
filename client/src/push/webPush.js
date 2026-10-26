import { http, authHeaders } from "../api/http";
import { getAuthToken } from "../auth/session";
import { getIsStandaloneApp } from "../hooks/useStandaloneApp";

const PREF_KEY = "marblex_push_pref";
const APP_SUB_KEY = "marblex_push_app_bound";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

async function getVapidPublicKey() {
  const fromEnv = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (fromEnv) return String(fromEnv).trim();
  const { data } = await http.get("/push/vapid-public-key");
  return data?.publicKey || "";
}

/**
 * Show notification via Service Worker so Android attributes it to
 * the installed MARBLEX app (not "Google Chrome").
 */
export async function showAppNotification(title, options = {}) {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification(title, {
    icon: "/logo-icon.png",
    badge: "/marblex-mark.png",
    ...options,
  });
  return true;
}

/**
 * Subscribe ONLY from the installed MARBLEX app (standalone).
 * Browser/Chrome-tab subscriptions show as "Chrome" — we refuse those.
 */
export async function subscribeWebPush({ forceFresh = true } = {}) {
  if (typeof window === "undefined") return null;

  if (!getIsStandaloneApp()) {
    throw new Error(
      "Open the installed MARBLEX app from your home screen, then enable alerts. Notifications from Chrome browser show as Google Chrome."
    );
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push not supported on this device");
  }
  if (Notification.permission !== "granted") {
    throw new Error("Notification permission not granted");
  }

  const publicKey = await getVapidPublicKey();
  if (!publicKey) throw new Error("VAPID public key missing on server");

  const reg = await navigator.serviceWorker.ready;

  // Drop any old Chrome-tab subscription so the new one is bound to the installed app
  if (forceFresh) {
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      const oldEndpoint = existing.endpoint;
      try {
        await existing.unsubscribe();
      } catch {
        /* ignore */
      }
      const token = getAuthToken();
      try {
        await http.post(
          "/push/unsubscribe",
          { endpoint: oldEndpoint },
          token ? authHeaders(token) : undefined
        );
      } catch {
        /* ignore */
      }
    }
  }

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const payload = sub.toJSON();
  const token = getAuthToken();
  await http.post(
    "/push/subscribe",
    {
      endpoint: payload.endpoint,
      keys: payload.keys,
      client: "marblex-pwa",
      standalone: true,
    },
    token ? authHeaders(token) : undefined
  );

  try {
    localStorage.setItem(PREF_KEY, "1");
    localStorage.setItem(APP_SUB_KEY, "1");
  } catch {
    /* ignore */
  }

  return sub;
}

export async function unsubscribeWebPush() {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  const endpoint = sub.endpoint;
  try {
    await sub.unsubscribe();
  } catch {
    /* ignore */
  }

  const token = getAuthToken();
  try {
    await http.post("/push/unsubscribe", { endpoint }, token ? authHeaders(token) : undefined);
  } catch {
    /* ignore */
  }

  try {
    localStorage.setItem(PREF_KEY, "0");
    localStorage.removeItem(APP_SUB_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Only when running as installed app + user already opted in.
 * Never auto-subscribe from a Chrome browser tab.
 */
export async function resyncPushSubscriptionIfEnabled() {
  try {
    if (!getIsStandaloneApp()) return;
    if (localStorage.getItem(PREF_KEY) !== "1") return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    // Fresh bind once per app install session if not yet marked app-bound
    const forceFresh = localStorage.getItem(APP_SUB_KEY) !== "1";
    await subscribeWebPush({ forceFresh });
  } catch {
    /* ignore */
  }
}
