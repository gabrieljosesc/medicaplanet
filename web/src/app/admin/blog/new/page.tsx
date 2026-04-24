import Link from "next/link";
import { upsertBlogPostAction } from "@/app/actions/admin";

export default function AdminNewBlogPage() {
  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-teal-800 hover:underline">
        ← Blog
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">New post</h1>
      <form action={upsertBlogPostAction} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600">Slug</label>
          <input name="slug" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Title</label>
          <input name="title" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Excerpt</label>
          <textarea name="excerpt" rows={2} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Body (Markdown)</label>
          <textarea name="body" rows={14} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" />
          Published
        </label>
        <button type="submit" className="rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white">
          Save
        </button>
      </form>
    </div>
  );
}
