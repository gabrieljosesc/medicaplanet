import { createClient } from "@/lib/supabase/server";

export type NavCategory = { id: string; slug: string; name: string };

/** How many category pills show in the main header (no horizontal scroll; rest via /shop). */
export const HEADER_NAV_CATEGORY_LIMIT = 7;

/**
 * Top-level categories for the header row + a few product links per category for hover mega-menus
 * (similar to fillersupplies.com category dropdowns). Only the first N by `sort_order` are shown.
 */
export async function getCategoryNavData(): Promise<{
  categories: NavCategory[];
  /** slug → up to 6 product shortcuts */
  productSamples: Record<string, { slug: string; title: string }[]>;
}> {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,slug,name,sort_order")
    .not("slug", "in", "(orthopedic-injections,orthopaedics)")
    .order("sort_order");
  const rows = (categories ?? []) as NavCategory[];
  const navRows = rows.slice(0, HEADER_NAV_CATEGORY_LIMIT);
  const catIds = navRows.map((c) => c.id);
  if (catIds.length === 0) return { categories: [], productSamples: {} };

  const { data: products } = await supabase
    .from("products")
    .select("slug,title,category_id,is_featured")
    .eq("is_active", true)
    .in("category_id", catIds)
    .order("is_featured", { ascending: false })
    .order("title")
    .limit(240);

  const lists = new Map<string, { slug: string; title: string }[]>();
  for (const c of navRows) lists.set(c.id, []);
  for (const p of products ?? []) {
    const cid = p.category_id as string;
    const list = lists.get(cid);
    if (!list || list.length >= 6) continue;
    const slug = (p as { slug: string }).slug;
    const title = (p as { title: string }).title;
    list.push({ slug, title });
  }

  const productSamples: Record<string, { slug: string; title: string }[]> = {};
  for (const c of navRows) {
    productSamples[c.slug] = lists.get(c.id) ?? [];
  }
  return { categories: navRows, productSamples };
}
