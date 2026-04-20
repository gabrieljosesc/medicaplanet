export default function ReturnsCancellationsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Returns & Cancellations</h1>
      <p className="text-sm text-zinc-700">
        Due to regulated medical supply handling, returns are limited and subject to product type,
        condition, and shipping controls.
      </p>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Cancellation requests</h2>
        <p>
          Cancellation may be possible before fulfillment confirmation. Once dispatched,
          cancellation is generally unavailable.
        </p>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Return eligibility</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Incorrect, damaged, or non-conforming items must be reported promptly.</li>
          <li>Temperature-sensitive or opened products are typically non-returnable.</li>
          <li>Approved returns require prior authorization from support.</li>
        </ul>
      </section>
      <p className="text-xs text-zinc-500">Last updated: April 2026</p>
    </article>
  );
}