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
      embedded: true,
      theme: localStorage.getItem("marblex_theme") || "light",
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
        /* ignore */
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
    <div className="mx-portal-host relative flex w-full flex-1 flex-col overflow-hidden bg-[#06212b]">
      <iframe
        ref={iframeRef}
        title="MARBLEX Client Portal"
        src="/marblex-client-portal.html"
        className="mx-portal-frame block w-full flex-1 border-0"
        style={{
          minHeight: "min(100dvh - 7.5rem, 900px)",
          height: "calc(100dvh - 7.5rem)",
          background: "#06212b",
        }}
      />
    </div>
  );
};
