import coaRaw from "../../data/peptide-coa.json";

export type PeptideCoaLink = { label: string; href: string };

type CoaFile = {
  entries: Record<string, { label: string; file: string }[]>;
  slugAliases?: Record<string, string>;
};

const coaData = coaRaw as CoaFile;

function coaHref(file: string): string {
  const safe = file.replace(/^\//, "").split("/").filter(Boolean);
  return `/COA/${safe.map(encodeURIComponent).join("/")}`;
}

/**
 * COA PDF links for a peptide product slug. Keys match `public/COA/*.pdf` and
 * catalogue slugs after `slugAliases` normalization.
 */
export function getPeptideCoaLinks(slug: string): PeptideCoaLink[] {
  const aliases = coaData.slugAliases ?? {};
  const canon = aliases[slug] ?? slug;
  const rows = coaData.entries[canon] ?? coaData.entries[slug] ?? [];
  return rows.map((r) => ({ label: r.label, href: coaHref(r.file) }));
}
