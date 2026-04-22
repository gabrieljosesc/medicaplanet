import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSiteBlogPostBySlug } from "@/lib/site-blog";

type Props = { params: Promise<{ slug: string }> };

function buildToc(markdown: string): string[] {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, ""));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getSiteBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getSiteBlogPostBySlug(slug);

  if (!post) notFound();
  const toc = buildToc(post.body);

  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="min-w-0">
        <Link href="/blog" className="text-sm font-medium text-emerald-800 no-underline hover:underline">
          ← Blog
        </Link>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-zinc-900">{post.title}</h1>
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
          <div className="relative aspect-[16/8] w-full">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" priority />
          </div>
        </div>
        <div className="prose prose-zinc prose-headings:font-semibold mt-6 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">{children}</h3>
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>
      </div>
      <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-900">{post.author.name}</p>
          <p className="mt-1 text-sm text-zinc-600">{post.author.role}</p>
          <p className="mt-3 text-sm text-zinc-600">
            Published on{" "}
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <h2 className="mt-5 text-lg font-semibold text-zinc-900">Table of Contents</h2>
        <ul className="mt-2 space-y-2">
          {toc.map((item) => (
            <li key={item} className="text-sm text-rose-400">
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
