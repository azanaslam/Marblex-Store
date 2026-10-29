const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

let initialized = false;

export const initAnalytics = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Initialize GA4 if ID is provided
  if (GA_ID) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { send_page_view: false });
  }

  // Initialize Meta Pixel if ID is provided
  if (PIXEL_ID) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", PIXEL_ID);
  }
};

const FB_EVENT_MAP = {
  page_view: "PageView",
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  generate_lead: "Lead",
};

/**
 * Universal tracking function across GA4 and Meta Pixel
 * @param {string} event - "page_view" | "view_item" | "add_to_cart" | "begin_checkout" | "purchase" | "generate_lead"
 * @param {object} params - Event parameters
 */
export const track = (event, params = {}) => {
  if (typeof window === "undefined") return;

  // 1. GA4
  if (typeof window.gtag === "function" && GA_ID) {
    window.gtag("event", event, params);
  }

  // 2. Meta Pixel
  if (typeof window.fbq === "function" && PIXEL_ID) {
    const fbStandardEvent = FB_EVENT_MAP[event];
    if (fbStandardEvent) {
      window.fbq("track", fbStandardEvent, params);
    } else {
      window.fbq("trackCustom", event, params);
    }
  }
};

