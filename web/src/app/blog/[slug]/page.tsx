import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .single();

  if (!post) notFound();

  return (
    <article className="prose prose-zinc prose-headings:font-semibold max-w-3xl">
      <Link href="/blog" className="text-sm font-medium text-emerald-800 no-underline hover:underline">
        ← Blog
      </Link>
      <h1 className="mt-4">{post.title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
    </article>
  );
}
