import productImageOverrides from "../../data/product-image-overrides.json";

type Overrides = Record<string, string>;

const bySlug = productImageOverrides as Overrides;

/** Same rules as `nextImageUnoptimized` in `product-image.ts` (client-safe). */
export function cartImageUnoptimized(src: string): boolean {
  if (src.includes("placehold.co") || /\.svg(\?|$)/i.test(src)) return true;
  const isLocalPath = src.startsWith("/") && !/^https?:\/\//i.test(src);
  if (isLocalPath && src.includes("%")) return true;
  return false;
}

/**
 * Cart runs in the browser — use bundled overrides + optional URL from add-to-cart.
 */
export function resolveCartLineImageSrc(slug: string, storedSrc?: string | null): string {
  const s = storedSrc?.trim();
  if (s) return s;
  const forced = bySlug[slug.trim()];
  if (forced) return `/images/${forced}`;
  return `/images/${slug}.png`;
}
