import type { SupabaseClient } from "@supabase/supabase-js";

export function escapeIlike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

const PRODUCT_SEARCH_SELECT =
  "slug,title,description,base_price,currency,rating,review_count,price_tiers,product_images(url),categories(name)" as const;

export type ProductSearchHit = {
  slug: string;
  title: string;
  description: string | null;
  base_price: number;
  currency: string;
  rating: number;
  review_count: number;
  price_tiers: unknown;
  imageUrl: string | null;
  categoryName: string | null;
};

type DbProductRow = {
  slug: string;
  title: string;
  description: string | null;
  base_price: number;
  currency: string;
  rating: number;
  review_count: number;
  price_tiers: unknown;
  product_images: { url: string }[] | null;
  categories: { name: string } | { name: string }[] | null;
};

function normalizeCategory(c: DbProductRow["categories"]): string | null {
  if (!c) return null;
  if (Array.isArray(c)) return c[0]?.name ?? null;
  return c.name ?? null;
}

function mapRow(p: DbProductRow): ProductSearchHit {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    base_price: Number(p.base_price),
    currency: p.currency,
    rating: Number(p.rating),
    review_count: p.review_count,
    price_tiers: p.price_tiers,
    imageUrl: Array.isArray(p.product_images) ? (p.product_images[0]?.url ?? null) : null,
    categoryName: normalizeCategory(p.categories),
  };
}

export type ProductSearchScope = {
  /** When set, only products in this category (matches `products.category_id`). */
  categoryId?: string;
};

/** Title or slug ilike match, active products only, merged and sorted by title. */
export async function searchActiveProducts(
  supabase: SupabaseClient,
  term: string,
  limit: number,
  scope?: ProductSearchScope
): Promise<ProductSearchHit[]> {
  const t = term.trim();
  if (t.length < 2) return [];
  const pattern = `%${escapeIlike(t)}%`;
  const sel = PRODUCT_SEARCH_SELECT;
  const baseTitle = supabase.from("products").select(sel).eq("is_active", true).ilike("title", pattern).limit(50);
  const baseSlug = supabase.from("products").select(sel).eq("is_active", true).ilike("slug", pattern).limit(50);
  const qTitle = scope?.categoryId ? baseTitle.eq("category_id", scope.categoryId) : baseTitle;
  const qSlug = scope?.categoryId ? baseSlug.eq("category_id", scope.categoryId) : baseSlug;
  const [{ data: byTitle }, { data: bySlug }] = await Promise.all([qTitle, qSlug]);
  const merged = new Map<string, DbProductRow>();
  for (const p of [...(byTitle ?? []), ...(bySlug ?? [])] as DbProductRow[]) {
    if (!merged.has(p.slug)) merged.set(p.slug, p);
  }
  return [...merged.values()]
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(mapRow);
}

export type SearchSuggestItem = { slug: string; title: string; category: string | null };

export async function searchSuggestItems(
  supabase: SupabaseClient,
  term: string,
  limit: number,
  scope?: ProductSearchScope
): Promise<SearchSuggestItem[]> {
  const rows = await searchActiveProducts(supabase, term, limit, scope);
  return rows.map((r) => ({ slug: r.slug, title: r.title, category: r.categoryName }));
}
