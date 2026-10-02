import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../../auth/session";

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
  };
  return map[segment] || "overview";
};

export const PortalHost = () => {
  const token = getAuthToken();
  const user = getAuthUser();
  const location = useLocation();
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !token) return;

    const payload = {
      type: "MARBLEX_PORTAL_INIT",
      path: location.pathname,
      view: pathToPortalView(location.pathname),
      user: user
        ? {
            name: user.name,
            co: user.company || user.email || "MARBLEX Portal",
            company: user.company,
            email: user.email,
            phone: user.phone || "",
          }
        : null,
    };

    const post = () => {
      try {
        iframe.contentWindow?.postMessage(payload, window.location.origin);
      } catch {
        /* cross-origin guard */
      }
    };

    iframe.addEventListener("load", post);
    post();
    return () => iframe.removeEventListener("load", post);
  }, [token, user, location.pathname]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <iframe
      ref={iframeRef}
      title="MARBLEX Client Portal"
      src="/marblex-client-portal.html"
      className="mx-portal-frame"
      style={{
        display: "block",
        width: "100%",
        border: 0,
        minHeight: "100dvh",
        height: "100dvh",
        background: "#06212b",
      }}
    />
  );
};
