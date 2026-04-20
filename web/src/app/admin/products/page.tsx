import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id,slug,title,sku,base_price,is_active,categories(name)")
    .order("title")
    .limit(200);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          New product
        </Link>
      </div>
      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <th className="py-2 pr-2">Title</th>
            <th className="py-2 pr-2">SKU</th>
            <th className="py-2 pr-2">Category</th>
            <th className="py-2 pr-2">Price</th>
            <th className="py-2 pr-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {(products ?? []).map((p) => (
            <tr key={p.id} className="border-b border-zinc-100">
              <td className="py-2 pr-2">
                <Link href={`/admin/products/${p.id}`} className="font-medium text-emerald-900 hover:underline">
                  {p.title}
                </Link>
              </td>
              <td className="py-2 pr-2 font-mono text-xs">{p.sku}</td>
              <td className="py-2 pr-2">{(p.categories as { name?: string } | null)?.name ?? "—"}</td>
              <td className="py-2 pr-2">${Number(p.base_price).toFixed(2)}</td>
              <td className="py-2 pr-2">{p.is_active ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
