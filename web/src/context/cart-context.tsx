"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";
import { unitPriceForQuantity } from "@/lib/price-tiers";
import { createClient } from "@/lib/supabase/client";

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
    return parsed.map((l) => ({ ...l, selected: l.selected !== false }));
  } catch {
    return [];
  }
}

/** DB row → CartLine shape used by the UI. */
type CartRow = {
  slug: string;
  title: string;
  unit_price: number | string;
  currency: string | null;
  quantity: number;
  selected: boolean | null;
  image_src: string | null;
  price_tiers: unknown;
};

function rowToLine(r: CartRow): CartLine {
  return {
    slug: r.slug,
    title: r.title,
    unitPrice: Number(r.unit_price) || 0,
    quantity: Math.max(1, Number(r.quantity) || 1),
    selected: r.selected !== false,
    currency: r.currency ?? "USD",
    imageSrc: r.image_src ?? undefined,
    priceTiers: Array.isArray(r.price_tiers) ? (r.price_tiers as CartLine["priceTiers"]) : undefined,
  };
}

function lineToRow(userId: string, l: CartLine) {
  return {
    user_id: userId,
    slug: l.slug,
    title: l.title,
    unit_price: l.unitPrice,
    currency: l.currency ?? "USD",
    quantity: Math.max(1, l.quantity),
    selected: l.selected !== false,
    image_src: l.imageSrc ?? null,
    price_tiers: l.priceTiers ?? [],
    updated_at: new Date().toISOString(),
  };
}

/** Merge guest-cart and server-cart by slug, summing quantities. */
function mergeLines(a: CartLine[], b: CartLine[]): CartLine[] {
  const bySlug = new Map<string, CartLine>();
  for (const l of a) bySlug.set(l.slug, { ...l });
  for (const l of b) {
    const prev = bySlug.get(l.slug);
    if (!prev) {
      bySlug.set(l.slug, { ...l });
      continue;
    }
    const tiers = prev.priceTiers && prev.priceTiers.length > 0 ? prev.priceTiers : l.priceTiers;
    const qty = prev.quantity + l.quantity;
    const unitPrice =
      tiers && tiers.length > 0 ? unitPriceForQuantity(tiers, qty, prev.unitPrice) : prev.unitPrice;
    bySlug.set(l.slug, {
      ...prev,
      quantity: qty,
      unitPrice,
      priceTiers: tiers,
      selected: prev.selected !== false || l.selected !== false,
      imageSrc: prev.imageSrc ?? l.imageSrc,
      currency: prev.currency ?? l.currency,
    });
  }
  return [...bySlug.values()];
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
  const userId = cartOwnerKey ?? null;
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabaseRef.current && typeof window !== "undefined") {
    try {
      supabaseRef.current = createClient();
    } catch {
      supabaseRef.current = null;
    }
  }
  const supabase = supabaseRef.current;

  // Cross-device sync (logged-in only): pull server cart, merge any guest
  // items on this device, push the merged set back, then become the source
  // of truth for this session.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userId || !supabase) {
      setLines(readStorage(storageKey));
      return;
    }

    let cancelled = false;
    (async () => {
      const guestKey = storageKeyFor(null);
      const guestLines = readStorage(guestKey);
      const { data, error } = await supabase
        .from("cart_items")
        .select("slug,title,unit_price,currency,quantity,selected,image_src,price_tiers")
        .eq("user_id", userId);
      if (cancelled) return;
      if (error) {
        // Fall back to local cache for this user so the cart isn't lost on a network blip.
        setLines(readStorage(storageKey));
        return;
      }
      const serverLines = (data ?? []).map((r) => rowToLine(r as CartRow));
      const merged = mergeLines(serverLines, guestLines);
      setLines(merged);
      localStorage.setItem(storageKey, JSON.stringify(merged));
      if (guestLines.length > 0) {
        localStorage.removeItem(guestKey);
        if (merged.length > 0) {
          await supabase
            .from("cart_items")
            .upsert(merged.map((l) => lineToRow(userId, l)), { onConflict: "user_id,slug" });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, storageKey, supabase]);

  // Keep cart fresh when tab regains focus / another tab updates storage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromStorage = () => setLines(readStorage(storageKey));
    const onFocus = () => {
      if (userId && supabase) {
        supabase
          .from("cart_items")
          .select("slug,title,unit_price,currency,quantity,selected,image_src,price_tiers")
          .eq("user_id", userId)
          .then(({ data, error }) => {
            if (error || !data) return;
            const fresh = data.map((r) => rowToLine(r as CartRow));
            setLines(fresh);
            localStorage.setItem(storageKey, JSON.stringify(fresh));
          });
      } else {
        syncFromStorage();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
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
  }, [storageKey, userId, supabase]);

  const persistServerUpsert = useCallback(
    (line: CartLine) => {
      if (!userId || !supabase) return;
      void supabase
        .from("cart_items")
        .upsert([lineToRow(userId, line)], { onConflict: "user_id,slug" });
    },
    [userId, supabase]
  );

  const persistServerDelete = useCallback(
    (slug: string) => {
      if (!userId || !supabase) return;
      void supabase.from("cart_items").delete().eq("user_id", userId).eq("slug", slug);
    },
    [userId, supabase]
  );

  const persistServerClear = useCallback(() => {
    if (!userId || !supabase) return;
    void supabase.from("cart_items").delete().eq("user_id", userId);
  }, [userId, supabase]);

  const persistServerSelected = useCallback(
    (slug: string, selected: boolean) => {
      if (!userId || !supabase) return;
      void supabase
        .from("cart_items")
        .update({ selected, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("slug", slug);
    },
    [userId, supabase]
  );

  const persistServerSelectAll = useCallback(
    (selected: boolean) => {
      if (!userId || !supabase) return;
      void supabase
        .from("cart_items")
        .update({ selected, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    },
    [userId, supabase]
  );

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
        const normalizedPrev = prev.map((l) => ({ ...l, selected: l.selected !== false }));
        const idx = prev.findIndex((l) => l.slug === line.slug);
        let next: CartLine[];
        let touched: CartLine | null = null;
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
          touched = {
            ...existing,
            quantity: newQty,
            unitPrice,
            priceTiers: mergedTiers,
            selected: line.selected ?? true,
            currency: line.currency ?? existing.currency,
            imageSrc: line.imageSrc ?? existing.imageSrc,
          };
          next[idx] = touched;
        } else {
          touched = { ...line, quantity: qty, selected: line.selected ?? true };
          next = [...normalizedPrev, touched];
        }
        if (line.deselectOthers) {
          next = next.map((l) =>
            l.slug === line.slug ? { ...l, selected: true } : { ...l, selected: false }
          );
        }
        localStorage.setItem(storageKey, JSON.stringify(next));
        if (touched) persistServerUpsert(touched);
        if (line.deselectOthers && userId && supabase) {
          void supabase
            .from("cart_items")
            .update({ selected: false, updated_at: new Date().toISOString() })
            .eq("user_id", userId)
            .neq("slug", line.slug);
        }
        return next;
      });
    },
    [storageKey, persistServerUpsert, userId, supabase]
  );

  const setQty = useCallback(
    (slug: string, quantity: number) => {
      setLines((prev) => {
        let touched: CartLine | null = null;
        const next =
          quantity <= 0
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => {
                if (l.slug !== slug) return l;
                if (l.priceTiers && l.priceTiers.length > 0) {
                  const unitPrice = unitPriceForQuantity(l.priceTiers, quantity, l.unitPrice);
                  touched = { ...l, quantity, unitPrice };
                  return touched;
                }
                touched = { ...l, quantity };
                return touched;
              });
        localStorage.setItem(storageKey, JSON.stringify(next));
        if (quantity <= 0) persistServerDelete(slug);
        else if (touched) persistServerUpsert(touched);
        return next;
      });
    },
    [storageKey, persistServerDelete, persistServerUpsert]
  );

  const setSelected = useCallback(
    (slug: string, selected: boolean) => {
      setLines((prev) => {
        const next = prev.map((l) => (l.slug === slug ? { ...l, selected } : l));
        localStorage.setItem(storageKey, JSON.stringify(next));
        persistServerSelected(slug, selected);
        return next;
      });
    },
    [storageKey, persistServerSelected]
  );

  const setAllSelected = useCallback(
    (selected: boolean) => {
      setLines((prev) => {
        const next = prev.map((l) => ({ ...l, selected }));
        localStorage.setItem(storageKey, JSON.stringify(next));
        persistServerSelectAll(selected);
        return next;
      });
    },
    [storageKey, persistServerSelectAll]
  );

  const removeLine = useCallback(
    (slug: string) => {
      setLines((prev) => {
        const next = prev.filter((l) => l.slug !== slug);
        localStorage.setItem(storageKey, JSON.stringify(next));
        persistServerDelete(slug);
        return next;
      });
    },
    [storageKey, persistServerDelete]
  );

  const clear = useCallback(() => {
    setLines([]);
    localStorage.removeItem(storageKey);
    persistServerClear();
  }, [storageKey, persistServerClear]);

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
