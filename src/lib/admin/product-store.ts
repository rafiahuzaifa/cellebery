"use client";

import { useSyncExternalStore } from "react";
import { createLocalStorageList } from "@/lib/local-storage-list";
import { type AdminProduct, seedAdminProducts } from "@/lib/admin/catalog";

const store = createLocalStorageList<AdminProduct>("celibery-admin-products", seedAdminProducts);

export function useAdminProducts() {
  const products = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const upsert = (product: AdminProduct) => {
    const exists = products.some((entry) => entry.id === product.id);
    store.set(exists ? products.map((entry) => entry.id === product.id ? product : entry) : [product, ...products]);
  };

  const remove = (id: string) => store.set(products.filter((entry) => entry.id !== id));

  const duplicate = (id: string) => {
    const source = products.find((entry) => entry.id === id);
    if (!source) return;
    const copy: AdminProduct = {
      ...source,
      id: `${source.id}-copy-${Date.now().toString(36)}`,
      sku: `${source.sku}-COPY`,
      status: "draft",
      en: { ...source.en, name: `${source.en.name} (Copy)` },
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    store.set([copy, ...products]);
  };

  const setStatus = (id: string, status: AdminProduct["status"]) => {
    store.set(products.map((entry) => entry.id === id ? { ...entry, status } : entry));
  };

  return { products, upsert, remove, duplicate, setStatus };
}

export function getAdminProduct(id: string): AdminProduct | undefined {
  return store.getSnapshot().find((entry) => entry.id === id);
}
