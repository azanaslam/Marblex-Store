import { http, authHeaders } from "../api/http";
import { getAuthToken } from "../auth/session";

const PREF_KEY = "marblex_push_pref";

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
 * Subscribe this device for Web Push (works when app is closed).
 * Call after Notification.permission === 'granted'.
 */
export async function subscribeWebPush() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push not supported on this browser");
  }
  if (Notification.permission !== "granted") {
    throw new Error("Notification permission not granted");
  }

  const publicKey = await getVapidPublicKey();
  if (!publicKey) throw new Error("VAPID public key missing on server");

  const reg = await navigator.serviceWorker.ready;
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
    },
    token ? authHeaders(token) : undefined
  );

  try {
    localStorage.setItem(PREF_KEY, "1");
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
  } catch {
    /* ignore */
  }
}

/** Re-sync subscription when user logs in (link device to account) */
export async function resyncPushSubscriptionIfEnabled() {
  try {
    if (localStorage.getItem(PREF_KEY) !== "1") return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    await subscribeWebPush();
  } catch {
    /* ignore */
  }
}
