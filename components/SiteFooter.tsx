import { CartoucheGlyph } from "@/components/Logo";
import { SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line/70">
      <div className="wrap flex flex-col items-center gap-3 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5 text-ink-soft">
          <CartoucheGlyph className="h-5 w-8 text-accent/80" />
          <p className="text-sm">
            <span className="font-semibold text-ink">Cartouche</span> — {SITE_TAGLINE.toLowerCase()}
          </p>
        </div>
        <p className="text-sm text-ink-soft">
          30 secondes de vie, à écouter sans compte ni application.
        </p>
      </div>
    </footer>
  );
}
