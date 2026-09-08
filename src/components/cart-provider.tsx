"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { id: string; name: string; price: number; quantity: number; image?: string };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem("celibery-cart");
    return stored ? JSON.parse(stored) as CartItem[] : [];
  });

  useEffect(() => {
    window.localStorage.setItem("celibery-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((current) => quantity > 0 ? current.map((item) => item.id === id ? { ...item, quantity } : item) : current.filter((item) => item.id !== id));
  };

  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const clearCart = () => setItems([]);

  return <CartContext.Provider value={{ items, itemCount: items.reduce((total, item) => total + item.quantity, 0), addItem, updateQuantity, removeItem, clearCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
