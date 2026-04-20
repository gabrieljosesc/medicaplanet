import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id,slug,title,is_published,published_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          New post
        </Link>
      </div>
      <ul className="mt-6 space-y-2">
        {(posts ?? []).map((p) => (
          <li key={p.id}>
            <Link href={`/admin/blog/${p.id}`} className="text-emerald-900 hover:underline">
              {p.title}
            </Link>
            <span className="ml-2 text-xs text-zinc-500">
              {p.is_published ? "published" : "draft"} · {p.slug}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
