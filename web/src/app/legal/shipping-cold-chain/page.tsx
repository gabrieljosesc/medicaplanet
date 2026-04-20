export default function ShippingColdChainPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Shipping & Cold-Chain Policy</h1>
      <p className="text-sm text-zinc-700">
        Certain products require controlled handling. Dispatch methods are selected by CSR based on
        destination, regulatory constraints, and temperature sensitivity.
      </p>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Dispatch and handling</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Orders are released after compliance and stock review.</li>
          <li>Temperature-sensitive SKUs may ship with insulated packaging and priority service.</li>
          <li>Some regions or weather windows may delay dispatch for product integrity.</li>
        </ul>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Delivery responsibility</h2>
        <p>
          Customers should ensure authorized receipt and appropriate storage conditions immediately
          on delivery, especially for cold-chain items.
        </p>
      </section>
      <p className="text-xs text-zinc-500">Last updated: April 2026</p>
    </article>
  );
}