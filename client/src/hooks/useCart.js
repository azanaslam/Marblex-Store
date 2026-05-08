import { useEffect, useState } from "react";

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

  const addToCart = (product) => {
    const qtyToAdd = product.quantity || 1;
    const existing = cart.find((item) => item.productId === product._id);
    const next = existing
      ? cart.map((item) => (item.productId === product._id ? { ...item, quantity: item.quantity + qtyToAdd, imageUrl: item.imageUrl || product.imageUrl } : item))
      : [...cart, { productId: product._id, name: product.name, price: product.price, quantity: qtyToAdd, imageUrl: product.imageUrl }];
    setCart(next);
  };

  return { cart, setCart, addToCart };
};
