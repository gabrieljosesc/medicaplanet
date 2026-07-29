/**
 * FDA / CE regulatory badges shown on product cards and the product page.
 * Rendered only when the product carries the flag. Mirrors medicadepot's
 * "FDA Approved" and "CE (EU Approved)" marks.
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
  const box = size === "md" ? "h-6" : "h-5";
  const text = size === "md" ? "text-[11px]" : "text-[10px]";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`} aria-label="Regulatory approvals">
      {fdaApproved ? (
        <span
          className={`inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-1.5 ${box} font-semibold ${text} uppercase tracking-wide text-teal-800`}
          title="FDA approved"
        >
          <svg viewBox="0 0 20 20" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          FDA
        </span>
      ) : null}
      {ceMarked ? (
        <span
          className={`inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 ${box} font-semibold ${text} uppercase tracking-wide text-blue-800`}
          title="CE marked (EU approved)"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true">
            {/* Stylised CE mark */}
            <path d="M11.5 4a8 8 0 100 16 8.2 8.2 0 003-.57 6 6 0 110-14.86A8.2 8.2 0 0011.5 4z" />
            <path d="M21.5 8.2a6 6 0 000 7.6 6.6 6.6 0 01-2 .2V8a6.6 6.6 0 012 .2z" />
          </svg>
          CE
        </span>
      ) : null}
    </div>
  );
}
