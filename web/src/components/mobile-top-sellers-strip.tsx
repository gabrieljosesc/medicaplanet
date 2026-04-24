import Image from "next/image";
import Link from "next/link";

type TopSeller = {
  slug: string;
  title: string;
  heroImageSrc: string;
  imageUnoptimized: boolean;
  base_price: number;
  currency: string;
};

export function MobileTopSellersStrip({ products }: { products: TopSeller[] }) {
  if (products.length === 0) return null;

  return (
    <section className="sm:hidden">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-base font-semibold text-filler-ink">Catalog picks</h2>
        <Link href="/shop" className="text-xs font-medium text-filler-rose-800 hover:underline">
          View all
        </Link>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x snap-mandatory gap-3">
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/product/${p.slug}`}
              className="w-[160px] shrink-0 snap-start rounded-2xl border border-filler-peach-200/90 bg-white p-2 shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-filler-cream">
                <Image
                  src={p.heroImageSrc}
                  alt={p.title}
                  fill
                  className="object-contain"
                  sizes="160px"
                  unoptimized={p.imageUnoptimized}
                />
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-filler-ink">
                {p.title}
              </p>
              <p className="mt-1 text-xs font-medium text-filler-rose-800">
                {p.currency} {Math.round(Number(p.base_price) || 0)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
