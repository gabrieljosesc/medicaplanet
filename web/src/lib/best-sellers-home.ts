import { categoryNavLabel } from "@/lib/catalog-constants";
import { categoryHref } from "@/lib/category-href";

/** Optional exact slugs (in display order) — fill from your catalog when you know them. */
export const PINNED_BEST_SELLER_SLUGS: (string | null)[] = [
  null,
  null,
  null,
  null,
  null,
  null,
];

export type BestSellerTag = { label: string; href: string };

export type BestSellerSlotResult<T> = {
  product: T;
  tags: BestSellerTag[];
  /** “Was” price for strikethrough + savings pill when greater than displayed price */
  compareAtPrice?: number;
};

type SlotDef = {
  tags: BestSellerTag[];
  compareAt?: number;
  /** Try these slugs first (in order) for this slot */
  slugTry: string[];
  /** Title match when slug not found */
  pick: (title: string) => boolean;
};

/**
 * FillerSupplies-style “Best sellers” row: match by slug first, then title heuristics.
 * Slots are in **display order** (left → right, top → bottom in the 3×2 grid).
 */
const SLOTS: SlotDef[] = [
  {
    tags: [
      { label: "Botox", href: "/shop?q=Botox" },
      { label: "Botulinum", href: "/category/botulinum-toxins" },
    ],
    slugTry: [],
    pick: (t) =>
      /botox/i.test(t) &&
      /100/i.test(t) &&
      !/non[-\s]?english|non english/i.test(t) &&
      !/korean/i.test(t),
  },
  {
    tags: [
      { label: "Botulinum", href: "/category/botulinum-toxins" },
      { label: "Xeomin", href: "/shop?q=Xeomin" },
    ],
    slugTry: [],
    pick: (t) => /xeomin/i.test(t) && /english/i.test(t) && /korean/i.test(t),
  },
  {
    tags: [
      { label: "Botulinum", href: "/category/botulinum-toxins" },
      { label: "Xeomin", href: "/shop?q=Xeomin" },
    ],
    slugTry: [],
    pick: (t) =>
      /xeomin/i.test(t) &&
      (/1\s*vial|1vial/i.test(t) || /100\s*u.*1\s*vial/i.test(t)) &&
      !(/english/i.test(t) && /korean/i.test(t)),
  },
  {
    tags: [
      { label: "Botulinum", href: "/category/botulinum-toxins" },
      { label: "Dysport", href: "/shop?q=Dysport" },
    ],
    slugTry: [],
    pick: (t) => /dysport/i.test(t) && /500/i.test(t),
  },
  {
    tags: [
      { label: "Dermal fillers", href: "/category/dermal-fillers" },
      { label: "Restylane", href: "/shop?q=Restylane" },
    ],
    compareAt: 189,
    slugTry: [],
    pick: (t) => /kysse/i.test(t) && /restylane/i.test(t),
  },
  {
    tags: [
      { label: "Botox", href: "/shop?q=Botox" },
      { label: "Botulinum", href: "/category/botulinum-toxins" },
    ],
    slugTry: [],
    pick: (t) => /botox/i.test(t) && /100/i.test(t) && /non[-\s]?english|non english/i.test(t),
  },
];

export function resolveBestSellerSlots<T extends { slug: string; title: string }>(
  rows: T[]
): (BestSellerSlotResult<T> | null)[] {
  const bySlug = new Map(rows.map((p) => [p.slug, p]));
  const used = new Set<string>();
  const out: (BestSellerSlotResult<T> | null)[] = [];

  for (let i = 0; i < SLOTS.length; i++) {
    const slot = SLOTS[i]!;
    const slugOverride = PINNED_BEST_SELLER_SLUGS[i];
    let product: T | undefined;

    if (slugOverride && bySlug.get(slugOverride)) {
      product = bySlug.get(slugOverride);
    } else {
      for (const s of slot.slugTry) {
        const p = bySlug.get(s);
        if (p && !used.has(p.slug)) {
          product = p;
          break;
        }
      }
    }
    if (!product) {
      product = rows.find((p) => !used.has(p.slug) && slot.pick(p.title));
    }

    if (!product) {
      out.push(null);
      continue;
    }
    used.add(product.slug);
    out.push({
      product,
      tags: slot.tags,
      compareAtPrice: slot.compareAt,
    });
  }

  return out;
}

/** Fill null slots from `extras` in order (e.g. featured products). */
export function mergeBestSellerSlots<T extends { slug: string; title: string }>(
  slots: (BestSellerSlotResult<T> | null)[],
  extras: T[]
): BestSellerSlotResult<T>[] {
  const used = new Set(
    slots.filter((s): s is BestSellerSlotResult<T> => s != null).map((s) => s.product.slug)
  );
  let j = 0;
  const merged: BestSellerSlotResult<T>[] = [];
  for (const s of slots) {
    if (s) {
      merged.push(s);
      continue;
    }
    while (j < extras.length && used.has(extras[j]!.slug)) j += 1;
    const p = j < extras.length ? extras[j] : undefined;
    if (!p) continue;
    j += 1;
    used.add(p.slug);
    const rel = (p as { categories?: unknown }).categories;
    const c = Array.isArray(rel) ? rel[0] : rel;
    const cat = c as { slug?: string; name?: string } | undefined;
    const tags: BestSellerTag[] = [];
    if (cat?.slug && cat.name) {
      tags.push({
        label: categoryNavLabel(cat.slug, cat.name),
        href: categoryHref(cat.slug),
      });
    }
    merged.push({ product: p, tags });
  }
  return merged;
}
