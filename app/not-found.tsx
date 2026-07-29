import Link from "next/link";
import { Mic } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { CartoucheGlyph } from "@/components/Logo";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="wrap flex flex-col items-center pb-16 pt-16 text-center">
        <div
          className="panel max-w-lg rotate-[-1.5deg] border-2 border-dashed !border-line px-8 py-14"
        >
          <CartoucheGlyph className="mx-auto h-8 w-12 text-accent/70" />
          <h1 className="mt-5 font-display text-3xl font-semibold italic">
            Cette carte s&apos;est perdue en chemin…
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm text-ink-soft">
            Le lien est peut-être incomplet, ou la carte a été retirée par la
            personne qui l&apos;avait envoyée.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/studio" className="btn btn-primary">
              <Mic className="h-4 w-4" aria-hidden />
              Créer une carte
            </Link>
            <Link href="/" className="btn btn-ghost">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
