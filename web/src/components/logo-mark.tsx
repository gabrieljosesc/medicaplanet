/** Filler-supplies style mark: small stacked color dots. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center ${className ?? ""}`}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8">
        <circle cx="11" cy="12" r="5" fill="#f0a0a0" />
        <circle cx="22" cy="10" r="4.5" fill="#fad4c0" />
        <circle cx="18" cy="20" r="4.2" fill="#5a9a7a" />
        <circle cx="8" cy="22" r="3.5" fill="#e8a598" />
      </svg>
    </span>
  );
}
