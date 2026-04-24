import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how MedicaPlanet supports licensed clinics with authentic products, competitive pricing, and reliable global fulfillment.",
};

const pillars = [
  {
    title: "Authentic products only",
    body: "We source from licensed partners and focus on products with traceable lot information and manufacturer-standard packaging.",
  },
  {
    title: "Wholesale-minded pricing",
    body: "Direct procurement and streamlined operations help clinics protect margins while keeping treatment quality high.",
  },
  {
    title: "Reliable fulfillment",
    body: "We coordinate fast dispatch routes, practical cold-chain handling when required, and responsive delivery support.",
  },
  {
    title: "Professional-first support",
    body: "Our team helps with product selection, order planning, and account guidance so your clinic can buy with confidence.",
  },
];

const trustPoints = [
  "Built for licensed medical and aesthetic professionals",
  "International supply coverage with compliance-first review",
  "Clear communication from order placement to dispatch",
  "Focused catalog across injectables, skincare, and research peptides",
];

export default function AboutUsPage() {
  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          About MedicaPlanet
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          A dependable supply partner for modern clinics
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-700 sm:text-base">
          MedicaPlanet is built for practices that need authentic products, strong pricing, and
          consistent delivery performance. We combine wholesale-style sourcing with practical support
          so licensed professionals can keep shelves stocked, protect profitability, and stay focused
          on patient outcomes.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-700 sm:text-base">
          From dermal fillers and botulinum products to mesotherapy, skincare, and research peptides,
          our model is simple: verified supply, straightforward ordering, and service that respects
          the speed clinics need.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
          >
            Browse catalog
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full border border-teal-800 px-5 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
          >
            Create professional account
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {pillars.map((item) => (
          <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-teal-950">Why clinics choose MedicaPlanet</h2>
        <ul className="mt-4 grid gap-2 text-sm text-teal-900 sm:grid-cols-2">
          {trustPoints.map((point) => (
            <li key={point} className="rounded-lg bg-white/70 px-3 py-2">
              {point}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
