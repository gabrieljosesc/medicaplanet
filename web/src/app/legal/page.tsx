import Link from "next/link";

const pages = [
  {
    href: "/legal/verification",
    title: "Professional Verification Policy",
    desc: "How we verify licensed professionals before fulfillment.",
  },
  {
    href: "/legal/terms",
    title: "Terms of Supply",
    desc: "Order workflow, account duties, and acceptable purchasing use.",
  },
  {
    href: "/legal/privacy",
    title: "Privacy Notice",
    desc: "How account, order, and verification data are collected and used.",
  },
  {
    href: "/legal/shipping-cold-chain",
    title: "Shipping & Cold-Chain Policy",
    desc: "Dispatch windows, carrier handling, and temperature-sensitive goods.",
  },
  {
    href: "/legal/return-policy",
    title: "Return policy",
    desc: "5-day return program, future credit, reshipment, and refunds.",
  },
  {
    href: "/legal/referral-program",
    title: "Referral program",
    desc: "Rewards for referring qualified professional colleagues who place qualifying orders.",
  },
];

export default function LegalHubPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Legal & Policy Center</h1>
      <p className="mt-2 text-sm text-zinc-600">
        These policies explain professional verification, supply terms, shipping controls, and
        data handling for MedicaPlanet account and order activity.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {pages.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-teal-300"
            >
              <h2 className="text-base font-semibold text-teal-900">{p.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}