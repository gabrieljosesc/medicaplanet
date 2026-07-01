import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export type AdminProductSuggestion = {
  id: string;
  slug: string;
  title: string;
  base_price: number;
};

/**
 * Admin-only product search used by the order-items editor. Unlike the public
 * search-suggest endpoint, this returns the product id and base price so an
 * admin can add a line to an existing order.
 */
export async function GET(request: NextRequest) {
  // Admin guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ suggestions: [] }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ suggestions: [] }, { status: 403 });

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("products")
    .select("id, slug, title, base_price")
    .eq("is_active", true)
    .ilike("title", `%${q}%`)
    .order("is_featured", { ascending: false })
    .limit(8);

  if (error) {
    console.error("[admin/product-search]", error.message);
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions: AdminProductSuggestion[] = (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    base_price: Number(p.base_price),
  }));

  return NextResponse.json({ suggestions });
}
