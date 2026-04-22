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

const STORAGE_KEY_BASE = "medicaplanet-cart-v1";

function storageKeyFor(ownerKey?: string | null): string {
  return ownerKey ? `${STORAGE_KEY_BASE}:${ownerKey}` : `${STORAGE_KEY_BASE}:guest`;
}

type CartContextValue = {
  lines: CartLine[];
  addLine: (
    line: Omit<CartLine, "quantity"> & {
      quantity?: number;
      selected?: boolean;
      deselectOthers?: boolean;
    }
  ) => void;
  setQty: (slug: string, quantity: number) => void;
  setSelected: (slug: string, selected: boolean) => void;
  setAllSelected: (selected: boolean) => void;
  removeLine: (slug: string) => void;
  clear: () => void;
  count: number;
  selectedLines: CartLine[];
  selectedCount: number;
  selectedSubtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(storageKey: string): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((l) => ({ ...l, selected: l.selected === true }));
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
  cartOwnerKey,
}: {
  children: React.ReactNode;
  cartOwnerKey?: string | null;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const storageKey = useMemo(() => storageKeyFor(cartOwnerKey), [cartOwnerKey]);

  useEffect(() => {
    const syncFromStorage = () => setLines(readStorage(storageKey));
    syncFromStorage();

    // Keep cart badge/state consistent when tab regains focus or storage updates.
    const onFocus = () => syncFromStorage();
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncFromStorage();
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === storageKey) syncFromStorage();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, [storageKey]);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, [storageKey]);

  const addLine = useCallback(
    (
      line: Omit<CartLine, "quantity"> & {
        quantity?: number;
        selected?: boolean;
        deselectOthers?: boolean;
      }
    ) => {
      const qty = line.quantity ?? 1;
      setLines((prev) => {
        const normalizedPrev = prev.map((l) => ({ ...l, selected: l.selected === true }));
        const idx = prev.findIndex((l) => l.slug === line.slug);
        let next: CartLine[];
        if (idx >= 0) {
          next = [...normalizedPrev];
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
            selected: line.selected ?? existing.selected ?? false,
            currency: line.currency ?? existing.currency,
          };
        } else {
          next = [
            ...normalizedPrev,
            { ...line, quantity: qty, selected: line.selected ?? false },
          ];
        }
        if (line.deselectOthers) {
          next = next.map((l) =>
            l.slug === line.slug ? { ...l, selected: true } : { ...l, selected: false }
          );
        }
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey]
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
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const setSelected = useCallback((slug: string, selected: boolean) => {
    setLines((prev) => {
      const next = prev.map((l) => (l.slug === slug ? { ...l, selected } : l));
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const setAllSelected = useCallback((selected: boolean) => {
    setLines((prev) => {
      const next = prev.map((l) => ({ ...l, selected }));
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const removeLine = useCallback((slug: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.slug !== slug);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const clear = useCallback(() => {
    setLines([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      addLine,
      setQty,
      setSelected,
      setAllSelected,
      removeLine,
      clear,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      selectedLines: lines.filter((l) => l.selected === true),
      selectedCount: lines.filter((l) => l.selected === true).reduce((s, l) => s + l.quantity, 0),
      selectedSubtotal: lines
        .filter((l) => l.selected === true)
        .reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    }),
    [lines, addLine, setQty, setSelected, setAllSelected, removeLine, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
