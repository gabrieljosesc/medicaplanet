import type { PeptideCoaLink } from "@/lib/peptide-coa";

export function PeptideCoaSection({ links }: { links: PeptideCoaLink[] }) {
  if (!links.length) return null;

  return (
    <section className="mt-8 border-t border-zinc-200 pt-6" aria-labelledby="peptide-coa-heading">
      <h2 id="peptide-coa-heading" className="text-base font-semibold text-zinc-900">
        Certificate of Analysis
      </h2>
      <p className="mt-1 text-xs text-zinc-500">Third-party lab reports (opens in a new tab).</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={`${l.href}-${l.label}`}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-800/50 bg-white px-3 py-2 text-sm font-medium text-teal-900 shadow-sm transition hover:border-teal-800 hover:bg-teal-50 active:scale-[0.98]"
          >
            <span>{l.label}</span>
            <svg
              className="h-3.5 w-3.5 shrink-0 opacity-80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M14 3h7v7M10 14 21 3M21 14v7H3V3h7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
}
