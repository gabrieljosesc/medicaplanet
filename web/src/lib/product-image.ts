import "server-only";

import { getLocalProductImagePath } from "@/lib/product-image-local";

export { getLocalProductImagePath };

/**
 * Prefer `public/images/` (exact slug, normalized basename, or variant id in filename),
 * then Supabase image URL, then placeholder.
 */
export function resolveProductMainImage(
  slug: string,
  remoteUrl: string | null | undefined,
  titleForPlaceholder: string
): string {
  const local = getLocalProductImagePath(slug);
  if (local) return local;
  if (remoteUrl?.trim()) return remoteUrl.trim();
  return `https://placehold.co/720x560/e2e8f0/0f766e?text=${encodeURIComponent(titleForPlaceholder.slice(0, 28))}`;
}

/** Next/Image: skip optimizer for hosts that break or SVG; allow Supabase + static files to optimize. */
export function nextImageUnoptimized(src: string): boolean {
  return src.includes("placehold.co") || /\.svg(\?|$)/i.test(src);
}
