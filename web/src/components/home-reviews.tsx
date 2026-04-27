const REVIEWS = [
  {
    title: "Highly Recommended!",
    body: "Great prices, great service, and perfect delivery!",
    author: "Stephen Thomas",
  },
  {
    title: "Easy and Quick",
    body: "Easy and quick ordering, prices are amazing!",
    author: "Maureen Robidoux",
  },
  {
    title: "Great Customer Service!",
    body: "The customer service is above and beyond professional. The prices are extremely reasonable.",
    author: "CNH",
  },
  {
    title: "Fast Delivery!",
    body: "Fast delivery, reliable communication, my go-to from now on.",
    author: "Sean Kirby",
  },
] as const;

function Stars() {
  return (
    <div className="mb-4 flex justify-center text-filler-pink-400" aria-hidden>
      {"★★★★★"}
    </div>
  );
}

export function HomeReviews() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-14">
      <div className="rounded-2xl border border-filler-peach-200/90 bg-white/90 px-5 py-8 shadow-sm sm:px-8 sm:py-10">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-filler-ink">
          What Our Members Are Saying
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <article
              key={r.author}
              className="rounded-xl border border-filler-peach-200/80 bg-filler-cream/50 px-4 py-5 text-center"
            >
              <Stars />
              <h3 className="text-base font-semibold text-filler-ink">{r.title}</h3>
              <p className="mt-2 min-h-[4.5rem] text-sm leading-relaxed text-filler-ink/80">{r.body}</p>
              <p className="mt-4 text-sm font-medium text-filler-ink">{r.author}</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-filler-pink-100/70 px-2.5 py-1 text-xs font-medium text-filler-rose-800">
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
