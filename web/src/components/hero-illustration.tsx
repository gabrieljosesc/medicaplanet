/**
 * Vector illustration — soft, feminine “at work” scene (peach / rose / cream).
 * Custom SVG, no stock assets.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className ?? ""}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 420 360"
        className="h-auto w-full max-w-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient: soft pinks + hearts */}
        <ellipse cx="300" cy="300" rx="150" ry="80" fill="#ffd6e0" opacity="0.4" />
        <ellipse cx="64" cy="100" rx="70" ry="48" fill="#fce5d6" opacity="0.65" />
        <path
          d="M48 200l4 6c2 3 6 3 8 0l4-6-8-4-8 4z"
          fill="#f5b4c8"
          opacity="0.55"
        />
        <path
          d="M340 120l5 7c2 2 5 2 7 0l5-7-8.5-3.5-8.5 3.5z"
          fill="#f0a0b4"
          opacity="0.45"
        />
        <circle cx="92" cy="220" r="3" fill="#e8a598" opacity="0.5" />

        {/* Floor glow */}
        <ellipse cx="210" cy="318" rx="160" ry="20" fill="#fff" opacity="0.85" />

        {/* Chair (soft) */}
        <path
          d="M120 270c0-40 32-64 80-64s80 24 80 64v32H120v-32z"
          fill="#e8a8b8"
          opacity="0.4"
        />

        {/* Body — soft rose cardigan */}
        <path
          d="M162 256c-6-48 30-90 90-90s96 42 90 90l-6 68H168l-6-68z"
          fill="#e8a0b4"
        />
        <path d="M178 228h148v10c-44 10-88 10-132 0v-10z" fill="#d4849a" opacity="0.35" />

        {/* Skirt / lower soft fold */}
        <path d="M200 300h100c-8 24-28 40-50 40s-42-16-50-40z" fill="#c75c5c" opacity="0.45" />

        {/* Neck + shoulders */}
        <path d="M200 160h64v32h-64z" fill="#ffedd4" />

        {/* Head */}
        <ellipse cx="232" cy="132" rx="40" ry="48" fill="#ffedd4" />
        <ellipse cx="210" cy="128" rx="10" ry="9" fill="#f8c4d0" opacity="0.4" />
        <ellipse cx="250" cy="128" rx="8" ry="7" fill="#f8c4d0" opacity="0.35" />

        {/* Wavy long hair + side sweep */}
        <path
          d="M168 96c24-40 80-48 120-20 28 18 36 52 28 88-6 28-24 50-40 64 12-32 10-64-6-90-20-32-64-40-100-8-8 6-12 20-8 32-4-8-2-20 4-32 8-18 2-20 2-24z"
          fill="#3d2a26"
        />
        <path
          d="M180 120c20-20 50-32 80-20 20 8 32 32 30 60-2 22-20 50-50 64 18-28 24-50 16-70-6-16-20-24-40-20-20 4-32 20-40 40-2-8 0-18 4-54z"
          fill="#2d1f1c"
          opacity="0.9"
        />
        <path
          d="M200 200c-8 0-20 4-32 20-4 6-4 20 8 28l12-4c-4-12-2-20 4-32 8-16 16-8 8-12z"
          fill="#2d1f1c"
        />
        <ellipse cx="198" cy="256" rx="10" ry="8" fill="#2d1f1c" opacity="0.85" />

        {/* Simple flower behind ear */}
        <g transform="translate(268 108)">
          <circle r="4" fill="#f5a0b8" />
          <circle cx="5" cy="2" r="3.5" fill="#ffd0dc" />
          <circle cx="-3" cy="3" r="3.5" fill="#ffd0dc" />
        </g>

        {/* Face */}
        <ellipse cx="220" cy="130" rx="2.4" ry="2.8" fill="#2d1f1c" />
        <ellipse cx="248" cy="128" rx="2.4" ry="2.8" fill="#2d1f1c" />
        <path
          d="M224 148c10 6 20 6 32 0"
          stroke="#e07090"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <ellipse cx="212" cy="140" rx="5" ry="3" fill="#f8a0b0" opacity="0.25" />
        <ellipse cx="256" cy="136" rx="4" ry="2.5" fill="#f8a0b0" opacity="0.22" />

        {/* Hand + laptop (rose chrome) */}
        <ellipse cx="196" cy="250" rx="12" ry="8" fill="#ffedd4" />
        <rect
          x="220"
          y="196"
          width="128"
          height="82"
          rx="8"
          fill="#fff8fa"
          stroke="#f0c0d0"
          strokeWidth="1.2"
        />
        <rect x="220" y="196" width="128" height="22" rx="7" fill="#e07090" />
        <rect
          x="240"
          y="232"
          width="64"
          height="2.5"
          rx="1"
          fill="#2d1f1c"
          opacity="0.1"
        />
        <path
          d="M220 282h128l-10 12H230l-10-12z"
          fill="#fce8f0"
          stroke="#f0c0d0"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}
