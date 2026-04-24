/**
 * Vector illustration (no stock photo) — simple friendly “professional with product” motif
 * in the fillersupplies-style color story (peach / pink / mint / mustard on cream).
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className ?? ""}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 480 400"
        className="h-auto w-full max-w-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="300" cy="310" rx="200" ry="100" fill="#f5b4b4" opacity="0.55" />
        <ellipse cx="90" cy="90" rx="80" ry="50" fill="#fad4c0" opacity="0.45" />
        <ellipse cx="400" cy="100" rx="50" ry="32" fill="#e8a598" opacity="0.35" />

        {/* Seat */}
        <ellipse cx="200" cy="300" rx="100" ry="20" fill="#fff" />
        <path
          d="M220 200c0-20 20-30 30-20s25 20 20 50-15 50-20 100h-80c-5-40-5-100 10-120s40-10 50-20z"
          fill="#5a9a7a"
        />
        <path
          d="M200 200h-30l-18 35h-20c4-20 20-20 32-4l-10-80c20-32 50-20 50 0z"
          fill="#c9a227"
        />
        <path
          d="M185 300h-25l6 50h20zM265 300h-28l-5 50h20z"
          fill="#2d1f1c"
        />
        <ellipse cx="220" cy="150" rx="32" ry="40" fill="#ffedd4" />
        <path
          d="M188 145c-8-8 2-30 20-16 6-12 20-4 0 0zM225 150h2c2 2 0 0 0-2h-2z"
          fill="#2d1f1c"
        />
        <ellipse cx="200" cy="150" rx="2.2" ry="1.4" fill="#2d1f1c" />
        <ellipse cx="238" cy="152" rx="2.2" ry="1.4" fill="#2d1f1c" />
        <path d="M215 178c8-2 18 0 18 0" stroke="#e89898" strokeWidth="1.2" />
        <path
          d="M175 155c-28 12-42 36-28 52s40 0 32-20z"
          fill="#2d1f1c"
        />
        <rect
          x="256"
          y="188"
          width="112"
          height="88"
          rx="7"
          fill="white"
          stroke="#2d1f1c"
          strokeOpacity="0.12"
        />
        <rect
          x="256"
          y="188"
          width="112"
          height="22"
          rx="6"
          fill="#b45353"
        />
        <rect
          x="280"
          y="248"
          width="64"
          height="3"
          rx="1.5"
          fill="#2d1f1c"
          fillOpacity="0.18"
        />
        <rect
          x="280"
          y="256"
          width="48"
          height="3"
          rx="1.5"
          fill="#2d1f1c"
          fillOpacity="0.12"
        />
        <circle cx="300" cy="300" r="5" fill="#b45353" />
      </svg>
    </div>
  );
}
