import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mic } from "lucide-react";
import { getCard } from "@/lib/server/store";
import { THEMES } from "@/lib/themes";
import { formatDuration } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { SiteNav } from "@/components/SiteNav";
import { PlayableCard } from "@/components/postcard/PlayableCard";
import { CardActions } from "@/components/card/CardActions";
import { VideoShareButton } from "@/components/card/VideoShareButton";
import { FALLBACK_TITLE } from "@/components/postcard/shared";

export const runtime = "nodejs";

interface CardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const { id } = await params;
  const lookup = await getCard(id);
  if (lookup.status !== "found") {
    return { title: "Carte introuvable" };
  }
  const card = lookup.card;
  const title = card.title || FALLBACK_TITLE;
  const description = [
    `Une carte postale sonore de ${formatDuration(card.duration)}`,
    card.location ? `envoyée depuis ${card.location}` : null,
    "— appuyez pour écouter.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title,
    description,
    openGraph: {
      title: `${title} · Cartouche`,
      description,
      type: "website",
      audio: [{ url: new URL(card.audioUrl, siteUrl()).toString() }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Cartouche`,
      description,
    },
  };
}

function StorageNotice() {
  return (
    <>
      <SiteNav />
      <main className="wrap flex flex-col items-center pb-16 pt-20 text-center">
        <div className="panel max-w-lg px-8 py-12">
          <h1 className="font-display text-3xl font-semibold italic">
            Le facteur n&apos;est pas encore passé
          </h1>
          <p className="mt-4 text-ink-soft">
            Le stockage des cartes n&apos;est pas configuré sur ce déploiement :
            ajoutez un Blob store Vercel au projet (variable{" "}
            <code className="rounded bg-paper-deep px-1.5 py-0.5 text-sm">
              BLOB_READ_WRITE_TOKEN
            </code>
            ), puis rechargez cette page.
          </p>
        </div>
      </main>
    </>
  );
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params;
  const lookup = await getCard(id);

  if (lookup.status === "unconfigured") {
    return <StorageNotice />;
  }
  if (lookup.status === "missing") {
    notFound();
  }

  const card = lookup.card;
  const theme = THEMES[card.theme];
  const title = card.title || FALLBACK_TITLE;

  return (
    <div className="relative isolate overflow-hidden">
      {/* Ambiance colorée derrière la carte */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 right-[-12%] h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
          style={{ background: theme.ambient[0] }}
        />
        <div
          className="absolute left-[-14%] top-1/3 h-[32rem] w-[32rem] rounded-full opacity-50 blur-3xl"
          style={{ background: theme.ambient[1] }}
        />
      </div>

      <SiteNav />
      <main className="wrap pb-16 pt-4">
        <h1 className="sr-only">{title} — carte postale sonore</h1>
        <div className="mx-auto max-w-2xl">
          <p className="kicker rise-in text-center">Une carte pour vous</p>
          <div className="pop-in mt-6">
            <PlayableCard card={card} />
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            Appuyez sur ▶ pour écouter — le petit bouton retourne la carte pour
            lire le message.
          </p>

          <div className="mt-8 flex flex-col items-center gap-5">
            <CardActions path={`/c/${card.id}`} title={title} />
            <VideoShareButton card={card} />
          </div>

          <div className="panel mx-auto mt-14 max-w-xl px-8 py-10 text-center">
            <h2 className="font-display text-2xl font-semibold italic">
              Envie d&apos;envoyer la vôtre&nbsp;?
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
              Trente secondes de vie — un rire, la mer, un bonne-nuit — dans une
              carte comme celle-ci. Gratuit, sans compte.
            </p>
            <Link href="/studio" className="btn btn-primary mt-6">
              <Mic className="h-4 w-4" aria-hidden />
              Créer ma carte
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
