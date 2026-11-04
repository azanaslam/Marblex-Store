import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "marblex_pwa_prompt_dismissed";
const INSTALLED_KEY = "marblex_pwa_installed";

export function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

export function clearInstalledFlag() {
  try {
    localStorage.removeItem(INSTALLED_KEY);
  } catch {
    /* ignore */
  }
}

export function markInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, "1");
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

async function relatedAppInstalled() {
  if (typeof navigator === "undefined" || !navigator.getInstalledRelatedApps) {
    return null;
  }
  try {
    const apps = await navigator.getInstalledRelatedApps();
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return null;
  }
}

async function resolveInstalled(hasDeferredPrompt) {
  if (isStandalone()) return true;
  if (hasDeferredPrompt) {
    clearInstalledFlag();
    return false;
  }
  const related = await relatedAppInstalled();
  if (related === true) {
    markInstalled();
    return true;
  }
  if (related === false) {
    clearInstalledFlag();
    return false;
  }
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

let sharedDeferred = null;
const deferredListeners = new Set();
const installedListeners = new Set();
let sharedInstalled = typeof window !== "undefined" ? isStandalone() : false;

function setSharedDeferred(event) {
  sharedDeferred = event;
  deferredListeners.forEach((fn) => fn(event));
}

function setSharedInstalled(value) {
  sharedInstalled = value;
  installedListeners.forEach((fn) => fn(value));
}

function subscribeDeferred(fn) {
  deferredListeners.add(fn);
  fn(sharedDeferred);
  return () => deferredListeners.delete(fn);
}

function subscribeInstalled(fn) {
  installedListeners.add(fn);
  fn(sharedInstalled);
  return () => installedListeners.delete(fn);
}

let bootstrapped = false;
let readyFlag = false;
const readyListeners = new Set();

function setReadyFlag(v) {
  readyFlag = v;
  readyListeners.forEach((fn) => fn(v));
}

function subscribeReady(fn) {
  readyListeners.add(fn);
  fn(readyFlag);
  return () => readyListeners.delete(fn);
}

function bootstrapInstallListeners() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  const sync = async () => {
    const next = await resolveInstalled(!!sharedDeferred);
    setSharedInstalled(next);
    setReadyFlag(true);
  };

  sync();

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    clearInstalledFlag();
    setSharedDeferred(e);
    setSharedInstalled(false);
    setReadyFlag(true);
  });

  window.addEventListener("appinstalled", () => {
    markInstalled();
    setSharedInstalled(true);
    setSharedDeferred(null);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") sync();
  });
}

export function useInstallState() {
  const [deferred, setDeferred] = useState(sharedDeferred);
  const [installed, setInstalled] = useState(() => sharedInstalled || isStandalone());
  const [ready, setReady] = useState(readyFlag);

  useEffect(() => {
    bootstrapInstallListeners();
    return subscribeDeferred(setDeferred);
  }, []);
  useEffect(() => subscribeInstalled(setInstalled), []);
  useEffect(() => subscribeReady(setReady), []);

  const requestInstall = useCallback(async () => {
    const promptEvent = sharedDeferred || deferred;
    if (promptEvent) {
      promptEvent.prompt();
      try {
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === "accepted") {
          markInstalled();
          setSharedInstalled(true);
        }
      } catch {
        /* dismissed */
      }
      setSharedDeferred(null);
      return "prompted";
    }
    return "help";
  }, [deferred]);

  return { deferred, installed, ready, requestInstall };
}
