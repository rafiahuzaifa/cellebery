"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { createLocalStorageList } from "@/lib/local-storage-list";

export type WishlistItem = { id: string; name: string; price: number; image?: string };

type WishlistContextValue = {
  items: WishlistItem[];
  isSaved: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const store = createLocalStorageList<WishlistItem>("celibery-wishlist");

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const isSaved = (id: string) => items.some((item) => item.id === id);

  const toggleItem = (item: WishlistItem) => {
    store.set(items.some((entry) => entry.id === item.id)
      ? items.filter((entry) => entry.id !== item.id)
      : [...items, item]);
  };

  const removeItem = (id: string) => store.set(items.filter((item) => item.id !== id));

  return <WishlistContext.Provider value={{ items, isSaved, toggleItem, removeItem }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
