const REVIEWS = [
  {
    title: "Highly Recommended!",
    body: "Great prices, great service, and perfect delivery!",
    author: "Dr. Carla Mendes",
  },
  {
    title: "Easy and Quick",
    body: "Easy and quick ordering, prices are amazing!",
    author: "Maureen Robidoux",
  },
  {
    title: "Great Customer Service!",
    body: "Customer service is above and beyond professional. Pricing is extremely reasonable.",
    author: "Aesthetic Care Group",
  },
  {
    title: "Fast Delivery!",
    body: "Fast delivery and reliable communication — my go-to from now on.",
    author: "Sean Kirby, RN",
  },
  {
    title: "Authentic Stock",
    body: "Genuine product, well packed, and quick to ship internationally.",
    author: "Dr. Aisha Patel",
  },
  {
    title: "Smooth Re-Orders",
    body: "Re-orders are seamless and pricing is consistent. Highly recommend for any clinic.",
    author: "Marco Russo, MD",
  },
] as const;

function Stars() {
  return (
    <div className="mb-2 flex justify-center text-filler-pink-400 text-sm" aria-hidden>
      {"★★★★★"}
    </div>
  );
}

export function HomeReviews() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <div className="rounded-2xl border border-filler-peach-200/90 bg-white/90 px-4 py-6 shadow-sm sm:px-6 sm:py-7">
        <h2 className="text-center text-xl font-semibold tracking-tight text-filler-ink sm:text-2xl">
          What Our Members Are Saying
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <article
              key={r.author}
              className="rounded-xl border border-filler-peach-200/80 bg-filler-cream/50 px-3 py-4 text-center"
            >
              <Stars />
              <h3 className="text-sm font-semibold text-filler-ink">{r.title}</h3>
              <p className="mt-1.5 min-h-[3rem] text-xs leading-relaxed text-filler-ink/80">{r.body}</p>
              <p className="mt-2.5 text-xs font-medium text-filler-ink">{r.author}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-filler-pink-100/70 px-2 py-0.5 text-[10px] font-medium text-filler-rose-800">
                <span aria-hidden>◉</span>
                Verified Purchase
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
