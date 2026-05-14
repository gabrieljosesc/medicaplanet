/**
 * Product slugs the importers must NEVER (re)create.
 *
 * Used by `import-catalog.mjs` and `import-purechain-peptides.mjs` so that
 * products explicitly deleted from the storefront aren't resurrected by the
 * next import from the Master File / peptides docx / Purechain API.
 *
 * Keys are the canonical product slug. To remove a product:
 *  1. Delete it from Supabase (or set `is_active = false`).
 *  2. Add its slug here.
 *
 * Match is also tried against `slugify(title)` for docx items so docx-derived
 * titles whose slug differs by a numeric suffix are still skipped.
 */
export const REMOVED_PRODUCT_SLUGS = new Set([
  "bronchogen",
]);

export function isRemovedProductSlug(slug) {
  return REMOVED_PRODUCT_SLUGS.has(String(slug || "").toLowerCase());
}
