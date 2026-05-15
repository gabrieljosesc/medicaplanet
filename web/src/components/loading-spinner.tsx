/** Small inline spinner for buttons and loading states. */
export function LoadingSpinner({
  className = "h-4 w-4",
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={label ? undefined : true}
      role={label ? "status" : undefined}
      aria-label={label || undefined}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
