/**
 * Vector illustration (no stock photo) — refined flat “professional at desk” motif
 * in the MedicaPlanet palette (peach / rose / mint / cream).
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
        {/* Ambient shapes */}
        <ellipse cx="300" cy="300" rx="160" ry="88" fill="#f5b4b4" opacity="0.45" />
        <ellipse cx="72" cy="96" rx="64" ry="44" fill="#fad4c0" opacity="0.5" />
        <ellipse cx="360" cy="88" rx="48" ry="30" fill="#e8a598" opacity="0.35" />

        {/* Desk surface */}
        <ellipse cx="210" cy="312" rx="168" ry="22" fill="#fff" opacity="0.95" />
        <ellipse cx="210" cy="312" rx="168" ry="22" fill="#fce5d6" opacity="0.35" />

        {/* Chair */}
        <path
          d="M118 268c0-42 28-68 72-68s72 26 72 68v44H118v-44z"
          fill="#5a9a7a"
          opacity="0.35"
        />
        <rect x="148" y="248" width="132" height="64" rx="10" fill="#4a8570" />

        {/* Torso — blazer */}
        <path
          d="M168 248c-4-52 32-96 84-96s88 44 84 96l-8 72H176l-8-72z"
          fill="#5a9a7a"
        />
        <path d="M186 232h108v12c-36 8-72 8-108 0v-12z" fill="#3d6b58" opacity="0.35" />

        {/* Neck */}
        <path d="M218 168h36v28h-36z" fill="#ffedd4" />

        {/* Head */}
        <ellipse cx="236" cy="142" rx="38" ry="44" fill="#ffedd4" />
        <ellipse cx="220" cy="138" rx="10" ry="11" fill="#f5cdb8" opacity="0.5" />
        <ellipse cx="252" cy="140" rx="9" ry="10" fill="#f5cdb8" opacity="0.45" />

        {/* Hair — side-swept bob */}
        <path
          d="M198 118c12-36 52-48 88-32 20 10 28 32 24 56-2 14-8 26-18 34 6-20 4-40-12-52-28-20-62-12-82 14-6 8-8 18-6 28-8-12-6-32 6-48z"
          fill="#2d1f1c"
        />
        <path
          d="M200 132c18-24 48-32 76-20 14 8 22 24 20 42-14-18-40-24-64-14-18 8-28 24-32 44-4-22 0-38 0-52z"
          fill="#3d2a26"
          opacity="0.85"
        />

        {/* Face */}
        <ellipse cx="224" cy="142" rx="2.8" ry="3.2" fill="#2d1f1c" />
        <ellipse cx="248" cy="142" rx="2.8" ry="3.2" fill="#2d1f1c" />
        <circle cx="225" cy="140" r="0.9" fill="#fff" opacity="0.7" />
        <circle cx="249" cy="140" r="0.9" fill="#fff" opacity="0.7" />
        <path
          d="M228 158c10 8 24 8 34 0"
          stroke="#c75c5c"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Arm + hand toward laptop */}
        <path
          d="M176 220c-8 20-4 48 16 64l28-8c-12-12-16-32-12-52"
          fill="#5a9a7a"
        />
        <ellipse cx="198" cy="286" rx="14" ry="10" fill="#ffedd4" />

        {/* Laptop */}
        <rect x="252" y="208" width="132" height="84" rx="8" fill="#fff" stroke="#2d1f1c" strokeOpacity="0.12" />
        <rect x="252" y="208" width="132" height="24" rx="7" fill="#b45353" />
        <rect x="268" y="244" width="72" height="3" rx="1.5" fill="#2d1f1c" fillOpacity="0.12" />
        <rect x="268" y="252" width="56" height="3" rx="1.5" fill="#2d1f1c" fillOpacity="0.08" />
        <path d="M252 292h132l-12 14H264l-12-14z" fill="#e8e4df" stroke="#2d1f1c" strokeOpacity="0.08" />

        {/* Legs / base */}
        <path d="M196 300h32l4 36h-28zM264 300h32l-4 36h-28z" fill="#2d1f1c" opacity="0.88" />
      </svg>
    </div>
  );
}
