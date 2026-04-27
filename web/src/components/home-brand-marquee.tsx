import Image from "next/image";
import Link from "next/link";
import type { HomeBrandMarqueeItem } from "@/lib/home-brand-marquee";

function BrandCardVisual({
  item,
  interactive,
}: {
  item: HomeBrandMarqueeItem;
  interactive: boolean;
}) {
  const body = (
    <>
      <div className="flex h-12 items-center justify-center px-1">
        <Image
          src={item.logoSrc}
          alt=""
          width={200}
          height={48}
          className="max-h-10 w-auto max-w-[180px] object-contain object-center"
          aria-hidden
          unoptimized
        />
      </div>
      <p className="mt-2 text-center text-xs font-semibold tracking-wide text-filler-ink/80">
        {item.displayName}
      </p>
      <p className="mt-3 text-center text-[11px] leading-snug text-filler-ink/85 sm:text-xs">
        <span className="font-semibold text-filler-rose-800">{item.count}</span>{" "}
        {item.count === 1 ? "product" : "products"} in the brands catalog
      </p>
    </>
  );

  const shell =
    "flex w-[188px] shrink-0 flex-col rounded-2xl border border-filler-peach-200/90 bg-white px-3 pb-4 pt-4 shadow-sm sm:w-[200px]";

  if (interactive) {
    return (
      <Link
        href={item.href}
        className={`${shell} transition hover:border-filler-pink-300 hover:shadow-md`}
        aria-label={`${item.displayName}, ${item.count} products in catalog`}
      >
        {body}
      </Link>
    );
  }

  return (
    <div className={shell} aria-hidden>
      {body}
    </div>
  );
}

export function HomeBrandMarquee({ items }: { items: HomeBrandMarqueeItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="relative border-b border-filler-peach-200/60 bg-gradient-to-b from-filler-cream to-white py-8 sm:py-10"
      aria-label="Brand partners"
    >
      <div className="pointer-events-none absolute left-1/2 top-6 z-0 flex -translate-x-1/2 gap-2" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-filler-pink-400/90" />
        <span className="h-2 w-2 rounded-full bg-filler-peach-300" />
        <span className="h-2 w-2 rounded-full bg-filler-pink-300/80" />
      </div>

      <div className="home-brand-marquee-wrap relative z-[1] mt-5 overflow-hidden">
        <div className="home-brand-marquee-track flex w-max">
          <div className="flex shrink-0 items-stretch gap-3 pr-3 sm:gap-4 sm:pr-4">
            {items.map((item) => (
              <BrandCardVisual key={item.id} item={item} interactive />
            ))}
          </div>
          <div
            className="home-brand-marquee-ghost flex shrink-0 items-stretch gap-3 pr-3 sm:gap-4 sm:pr-4"
            aria-hidden
            inert
          >
            {items.map((item) => (
              <BrandCardVisual key={`dup-${item.id}`} item={item} interactive={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
