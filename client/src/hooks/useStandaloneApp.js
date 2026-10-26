import { useEffect, useState } from "react";

export function getIsStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true ||
    // Android WebAPK / TWA launch
    (typeof document !== "undefined" &&
      typeof document.referrer === "string" &&
      document.referrer.startsWith("android-app://"))
  );
}

/** True when MARBLEX is running as an installed PWA / home-screen app */
export function useStandaloneApp() {
  const [standalone, setStandalone] = useState(() => getIsStandaloneApp());

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const sync = () => setStandalone(getIsStandaloneApp());
    sync();
    mq.addEventListener?.("change", sync);
    window.addEventListener("appinstalled", sync);
    return () => {
      mq.removeEventListener?.("change", sync);
      window.removeEventListener("appinstalled", sync);
    };
  }, []);

  return standalone;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
