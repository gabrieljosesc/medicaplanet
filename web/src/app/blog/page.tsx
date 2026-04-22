import Link from "next/link";
import Image from "next/image";
import { getSiteBlogCategories, getSiteBlogPosts } from "@/lib/site-blog";

export default async function BlogIndexPage() {
  const posts = getSiteBlogPosts();
  const categories = getSiteBlogCategories();

  return (
    <div>
      <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Blog</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10">
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-[16rem_minmax(0,1fr)]">
                <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden rounded-2xl bg-zinc-100">
                  <div className="relative aspect-[16/10] w-full">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 256px" />
                  </div>
                </Link>
                <div className="flex min-w-0 flex-col">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    <h2 className="text-xl font-semibold leading-tight text-zinc-900">{post.title}</h2>
                  </Link>
                  <p className="mt-2 text-sm text-zinc-500">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-3 line-clamp-4 text-base text-zinc-700">{post.excerpt}</p>
                  <div className="mt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex rounded-full bg-amber-200 px-4 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-amber-300"
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Categories</h3>
          <ul className="mt-3 space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <span className="text-base text-rose-400">{category}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
