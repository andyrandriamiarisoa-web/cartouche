import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { GalleryView } from "@/components/gallery/GalleryView";

export const metadata: Metadata = {
  title: "Ma galerie",
  description: "Les cartes postales sonores envoyées depuis cet appareil.",
};

export default function GalleryPage() {
  return (
    <>
      <SiteNav />
      <main className="wrap pb-16 pt-6">
        <div className="mb-10 text-center">
          <p className="kicker">Vos envois</p>
          <h1 className="mt-3 font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
            Ma galerie
          </h1>
        </div>
        <GalleryView />
      </main>
    </>
  );
}
