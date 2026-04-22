export type SiteBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Botulinum" | "Dermal Fillers" | "Mesotherapy" | "OB-GYN";
  publishedAt: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
  };
  body: string;
};

const POSTS: SiteBlogPost[] = [
  {
    slug: "botulax-vs-botox-practice-guide",
    title: "Botulax vs Botox: A Practical Guide for Consistent Results",
    excerpt:
      "A clinic-focused comparison of diffusion, onset, and treatment planning so practitioners can choose confidently.",
    category: "Botulinum",
    publishedAt: "2026-03-17T08:47:20.000Z",
    coverImage:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80",
    author: {
      name: "Clinical Content Team",
      role: "Aesthetic Product Education",
    },
    body: `In aesthetic practice, both Botulax and Botox are widely used for dynamic wrinkle management. Choosing between them usually depends on consistency, injector familiarity, and patient response history.

## Formulation and handling

Both products require careful dilution and documentation. Standardizing your dilution protocol and labeling every prepared vial reduces variability between sessions.

## Onset and duration in real clinics

Many practitioners observe differences in onset time between patients, not just brands. Factors such as muscle mass, dose accuracy, and reconstitution technique heavily influence outcomes.

## Practical decision framework

- Use your most predictable product for first-time patients with event-driven timelines.
- Use follow-up review checkpoints (10-14 days) to tune dose plans.
- Track lot numbers and response notes to improve future treatment planning.

## Safety notes

Always follow licensed indications, informed consent standards, and local prescribing rules. Conservative initial dosing is generally safer than aggressive correction.`,
  },
  {
    slug: "dermal-filler-selection-by-treatment-goal",
    title: "How to Select Dermal Fillers by Treatment Goal",
    excerpt:
      "Match filler rheology and depth with treatment goals for lips, cheeks, nasolabial folds, and contour refinements.",
    category: "Dermal Fillers",
    publishedAt: "2026-02-26T10:15:00.000Z",
    coverImage:
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=1400&q=80",
    author: {
      name: "MedicaPlanet Academy",
      role: "Clinical Operations",
    },
    body: `Dermal filler selection improves when the treatment objective is defined before product choice. Start from anatomy and patient expectations, then choose product profile.

## Lips and perioral refinement

For lips, prioritize control and soft integration. Smaller bolus strategy and staged sessions usually improve symmetry and reduce over-correction risk.

## Midface support

Cheek work often requires stronger projection and structure retention. Support vectors and depth planning are more important than simply adding volume.

## Fine lines and superficial correction

For superficial planes, choose products designed for soft spread and lower palpability risk. Technique discipline is critical in thin-skin areas.

## Consultation checklist

- Clarify expected longevity.
- Explain probable swelling timeline.
- Document baseline photos and contraindications.
- Plan review and maintenance windows.`,
  },
  {
    slug: "mesotherapy-protocols-for-busy-clinics",
    title: "Mesotherapy Protocols for Busy Clinics",
    excerpt:
      "Build repeatable mesotherapy workflows that balance patient comfort, inventory usage, and predictable follow-up cycles.",
    category: "Mesotherapy",
    publishedAt: "2026-01-29T09:20:00.000Z",
    coverImage:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80",
    author: {
      name: "Clinical Content Team",
      role: "Practice Efficiency",
    },
    body: `Mesotherapy can become operationally heavy without protocol structure. Standardized treatment bundles and clear appointment spacing help maintain quality at scale.

## Protocol design

Define protocol families by concern (hydration, dullness, texture, maintenance). Keep inclusion criteria simple for front-desk triage and pre-consult booking.

## Session cadence

Short initial cycles with later maintenance generally improve adherence. Communicate expected visible milestones so patients understand gradual improvements.

## Inventory and prep

Use tray checklists and pre-session prep windows to reduce idle chair time. Batch planning by treatment type can also improve stock control.

## Documentation standards

Record product, dose, lot, depth, and response at every visit. Structured notes reduce variance among providers.`,
  },
  {
    slug: "cold-chain-handling-for-injectables",
    title: "Cold-Chain Handling for Injectables: What Teams Should Standardize",
    excerpt:
      "A practical SOP outline for receiving, storing, and auditing temperature-sensitive products in clinical settings.",
    category: "OB-GYN",
    publishedAt: "2025-12-10T13:00:00.000Z",
    coverImage:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
    author: {
      name: "Operations Desk",
      role: "Supply & Compliance",
    },
    body: `Temperature-sensitive products require disciplined handoffs. A clear cold-chain SOP protects both product integrity and patient outcomes.

## Receiving checklist

- Confirm package integrity on arrival.
- Capture receiving time and condition photos.
- Log immediately into inventory records.

## Storage controls

Use dedicated monitored refrigeration with alerting. Avoid mixed-use units where frequent door opening causes temperature swings.

## Team training

Define who can receive, store, and release products. Quick training refreshers reduce accidental non-compliant handling.`,
  },
];

function normalizeDate(value: string): number {
  return new Date(value).getTime();
}

export function getSiteBlogPosts(limit?: number): SiteBlogPost[] {
  const sorted = [...POSTS].sort((a, b) => normalizeDate(b.publishedAt) - normalizeDate(a.publishedAt));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export function getSiteBlogPostBySlug(slug: string): SiteBlogPost | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}

export function getSiteBlogCategories(): SiteBlogPost["category"][] {
  return [...new Set(getSiteBlogPosts().map((p) => p.category))];
}
