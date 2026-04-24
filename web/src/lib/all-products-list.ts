import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type CategoryListParams,
  type CategoryProductRow,
  type FetchCategoryProductsResult,
} from "@/lib/category-product-list";
import { escapeIlike } from "@/lib/search-products";

const SELECT_WITH_CAT =
  "slug,title,description,base_price,currency,rating,review_count,price_tiers,product_images(url),is_featured,created_at,variant_product_id,categories(slug,name)" as const;

type CatRel = { slug: string; name: string } | { slug: string; name: string }[] | null;

function mapRow(p: CategoryProductRow & { categories?: CatRel; variant_product_id?: number | null }) {
  const c = p.categories;
  const cat = Array.isArray(c) ? c[0] : c;
  const { categories: _x, ...rest } = p;
  return {
    ...rest,
    category_slug: cat?.slug ?? null,
    category_name: cat?.name ?? null,
  };
}

/**
 * All active products in allowed categories, ordered by Product Master (`variant_product_id` ASC, nulls last) then title.
 * Paginated for /shop.
 */
export async function fetchAllProductsPage(
  supabase: SupabaseClient,
  allowedCategoryIds: string[],
  listParams: CategoryListParams,
  page: number,
  perPage: number
): Promise<FetchCategoryProductsResult> {
  if (!allowedCategoryIds.length) {
    return { rows: [], count: 0 };
  }
  let q = supabase
    .from("products")
    .select(SELECT_WITH_CAT, { count: "exact" })
    .in("category_id", allowedCategoryIds)
    .eq("is_active", true);

  if (listParams.q) {
    q = q.ilike("title", `%${escapeIlike(listParams.q)}%`);
  }

  const sort = listParams.sort;
  switch (sort) {
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

  const p = Math.max(1, page);
  const from = (p - 1) * perPage;
  const to = from + perPage - 1;
  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) throw error;
  const rows = (data ?? []).map((r) => mapRow(r as Parameters<typeof mapRow>[0]));
  return { rows, count: count ?? rows.length };
}
