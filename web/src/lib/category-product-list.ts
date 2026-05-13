import type { SupabaseClient } from "@supabase/supabase-js";
import { escapeIlike, quotePostgRestFilterValue } from "@/lib/search-products";
import { resolveBestSellerSlots } from "@/lib/best-sellers-home";

export type CategoryListSort =
  | "master_asc"
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "newest";

export type CategoryListParams = {
  q: string;
  sort: CategoryListSort;
};

const SORTS: CategoryListSort[] = [
  "master_asc",
  "title_asc",
  "title_desc",
  "price_asc",
  "price_desc",
  "rating_desc",
  "newest",
];

function first(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

export function parsePageParam(sp: Record<string, string | string[] | undefined>, key = "page"): number {
  const raw = first(sp, key);
  const n = parseInt(String(raw ?? "1"), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseCategoryListParams(
  sp: Record<string, string | string[] | undefined>
): CategoryListParams {
  const sortRaw = first(sp, "sort");
  const sort = SORTS.includes(sortRaw as CategoryListSort)
    ? (sortRaw as CategoryListSort)
    : "master_asc";
  const q = (first(sp, "q") ?? "").trim().slice(0, 120);
  return { q, sort };
}

export function categoryListParamsActive(p: CategoryListParams): boolean {
  return p.q.length > 0 || p.sort !== "master_asc";
}

const PRODUCT_SELECT =
  "slug,title,description,base_price,currency,rating,review_count,price_tiers,product_images(url),is_featured,created_at,variant_product_id,categories(slug,name)" as const;

export type CategoryProductRow = {
  slug: string;
  title: string;
  description: string | null;
  base_price: number;
  currency: string;
  rating: number;
  review_count: number;
  price_tiers: unknown;
  product_images: { url: string }[] | null;
  category_slug?: string | null;
  category_name?: string | null;
};

export type FetchCategoryProductsResult = {
  rows: CategoryProductRow[];
  count: number | null;
};

type CatRel = { slug: string; name: string } | { slug: string; name: string }[] | null;

function mapRow(p: CategoryProductRow & { categories?: CatRel; variant_product_id?: number | null }): CategoryProductRow {
  const c = p.categories;
  const cat = Array.isArray(c) ? c[0] : c;
  const { categories: _a, ...rest } = p;
  return {
    ...rest,
    category_slug: cat?.slug ?? null,
    category_name: cat?.name ?? null,
  };
}

type FetchOptions = { page: number; perPage: number } | null;

/**
 * @param options - when set, returns a page and total `count` (for pagination). When null, all matching rows.
 */
export async function fetchCategoryProducts(
  supabase: SupabaseClient,
  categoryId: string,
  params: CategoryListParams,
  options: FetchOptions = null
): Promise<FetchCategoryProductsResult> {
  let q = supabase
    .from("products")
    .select(PRODUCT_SELECT, options ? { count: "exact" } : undefined)
    .eq("category_id", categoryId)
    .eq("is_active", true);

  if (params.q) {
    const pattern = `%${escapeIlike(params.q)}%`;
    const operand = quotePostgRestFilterValue(pattern);
    q = q.or(`title.ilike.${operand},slug.ilike.${operand}`);
  }

  switch (params.sort) {
    case "title_desc":
      q = q.order("title", { ascending: false });
      break;
    case "price_asc":
      q = q.order("base_price", { ascending: true }).order("title", { ascending: true });
      break;
    case "price_desc":
      q = q.order("base_price", { ascending: false }).order("title", { ascending: true });
      break;
    case "rating_desc":
      q = q.order("rating", { ascending: false }).order("title", { ascending: true });
      break;
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    case "title_asc":
      q = q.order("title", { ascending: true });
      break;
    case "master_asc":
    default:
      q = q
        .order("variant_product_id", { ascending: true, nullsFirst: false })
        .order("title", { ascending: true });
      break;
  }

  if (options) {
    const p = Math.max(1, options.page);
    const from = (p - 1) * options.perPage;
    const to = from + options.perPage - 1;
    q = q.range(from, to);
  }

  const { data, error, count } = await q;
  if (error) throw error;
  const rows = (data ?? []).map((r) => mapRow(r as Parameters<typeof mapRow>[0]));
  return { rows, count: options ? count ?? rows.length : null };
}

/**
 * Virtual "Best sellers" listing.
 *
 * Best sellers has no `category_id` link; we synthesise it from:
 *  - Products whose title matches the home Best-sellers slot heuristics
 *  - Products flagged `is_featured = true`
 * The combined unique set is then filtered/sorted/paginated like a normal category.
 */
export async function fetchBestSellersProducts(
  supabase: SupabaseClient,
  params: CategoryListParams,
  options: FetchOptions = null
): Promise<FetchCategoryProductsResult> {
  let pool = supabase
    .from("products")
    .select(PRODUCT_SELECT + ",is_featured")
    .eq("is_active", true);

  if (params.q) {
    const pattern = `%${escapeIlike(params.q)}%`;
    const operand = quotePostgRestFilterValue(pattern);
    pool = pool.or(`title.ilike.${operand},slug.ilike.${operand}`);
  }

  pool = pool.order("is_featured", { ascending: false }).order("title", { ascending: true }).limit(500);

  const { data, error } = await pool;
  if (error) throw error;

  type Row = CategoryProductRow & {
    is_featured?: boolean | null;
    categories?: CatRel;
    variant_product_id?: number | null;
  };
  const all = ((data ?? []) as unknown as Row[]).map((r) => ({
    raw: r,
    mapped: mapRow(r as Parameters<typeof mapRow>[0]) as CategoryProductRow & {
      is_featured?: boolean | null;
    },
  }));

  const heuristicMatches = resolveBestSellerSlots(
    all.map(({ mapped }) => ({ slug: mapped.slug, title: mapped.title }))
  )
    .filter((s): s is NonNullable<typeof s> => s != null)
    .map((s) => s.product.slug);
  const heuristicSet = new Set(heuristicMatches);

  const selected = all.filter(({ mapped }) => heuristicSet.has(mapped.slug) || mapped.is_featured);
  const rowsAll = selected.map(({ mapped }) => {
    const { is_featured: _omit, ...rest } = mapped;
    return rest as CategoryProductRow;
  });

  const sorted = sortBestSellersRows(rowsAll, selected, params.sort, heuristicSet);

  const total = sorted.length;
  if (!options) return { rows: sorted, count: null };
  const p = Math.max(1, options.page);
  const from = (p - 1) * options.perPage;
  const to = from + options.perPage;
  return { rows: sorted.slice(from, to), count: total };
}

function sortBestSellersRows(
  rows: CategoryProductRow[],
  enriched: { mapped: CategoryProductRow & { is_featured?: boolean | null } }[],
  sort: CategoryListSort,
  heuristicSet: Set<string>
): CategoryProductRow[] {
  const featuredMap = new Map(enriched.map((e) => [e.mapped.slug, Boolean(e.mapped.is_featured)]));
  const indexed = rows.map((r, i) => ({ r, i }));
  switch (sort) {
    case "title_desc":
      indexed.sort((a, b) => b.r.title.localeCompare(a.r.title));
      break;
    case "price_asc":
      indexed.sort(
        (a, b) => Number(a.r.base_price) - Number(b.r.base_price) || a.r.title.localeCompare(b.r.title)
      );
      break;
    case "price_desc":
      indexed.sort(
        (a, b) => Number(b.r.base_price) - Number(a.r.base_price) || a.r.title.localeCompare(b.r.title)
      );
      break;
    case "rating_desc":
      indexed.sort(
        (a, b) => Number(b.r.rating) - Number(a.r.rating) || a.r.title.localeCompare(b.r.title)
      );
      break;
    case "newest":
      indexed.sort((a, b) => b.i - a.i);
      break;
    case "title_asc":
      indexed.sort((a, b) => a.r.title.localeCompare(b.r.title));
      break;
    case "master_asc":
    default:
      indexed.sort((a, b) => {
        const ha = heuristicSet.has(a.r.slug) ? 0 : 1;
        const hb = heuristicSet.has(b.r.slug) ? 0 : 1;
        if (ha !== hb) return ha - hb;
        const fa = featuredMap.get(a.r.slug) ? 0 : 1;
        const fb = featuredMap.get(b.r.slug) ? 0 : 1;
        if (fa !== fb) return fa - fb;
        return a.r.title.localeCompare(b.r.title);
      });
      break;
  }
  return indexed.map((x) => x.r);
}
