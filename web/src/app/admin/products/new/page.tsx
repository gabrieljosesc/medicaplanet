import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProductAction } from "@/app/actions/admin";

export default async function AdminNewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id,name,slug").order("sort_order");

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-emerald-800 hover:underline">
        ← Products
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">New product</h1>
      <form action={createProductAction} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600">Title</label>
          <input name="title" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Slug</label>
          <input name="slug" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">SKU</label>
          <input name="sku" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Category</label>
          <select name="category_id" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm">
            <option value="">—</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Base price</label>
          <input name="base_price" type="number" step="0.01" defaultValue={0} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Description</label>
          <textarea name="description" rows={6} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" />
          Featured
        </label>
        <button type="submit" className="rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white">
          Create
        </button>
      </form>
    </div>
  );
}
