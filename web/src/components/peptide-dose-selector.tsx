"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PeptideVariantGroup } from "@/lib/peptide-variants";

export function PeptideDoseSelector({
  group,
  currentSlug,
}: {
  group: PeptideVariantGroup;
  currentSlug: string;
}) {
  const pathname = usePathname();
  if (group.variants.length < 2) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">Dose</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {group.variants.map((v) => {
          const active = v.slug === currentSlug;
          return (
            <Link
              key={v.slug}
              href={`/product/${v.slug}`}
              scroll={pathname !== `/product/${v.slug}`}
              className={
                active
                  ? "rounded-full bg-teal-800 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-900"
              }
              aria-current={active ? "page" : undefined}
            >
              {v.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
