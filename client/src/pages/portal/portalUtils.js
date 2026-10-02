export const PORTAL_TEAL = "#0b2f3c";
export const PORTAL_ACCENT = "#ff6b47";

export const ORDER_STATUS_COLOR = {
  pending: "warning",
  processing: "info",
  "on the way": "secondary",
  delivered: "success",
  cancelled: "error",
};

export const QUOTE_STATUS_COLOR = {
  submitted: "warning",
  reviewing: "info",
  quoted: "secondary",
  accepted: "success",
  rejected: "error",
  converted: "success",
};

export const TICKET_STATUS_COLOR = {
  open: "warning",
  waiting: "info",
  closed: "default",
};

export const formatMoney = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export const formatPkt = (date) =>
  date
    ? new Date(date).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " (PKT)"
    : "—";

export const orderLabel = (order) =>
  order?.orderNumber || (order?._id ? `#${String(order._id).slice(-6).toUpperCase()}` : "Order");

export const CART_KEY = "marblex_cart";

export const pushToCart = (items = []) => {
  const existing = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const merged = [...existing];
  items.forEach((inc) => {
    const idx = merged.findIndex((m) => String(m.productId) === String(inc.productId));
    if (idx >= 0) {
      merged[idx] = {
        ...merged[idx],
        quantity: Number(merged[idx].quantity || 0) + Number(inc.quantity || 1),
      };
    } else {
      merged.push({
        productId: inc.productId,
        name: inc.name,
        price: inc.price,
        quantity: Number(inc.quantity) || 1,
        imageUrl: inc.imageUrl || "",
      });
    }
  });
  localStorage.setItem(CART_KEY, JSON.stringify(merged));
  return merged;
};

export const reorderToCart = (order) =>
  pushToCart(
    (order.items || []).map((item) => ({
      productId: item.productId || `${order._id}-${item.name}`,
      name: item.name,
      price: item.price,
      quantity: Number(item.quantity) || 1,
      imageUrl: item.imageUrl || "",
    }))
  );
