import { useCallback, useEffect, useState } from "react";
import { getAuthUser, onAuthSessionChangeEvent } from "../auth/session";

const GUEST_CART_KEY = "marblex_cart";

export const mergeCartLists = (targetList = [], sourceList = []) => {
  const mergedMap = new Map();

  targetList.forEach((item) => {
    const id = item.productId || item._id || item.id;
    if (id) {
      mergedMap.set(String(id), {
        ...item,
        productId: id,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      });
    }
  });

  sourceList.forEach((item) => {
    const id = item.productId || item._id || item.id;
    if (id) {
      const key = String(id);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        mergedMap.set(key, {
          ...existing,
          quantity: existing.quantity + qty,
          imageUrl: existing.imageUrl || item.imageUrl,
          price: existing.price || item.price,
          name: existing.name || item.name,
        });
      } else {
        mergedMap.set(key, {
          ...item,
          productId: id,
          quantity: qty,
        });
      }
    }
  });

  return Array.from(mergedMap.values());
};

const loadInitialCart = () => {
  try {
    const user = getAuthUser();
    const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
    
    if (user?.id || user?._id) {
      const userKey = `marblex_cart_user_${user.id || user._id}`;
      const userCart = JSON.parse(localStorage.getItem(userKey) || "[]");
      const merged = mergeCartLists(userCart, guestCart);
      return Array.isArray(merged) ? merged : [];
    }

    return Array.isArray(guestCart) ? guestCart : [];
  } catch {
    return [];
  }
};

export const useCart = () => {
  const [cart, setCart] = useState(loadInitialCart);

  // Sync with localStorage on cart change
  useEffect(() => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      const user = getAuthUser();
      if (user?.id || user?._id) {
        localStorage.setItem(`marblex_cart_user_${user.id || user._id}`, JSON.stringify(cart));
      }
    } catch {
      // ignore storage write errors
    }
  }, [cart]);

  // Listen to Auth State changes (e.g. login/logout) to merge guest cart into user account cart
  useEffect(() => {
    const handleAuthChange = () => {
      const user = getAuthUser();
      if (user?.id || user?._id) {
        const userKey = `marblex_cart_user_${user.id || user._id}`;
        let userCart = [];
        try {
          userCart = JSON.parse(localStorage.getItem(userKey) || "[]");
        } catch {}

        setCart((currentCart) => {
          const merged = mergeCartLists(userCart, currentCart);
          try {
            localStorage.setItem(userKey, JSON.stringify(merged));
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    };

    window.addEventListener(onAuthSessionChangeEvent, handleAuthChange);
    return () => {
      window.removeEventListener(onAuthSessionChangeEvent, handleAuthChange);
    };
  }, []);

  // Keep React cart in sync when portal iframe reorders / updates cart.
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "MARBLEX_CART_UPDATE") return;
      if (Array.isArray(e.data.cart)) {
        setCart(e.data.cart);
        return;
      }
      setCart(loadInitialCart());
    };
    const onStorage = (e) => {
      if (e.key !== GUEST_CART_KEY && !(e.key || "").startsWith("marblex_cart_user_")) return;
      setCart(loadInitialCart());
    };
    window.addEventListener("message", onMsg);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const addToCart = useCallback((product) => {
    const qtyToAdd = Math.max(1, parseInt(product.quantity, 10) || 1);
    const prodId = product._id || product.productId || product.id;

    setCart((prev) => {
      const existing = prev.find((item) => (item.productId || item._id) === prodId);
      if (existing) {
        return prev.map((item) =>
          (item.productId || item._id) === prodId
            ? { ...item, quantity: item.quantity + qtyToAdd, imageUrl: item.imageUrl || product.imageUrl }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: prodId,
          name: product.name,
          price: product.price,
          quantity: qtyToAdd,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify([]));
      const user = getAuthUser();
      if (user?.id || user?._id) {
        localStorage.setItem(`marblex_cart_user_${user.id || user._id}`, JSON.stringify([]));
      }
    } catch {}
  }, []);

  return { cart, setCart, addToCart, clearCart };
};
