import "server-only";

import { resolveProductMainImage } from "@/lib/product-image";

/** Thumbnail for a line item when product may be deleted (no slug). */
export function resolveOrderItemImage(
  slug: string | null | undefined,
  remoteUrl: string | null | undefined,
  title: string
): string {
  const s = slug?.trim();
  if (s) return resolveProductMainImage(s, remoteUrl ?? null, title);
  if (remoteUrl?.trim()) return remoteUrl.trim();
  return `https://placehold.co/200x160/e2e8f0/64748b?text=${encodeURIComponent(title.slice(0, 18))}`;
}
