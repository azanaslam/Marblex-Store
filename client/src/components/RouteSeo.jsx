import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "MARBLEX";
const DEFAULT_DESC =
  "MARBLEX supplies construction chemicals, waterproofing membranes, waterstops, flooring systems and technical rubber solutions across Pakistan.";

const ROUTE_SEO = {
  "/": {
    title: `${SITE} | Construction Chemicals, Waterproofing & Rubber Industry Pakistan`,
    description: DEFAULT_DESC,
  },
  "/services": {
    title: `Services | ${SITE}`,
    description: "Waterproofing, flooring, waterstop and construction chemical services from MARBLEX.",
  },
  "/about": {
    title: `About Us | ${SITE}`,
    description: "Learn about MARBLEX Chemical & Rubber Industry — engineering-grade materials for Pakistan.",
  },
  "/catalogs": {
    title: `Catalogs & Brochures | ${SITE}`,
    description: "Download MARBLEX product catalogs and technical brochures.",
  },
  "/blogs": {
    title: `Blogs & Insights | ${SITE}`,
    description: "Technical articles and project stories from MARBLEX.",
  },
  "/contact": {
    title: `Contact | ${SITE}`,
    description: "Contact MARBLEX sales and support for quotes, deliveries and technical guidance.",
  },
  "/cart": {
    title: `Checkout | ${SITE}`,
    description: "Complete your MARBLEX order with COD, JazzCash, Easypaisa, bank transfer or card.",
  },
  "/login": {
    title: `Login | ${SITE}`,
    description: "Sign in to your MARBLEX customer account.",
  },
};

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sets document title + description per route (SPA SEO baseline). */
export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const basePath = pathname.startsWith("/blogs/")
      ? "/blogs"
      : pathname.startsWith("/product/")
      ? "/"
      : pathname;

    const seo = ROUTE_SEO[basePath] || {
      title: `${SITE} | Construction Chemical & Rubber Industry`,
      description: DEFAULT_DESC,
    };

    document.title = seo.title;
    upsertMeta("name", "description", seo.description);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);

    // Hide admin / private areas from indexing hints
    const noIndex =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/payment");
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
  }, [pathname]);

  return null;
}
