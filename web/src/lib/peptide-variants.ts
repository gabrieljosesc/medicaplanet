import groupsJson from "@/data/peptide-variant-groups.json";

export type PeptideDoseVariant = { slug: string; label: string };

export type PeptideVariantGroup = {
  label: string;
  variants: PeptideDoseVariant[];
};

const groups = (groupsJson as { groups: Record<string, PeptideVariantGroup> }).groups ?? {};

/** Dose variants for this product slug, if it belongs to a multi-dose group. */
export function getPeptideVariantGroup(productSlug: string): PeptideVariantGroup | null {
  for (const g of Object.values(groups)) {
    if (g.variants.some((v) => v.slug === productSlug)) return g;
  }
  return null;
}
