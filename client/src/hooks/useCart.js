import { useCallback, useEffect, useState } from "react";

const CART_KEY = "marblex_cart";

const loadInitialCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useCart = () => {
  const [cart, setCart] = useState(loadInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product) => {
    const qtyToAdd = product.quantity || 1;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + qtyToAdd, imageUrl: item.imageUrl || product.imageUrl }
            : item
        );
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, price: product.price, quantity: qtyToAdd, imageUrl: product.imageUrl },
      ];
    });
  }, []);

  return { cart, setCart, addToCart };
};
