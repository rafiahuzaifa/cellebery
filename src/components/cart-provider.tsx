"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { createLocalStorageList } from "@/lib/local-storage-list";

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
const store = createLocalStorageList<CartItem>("celibery-cart");

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const existing = items.find((entry) => entry.id === item.id);
    store.set(existing
      ? items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry)
      : [...items, { ...item, quantity: 1 }]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    store.set(quantity > 0 ? items.map((item) => item.id === id ? { ...item, quantity } : item) : items.filter((item) => item.id !== id));
  };

  const removeItem = (id: string) => store.set(items.filter((item) => item.id !== id));
  const clearCart = () => store.set([]);

  return <CartContext.Provider value={{ items, itemCount: items.reduce((total, item) => total + item.quantity, 0), addItem, updateQuantity, removeItem, clearCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
