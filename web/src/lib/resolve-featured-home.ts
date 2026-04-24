import { PINNED_FEATURED_SLUGS, FEATURED_HOME_COUNT } from "@/lib/featured-home-config";

type ProductRow = {
  slug: string;
  title: string;
  is_featured?: boolean;
  heroImageSrc: string;
  [key: string]: unknown;
};

/**
 * Build up to `FEATURED_HOME_COUNT` products: pinned slugs first, then by `is_featured` + title.
 * Skips placeholder image URLs.
 */
export function resolveFeaturedHomeProducts<T extends ProductRow>(rows: T[]): T[] {
  const max = FEATURED_HOME_COUNT;
  const bySlug = new Map(rows.map((p) => [p.slug, p]));
  const out: T[] = [];
  const used = new Set<string>();

  for (const s of PINNED_FEATURED_SLUGS) {
    if (out.length >= max) break;
    const p = bySlug.get(s);
    if (p && !p.heroImageSrc.includes("placehold.co")) {
      out.push(p);
      used.add(p.slug);
    }
  }

  const rest = rows
    .filter((p) => !used.has(p.slug) && !p.heroImageSrc.includes("placehold.co"))
    .sort((a, b) => {
      const fa = Boolean(a.is_featured);
      const fb = Boolean(b.is_featured);
      if (fb !== fa) return fb ? 1 : -1;
      return a.title.localeCompare(b.title);
    });

  for (const p of rest) {
    if (out.length >= max) break;
    out.push(p);
  }

  return out;
}
