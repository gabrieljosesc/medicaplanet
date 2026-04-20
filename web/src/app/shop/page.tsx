import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("slug,name,description,sort_order")
    .order("sort_order");
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Shop by category</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Pick a therapeutic area. Peptides has its own hub for research-use descriptions sourced from
        your internal brief.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {(categories ?? []).map((c) => (
          <li key={c.slug}>
            <Link
              href={c.slug === "peptides" ? "/peptides" : `/category/${c.slug}`}
              className="block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-emerald-300"
            >
              <span className="text-lg font-semibold text-emerald-900">{c.name}</span>
              {c.description && (
                <p className="mt-2 text-sm text-zinc-600 line-clamp-3">{c.description}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
