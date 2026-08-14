/**
 * FDA / CE regulatory badges shown on product cards and the product page,
 * rendered only when the product carries the flag. Uses the standard
 * "FDA Approved" and CE conformity marks (SVGs in /public/badges), matching
 * how these marks appear across the aesthetics-supply industry.
 */
export function ProductCertBadges({
  fdaApproved,
  ceMarked,
  size = "sm",
  className = "",
}: {
  fdaApproved?: boolean | null;
  ceMarked?: boolean | null;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!fdaApproved && !ceMarked) return null;
  const h = size === "md" ? "h-8" : "h-6";

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`} aria-label="Regulatory approvals">
      {fdaApproved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/badges/fda-approved.svg" alt="FDA approved" className={`${h} w-auto`} />
      ) : null}
      {ceMarked ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/badges/ce-approved.svg" alt="CE marked" className={`${h} w-auto`} />
      ) : null}
    </div>
  );
}
