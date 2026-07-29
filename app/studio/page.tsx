import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { StudioFlow } from "@/components/studio/StudioFlow";

export const metadata: Metadata = {
  title: "Créer une carte",
  description:
    "Enregistrez 30 secondes de vie et envoyez-les dans une jolie carte postale sonore.",
};

export default function StudioPage() {
  return (
    <>
      <SiteNav hideCreate />
      <main className="wrap pb-16 pt-2">
        <StudioFlow />
      </main>
    </>
  );
}
