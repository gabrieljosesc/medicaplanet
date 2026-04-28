import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchSuggestItems } from "@/lib/search-products";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q") ?? "";
  const q = raw.trim();
  if (q.length < 2) {
    return NextResponse.json({ items: [] satisfies { slug: string; title: string; category: string | null }[] });
  }
  if (q.length > 120) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }
  const supabase = await createClient();
  const categorySlug = req.nextUrl.searchParams.get("categorySlug")?.trim();
  let scope: { categoryId?: string } | undefined;
  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
    if (cat?.id) scope = { categoryId: cat.id as string };
  }
  const items = await searchSuggestItems(supabase, q, 12, scope);
  return NextResponse.json({ items });
}
