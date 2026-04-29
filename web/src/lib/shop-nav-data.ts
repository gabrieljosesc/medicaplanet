import { categoryNavLabel } from "@/lib/catalog-constants";
import { createClient } from "@/lib/supabase/server";

export type NavCategory = { id: string; slug: string; name: string };

/** How many category pills show in the main header (no horizontal scroll; rest via /shop). */
export const HEADER_NAV_CATEGORY_LIMIT = 7;

/**
 * Placeholders shown when the matching DB row is missing (links still resolve).
 */
const PLACEHOLDER_PEPTIDES: NavCategory = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "peptides",
  name: "Peptides",
};

const PLACEHOLDER_OTHER: NavCategory = {
  id: "00000000-0000-0000-0000-000000000002",
  slug: "other",
  name: "Others",
};

const PLACEHOLDER_DERMAL_FILLERS: NavCategory = {
  id: "00000000-0000-0000-0000-000000000003",
  slug: "dermal-fillers",
  name: "Dermal fillers",
};

const PLACEHOLDER_BOTULINUM: NavCategory = {
  id: "00000000-0000-0000-0000-000000000004",
  slug: "botulinum-toxins",
  name: "Botulinum toxins",
};

/** Pinned to the front of the header nav (in order), even if `sort_order` differs. */
const PINNED_FIRST_SLUGS = ["dermal-fillers", "botulinum-toxins", "peptides"] as const;

/**
 * Header order: **Dermal fillers**, **Botulinum toxins**, **Peptides** first,
 * then the remaining categories by `sort_order`, **Others** last.
 */
export async function getCategoryNavData(): Promise<{
  categories: NavCategory[];
  /** Categories that appear inside the Others dropdown (not on the main row). */
  othersDropdownCategories: NavCategory[];
  /** slug → up to 6 product shortcuts */
  productSamples: Record<string, { slug: string; title: string }[]>;
}> {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,slug,name,sort_order")
    .order("sort_order");
  const rows = (categories ?? []) as NavCategory[];
  const other = rows.find((c) => c.slug === "other");
  const pinnedPlaceholders: Record<string, NavCategory> = {
    "dermal-fillers": PLACEHOLDER_DERMAL_FILLERS,
    "botulinum-toxins": PLACEHOLDER_BOTULINUM,
    peptides: PLACEHOLDER_PEPTIDES,
  };
  const pinnedFirst: NavCategory[] = PINNED_FIRST_SLUGS.map(
    (slug) => rows.find((c) => c.slug === slug) ?? pinnedPlaceholders[slug]
  );
  const pinnedSet = new Set(pinnedFirst.map((c) => c.slug));
  const rest = rows.filter((c) => !pinnedSet.has(c.slug) && c.slug !== "other");
  const maxRest = Math.max(0, HEADER_NAV_CATEGORY_LIMIT - pinnedFirst.length - 1);
  const navCore = [
    ...pinnedFirst,
    ...rest.slice(0, maxRest),
    other ?? PLACEHOLDER_OTHER,
  ] as NavCategory[];
  const navRows = navCore.map((c) => ({
    ...c,
    name: categoryNavLabel(c.slug, c.name),
  }));
  const catIds = navRows.map((c) => c.id);
  if (catIds.length === 0) {
    return { categories: [], othersDropdownCategories: [], productSamples: {} };
  }

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

  /** Every category not shown as its own top-level pill (reference: Others mega menu). */
  const navSlugSet = new Set(navRows.map((c) => c.slug));
  const othersDropdownCategories = rows
    .filter((c) => !navSlugSet.has(c.slug))
    .map((c) => ({
      ...c,
      name: categoryNavLabel(c.slug, c.name),
    }));

  return { categories: navRows, othersDropdownCategories, productSamples };
}
