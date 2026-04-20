import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: featured }, { data: posts }] = await Promise.all([
    supabase.from("categories").select("slug,name,description,sort_order").order("sort_order"),
    supabase
      .from("products")
      .select("slug,title,base_price,currency,rating,review_count, product_images(url)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("title")
      .limit(8),
    supabase
      .from("blog_posts")
      .select("slug,title,excerpt,published_at")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const feat = (featured ?? []).map((p) => ({
    ...p,
    imageUrl: Array.isArray(p.product_images) ? p.product_images[0]?.url : null,
  }));

  return (
    <div className="space-y-14">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 px-6 py-12 text-white shadow-lg sm:px-10">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-200/90">
          Licensed professionals
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          Original injectables & research peptides at advantageous wholesale-style pricing
        </h1>
        <p className="mt-4 max-w-xl text-sm text-emerald-100/90">
          Browse dermal fillers, botulinum toxins, mesotherapy, orthopedic injectables, skincare, and our
          dedicated peptides section. Orders are reviewed by CSR; payment is completed offline per
          your workflow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 shadow hover:bg-emerald-50"
          >
            Browse catalog
          </Link>
          <Link
            href="/peptides"
            className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Peptides
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { t: "Referral-style savings", d: "Volume-friendly pricing for returning clinics." },
          { t: "Express-oriented shipping", d: "Options discussed at checkout with CSR." },
          { t: "Cold-chain awareness", d: "Ice packs / validated shippers where required." },
          { t: "Authenticity focus", d: "Source traceability handled with your compliance team." },
        ].map((x) => (
          <div key={x.t} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-900">{x.t}</h2>
            <p className="mt-2 text-sm text-zinc-600">{x.d}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-900">Categories</h2>
          <Link href="/shop" className="text-sm font-medium text-emerald-800 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories ?? []).map((c) => (
            <Link
              key={c.slug}
              href={c.slug === "peptides" ? "/peptides" : `/category/${c.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-300"
            >
              <h3 className="font-semibold text-emerald-900">{c.name}</h3>
              {c.description && (
                <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{c.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Catalog highlights</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {feat.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No active products yet. Apply the Supabase migration and run{" "}
              <code className="rounded bg-zinc-100 px-1">npm run import:catalog</code> from the repo
              root.
            </p>
          ) : (
            feat.map((p) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                title={p.title}
                price={Number(p.base_price)}
                currency={p.currency}
                rating={Number(p.rating)}
                reviewCount={p.review_count}
                imageUrl={p.imageUrl}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-900">From the blog</h2>
          <Link href="/blog" className="text-sm font-medium text-emerald-800 hover:underline">
            All posts
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(posts ?? []).map((b) => (
            <Link
              key={b.slug}
              href={`/blog/${b.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-emerald-300"
            >
              <h3 className="font-semibold text-emerald-900">{b.title}</h3>
              {b.excerpt && <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{b.excerpt}</p>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
