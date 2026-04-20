"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";
import { unitPriceForQuantity } from "@/lib/price-tiers";

const STORAGE_KEY = "medicaplanet-cart-v1";

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQty: (slug: string, quantity: number) => void;
  removeLine: (slug: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(readStorage());
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const qty = line.quantity ?? 1;
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.slug === line.slug);
        let next: CartLine[];
        if (idx >= 0) {
          next = [...prev];
          const existing = next[idx];
          const mergedTiers =
            existing.priceTiers && existing.priceTiers.length > 0
              ? existing.priceTiers
              : line.priceTiers;
          const newQty = existing.quantity + qty;
          const unitPrice =
            mergedTiers && mergedTiers.length > 0
              ? unitPriceForQuantity(mergedTiers, newQty, existing.unitPrice)
              : existing.unitPrice;
          next[idx] = {
            ...existing,
            quantity: newQty,
            unitPrice,
            priceTiers: mergedTiers,
            currency: line.currency ?? existing.currency,
          };
        } else {
          next = [...prev, { ...line, quantity: qty }];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const setQty = useCallback((slug: string, quantity: number) => {
    setLines((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((l) => l.slug !== slug)
          : prev.map((l) => {
              if (l.slug !== slug) return l;
              if (l.priceTiers && l.priceTiers.length > 0) {
                const unitPrice = unitPriceForQuantity(l.priceTiers, quantity, l.unitPrice);
                return { ...l, quantity, unitPrice };
              }
              return { ...l, quantity };
            });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeLine = useCallback((slug: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.slug !== slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      addLine,
      setQty,
      removeLine,
      clear,
      count: lines.reduce((s, l) => s + l.quantity, 0),
    }),
    [lines, addLine, setQty, removeLine, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
