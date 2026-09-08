"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type WishlistItem = { id: string; name: string; price: number; image?: string };

type WishlistContextValue = {
  items: WishlistItem[];
  isSaved: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("celibery-wishlist");
    if (stored) {
      try {
        setItems(JSON.parse(stored) as WishlistItem[]);
      } catch {
        // ignore corrupted storage
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("celibery-wishlist", JSON.stringify(items));
  }, [items, hydrated]);

  const isSaved = (id: string) => items.some((item) => item.id === id);

  const toggleItem = (item: WishlistItem) => {
    setItems((current) => current.some((entry) => entry.id === item.id)
      ? current.filter((entry) => entry.id !== item.id)
      : [...current, item]);
  };

  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));

  return <WishlistContext.Provider value={{ items, isSaved, toggleItem, removeItem }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
