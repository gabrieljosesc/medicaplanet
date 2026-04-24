import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProductAction } from "@/app/actions/admin";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(url), categories(id,slug,name)")
    .eq("id", id)
    .single();
  if (!product) notFound();
  const { data: categories } = await supabase.from("categories").select("id,name,slug").order("sort_order");
  const img = Array.isArray(product.product_images) ? product.product_images[0]?.url : "";

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-teal-800 hover:underline">
        ← Products
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Edit product</h1>
      <form action={updateProductAction} className="mt-6 max-w-xl space-y-4">
        <input type="hidden" name="id" value={product.id} />
        <div>
          <label className="text-xs font-medium text-zinc-600">Title</label>
          <input name="title" required defaultValue={product.title} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Slug</label>
          <input name="slug" required defaultValue={product.slug} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">SKU</label>
          <input name="sku" defaultValue={product.sku ?? ""} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Category</label>
          <select name="category_id" defaultValue={product.category_id ?? ""} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm">
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
          <input name="base_price" type="number" step="0.01" required defaultValue={product.base_price} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Description</label>
          <textarea name="description" rows={8} defaultValue={product.description ?? ""} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Primary image URL (optional)</label>
          <input name="image_url" defaultValue={img ?? ""} placeholder="https://…" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-zinc-500">
            Or add a file{" "}
            <code className="rounded bg-zinc-100 px-0.5">{`web/public/images/<slug>.webp`}</code> (use this
            product&apos;s slug; .jpg/.png ok) — it overrides this URL on the storefront.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product.is_active} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked={product.is_featured} />
          Featured
        </label>
        <button type="submit" className="rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white">
          Save
        </button>
      </form>
    </div>
  );
}
