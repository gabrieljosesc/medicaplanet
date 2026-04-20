import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,published_at")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Blog</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Education and operations notes for professional buyers.
      </p>
      <ul className="mt-8 space-y-4">
        {(posts ?? []).map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-emerald-300">
              <h2 className="text-lg font-semibold text-emerald-900">{p.title}</h2>
              {p.excerpt && <p className="mt-2 text-sm text-zinc-600">{p.excerpt}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
