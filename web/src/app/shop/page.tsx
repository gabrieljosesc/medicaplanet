import { createClient } from "@/lib/supabase/server";
import { ShopByCategoryGrid, ShopByCategoryHero } from "@/components/shop-by-category-view";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("slug,name,description,sort_order")
    .order("sort_order");

  const rows = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
  }));

  return (
    <div className="space-y-10 pb-6">
      <ShopByCategoryHero />
      <ShopByCategoryGrid categories={rows} />
    </div>
  );
}
