import type { SupabaseClient } from "@supabase/supabase-js";
import { escapeIlike } from "@/lib/search-products";

export type CategoryListSort =
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "newest";

export type CategoryListParams = {
  q: string;
  sort: CategoryListSort;
  minPrice: number | null;
  maxPrice: number | null;
  featuredOnly: boolean;
};

const SORTS: CategoryListSort[] = [
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

function parsePrice(raw: string | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function parseCategoryListParams(
  sp: Record<string, string | string[] | undefined>
): CategoryListParams {
  const sortRaw = first(sp, "sort");
  const sort = SORTS.includes(sortRaw as CategoryListSort)
    ? (sortRaw as CategoryListSort)
    : "title_asc";
  const q = (first(sp, "q") ?? "").trim().slice(0, 120);
  let minPrice = parsePrice(first(sp, "min"));
  let maxPrice = parsePrice(first(sp, "max"));
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    const t = minPrice;
    minPrice = maxPrice;
    maxPrice = t;
  }
  const fv = first(sp, "featured");
  const featuredOnly = fv === "1" || fv === "true" || fv === "on";
  return { q, sort, minPrice, maxPrice, featuredOnly };
}

export function categoryListParamsActive(p: CategoryListParams): boolean {
  return (
    p.q.length > 0 ||
    p.minPrice != null ||
    p.maxPrice != null ||
    p.featuredOnly ||
    p.sort !== "title_asc"
  );
}

const PRODUCT_SELECT =
  "slug,title,description,base_price,currency,rating,review_count,price_tiers,product_images(url),is_featured,created_at" as const;

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
};

export async function fetchCategoryProducts(
  supabase: SupabaseClient,
  categoryId: string,
  params: CategoryListParams
): Promise<CategoryProductRow[]> {
  let q = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId)
    .eq("is_active", true);

  if (params.q) {
    q = q.ilike("title", `%${escapeIlike(params.q)}%`);
  }
  if (params.featuredOnly) {
    q = q.eq("is_featured", true);
  }
  if (params.minPrice != null) {
    q = q.gte("base_price", params.minPrice);
  }
  if (params.maxPrice != null) {
    q = q.lte("base_price", params.maxPrice);
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
    default:
      q = q.order("title", { ascending: true });
      break;
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CategoryProductRow[];
}
