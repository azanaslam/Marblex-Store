import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../config/constants";
import { getAuthToken, getAuthUser, setAuthSession } from "../../auth/session";

const pathToPortalView = (pathname) => {
  const segment = pathname.replace(/^\/dashboard\/?/, "").split("/")[0] || "";
  const map = {
    "": "overview",
    overview: "overview",
    orders: "orders",
    quotes: "quotes",
    documents: "docs",
    support: "support",
    favorites: "favs",
    account: "account",
    partner: "overview",
    notifications: "notifs",
  };
  return map[segment] || "overview";
};

const sameUser = (a, b) => {
  try {
    return JSON.stringify(a || null) === JSON.stringify(b || null);
  } catch {
    return false;
  }
};

export const PortalHost = () => {
  const token = getAuthToken();
  const location = useLocation();
  const iframeRef = useRef(null);
  const lastInitKeyRef = useRef("");

  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "MARBLEX_AUTH_SYNC" || !e.data.user) return;
      const t = getAuthToken();
      if (!t) return;
      const prev = getAuthUser() || {};
      const next = { ...prev, ...e.data.user };
      if (sameUser(prev, next)) return;
      setAuthSession({ token: t, user: next });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !token) return;

    const user = getAuthUser();
    const view = pathToPortalView(location.pathname);
    const initKey = `${token}|${location.pathname}`;

    const payload = {
      type: "MARBLEX_PORTAL_INIT",
      path: location.pathname,
      view,
      embedded: true,
      theme: localStorage.getItem("marblex_theme") || "light",
      apiBase: API_BASE_URL,
      token,
      user: user
        ? {
            name: user.name,
            co: user.company || user.email || "MARBLEX Portal",
            company: user.company || "",
            email: user.email,
            phone: user.phone || "",
            ind: user.industryType || "",
            city: user.city || "",
            ntn: user.ntn || "",
            strn: user.strn || "",
            gender: user.gender || "prefer_not_to_say",
            avatarUrl: user.avatarUrl || "",
          }
        : null,
    };

    const post = () => {
      try {
        iframe.contentWindow?.postMessage(payload, window.location.origin);
        lastInitKeyRef.current = initKey;
      } catch {
        /* ignore */
      }
    };

    const onLoad = () => post();
    iframe.addEventListener("load", onLoad);

    // Only re-init when route/token changes — not on every parent re-render
    if (lastInitKeyRef.current !== initKey) {
      post();
    }

    return () => iframe.removeEventListener("load", onLoad);
  }, [token, location.pathname]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="mx-portal-host relative flex w-full flex-1 flex-col overflow-hidden bg-[#06212b]">
      <iframe
        ref={iframeRef}
        title="MARBLEX Client Portal"
        src="/marblex-client-portal.html?v=ord-m2"
        className="mx-portal-frame block w-full flex-1 border-0"
        style={{
          minHeight: "min(100dvh - 7.25rem, 960px)",
          height: "calc(100dvh - 7.25rem)",
          background: "#06212b",
        }}
      />
    </div>
  );
};
