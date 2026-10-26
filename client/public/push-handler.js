/* global self, clients */
/**
 * Loaded into the generated service worker via vite-plugin-pwa importScripts.
 * Shows OS notifications when app is closed / backgrounded, and opens the right page on tap.
 */

self.addEventListener("push", (event) => {
  let data = {
    title: "MARBLEX",
    body: "You have a new update",
    url: "/",
    tag: "marblex",
    icon: "/logo-icon.png",
    badge: "/marblex-mark.png",
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    try {
      const text = event.data && event.data.text();
      if (text) data.body = text;
    } catch {
      /* ignore */
    }
  }

  const options = {
    body: data.body || "",
    icon: data.icon || "/logo-icon.png",
    badge: data.badge || "/marblex-mark.png",
    tag: data.tag || "marblex",
    renotify: true,
    // Helps Android show under installed MARBLEX WebAPK, not a bare Chrome channel
    lang: "en",
    dir: "ltr",
    data: { url: data.url || "/", source: "marblex-pwa" },
    vibrate: [120, 60, 120],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "MARBLEX", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.url) || "/";
  const targetUrl = new URL(raw, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          try {
            client.postMessage({ type: "MARBLEX_NOTIFICATION_CLICK", url: raw });
          } catch {
            /* ignore */
          }
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
              return;
            } catch {
              /* fall through */
            }
          }
          return;
        }
      }
      if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })()
  );
});
