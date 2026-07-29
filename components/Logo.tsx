import Link from "next/link";

/** L'ovale « cartouche » (comme le hiéroglyphe) autour d'une forme d'onde. */
export function CartoucheGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.75"
        y="1.75"
        width="44.5"
        height="28.5"
        rx="14.25"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <rect x="12" y="12.5" width="3.4" height="7" rx="1.7" fill="currentColor" />
      <rect x="18.2" y="8.5" width="3.4" height="15" rx="1.7" fill="currentColor" />
      <rect x="24.4" y="10.5" width="3.4" height="11" rx="1.7" fill="currentColor" />
      <rect x="30.6" y="7" width="3.4" height="18" rx="1.7" fill="currentColor" />
      <rect x="36.8" y="12.5" width="3.4" height="7" rx="1.7" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 text-ink transition-colors hover:text-accent"
      aria-label="Cartouche — accueil"
    >
      <CartoucheGlyph className="h-6 w-9 flex-none text-accent transition-transform duration-300 group-hover:-rotate-3" />
      {!compact && (
        <span className="hidden font-display text-2xl font-semibold tracking-tight min-[420px]:inline">
          Cartouche
        </span>
      )}
    </Link>
  );
}
