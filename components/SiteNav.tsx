import Link from "next/link";
import { GalleryHorizontalEnd, Plus } from "lucide-react";
import { Wordmark } from "@/components/Logo";

interface SiteNavProps {
  /** Masque le bouton « Créer » (sur le studio lui-même). */
  hideCreate?: boolean;
}

export function SiteNav({ hideCreate = false }: SiteNavProps) {
  return (
    <header className="wrap flex items-center justify-between gap-4 py-5">
      <Wordmark />
      <nav className="flex items-center gap-2.5" aria-label="Navigation principale">
        <Link href="/galerie" className="btn btn-ghost btn-sm">
          <GalleryHorizontalEnd className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Ma galerie</span>
          <span className="sm:hidden">Galerie</span>
        </Link>
        {!hideCreate && (
          <Link href="/studio" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Créer une carte</span>
            <span className="sm:hidden">Créer</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
