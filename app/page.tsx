import Link from "next/link";
import { Link2, Mic, Palette, Send, Smartphone, UserRound } from "lucide-react";
import { DEMO_CARD } from "@/lib/demo";
import { THEMES } from "@/lib/themes";
import type { CardData } from "@/lib/types";
import { SiteNav } from "@/components/SiteNav";
import { PlayableCard } from "@/components/postcard/PlayableCard";
import { PostcardShell } from "@/components/postcard/PostcardShell";
import { PostcardFront } from "@/components/postcard/PostcardFront";

/** Formes d'onde décoratives et déterministes pour les cartes d'exposition. */
function samplePeaks(seed: number): number[] {
  return Array.from({ length: 72 }, (_, i) => {
    const wave =
      Math.abs(Math.sin(i * 0.34 + seed)) * 0.55 +
      Math.abs(Math.sin(i * 0.11 + seed * 2.3)) * 0.45;
    return Math.round(Math.min(1, 0.15 + wave * 0.85) * 100) / 100;
  });
}

const SHOWCASE: CardData[] = [
  {
    id: "expo-riviera",
    title: "Les vagues, pour vous",
    message: "",
    location: "Sanary-sur-Mer",
    theme: "riviera",
    createdAt: "2026-07-24T10:00:00.000Z",
    duration: 24,
    peaks: samplePeaks(1),
    audioUrl: "",
    version: 1,
  },
  {
    id: "expo-crepuscule",
    title: "Le soir au balcon",
    message: "",
    location: "Lisbonne",
    theme: "crepuscule",
    createdAt: "2026-06-12T20:30:00.000Z",
    duration: 18,
    peaks: samplePeaks(2),
    audioUrl: "",
    version: 1,
  },
  {
    id: "expo-minuit",
    title: "Bonne nuit, papi",
    message: "",
    location: "",
    theme: "minuit",
    createdAt: "2026-03-02T21:15:00.000Z",
    duration: 12,
    peaks: samplePeaks(3),
    audioUrl: "",
    version: 1,
  },
  {
    id: "expo-guinguette",
    title: "Le marché du dimanche",
    message: "",
    location: "Aix-en-Provence",
    theme: "guinguette",
    createdAt: "2026-05-17T09:45:00.000Z",
    duration: 30,
    peaks: samplePeaks(4),
    audioUrl: "",
    version: 1,
  },
];

const STEPS = [
  {
    icon: Mic,
    title: "Enregistrez",
    text: "Appuyez, capturez l'instant. Trente secondes max — c'est la contrainte qui fait le charme.",
  },
  {
    icon: Palette,
    title: "Habillez",
    text: "Quatre décors soignés, un titre, un lieu, quelques mots manuscrits au verso.",
  },
  {
    icon: Send,
    title: "Envoyez",
    text: "Un lien à partager où vous voulez. Un joli aperçu s'affiche dans WhatsApp et iMessage.",
  },
];

const PROMISES = [
  {
    icon: UserRound,
    title: "Sans compte",
    text: "Ni pour envoyer, ni pour écouter. On enregistre, on partage, c'est tout.",
  },
  {
    icon: Smartphone,
    title: "Rien à installer",
    text: "La carte s'ouvre dans le navigateur, du dernier iPhone à la vieille tablette du salon.",
  },
  {
    icon: Link2,
    title: "Un simple lien",
    text: "Il tient dans un SMS, un mail ou un message WhatsApp — même Mamie s'en sort.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        {/* Héro */}
        <section className="wrap grid items-center gap-12 pb-20 pt-8 sm:pt-14 lg:grid-cols-[1.05fr_1fr]">
          <div className="stagger max-w-xl">
            <p className="kicker">La carte postale sonore</p>
            <h1 className="mt-4 font-display text-5xl font-semibold italic leading-[1.02] tracking-tight sm:text-6xl">
              Envoyez trente secondes de bonheur.
            </h1>
            <p className="mt-6 text-lg text-ink-soft">
              Le rire du petit, l&apos;ambiance du marché, un bonne-nuit murmuré :
              Cartouche glisse vos instants dans une jolie carte à écouter d&apos;un
              simple lien. Sans compte, sans application — même pour les
              grands-parents.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/studio" className="btn btn-primary">
                <Mic className="h-4 w-4" aria-hidden />
                Créer ma carte
              </Link>
              <Link href="/c/demo" className="btn btn-ghost">
                Écouter un exemple
              </Link>
            </div>
            <p className="mt-6 text-sm text-ink-soft">
              Gratuit · 30 secondes max · beaucoup de sourires par carte
            </p>
          </div>
          <div
            className="float-soft mx-auto w-full max-w-xl"
            style={{ "--float-rotate": "1.6deg" } as React.CSSProperties}
          >
            <PlayableCard card={DEMO_CARD} />
            <p className="mt-5 text-center text-sm text-ink-soft">
              Celle-ci est vraie : appuyez sur ▶ pour écouter la mer.
            </p>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="border-y border-line/70 bg-cream/50 py-16">
          <div className="wrap">
            <h2 className="text-center font-display text-3xl font-semibold italic sm:text-4xl">
              Trois gestes, une carte
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="panel p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent">
                      <step.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-display text-sm font-bold text-ink-soft">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Les décors */}
        <section className="wrap py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Les décors</p>
              <h2 className="mt-3 font-display text-3xl font-semibold italic sm:text-4xl">
                Quatre ambiances, soignées au pixel
              </h2>
            </div>
            <p className="max-w-sm text-sm text-ink-soft">
              {Object.values(THEMES)
                .map((t) => t.name)
                .join(", ")}{" "}
              — chaque carte a son timbre, son cachet et sa forme d&apos;onde assortie.
            </p>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
            {SHOWCASE.map((card, i) => (
              <div
                key={card.id}
                className="transition-transform duration-300 hover:-translate-y-1.5"
                style={{ transform: `rotate(${[-1.2, 0.8, -0.6, 1.1][i]}deg)` }}
              >
                <PostcardShell theme={card.theme} front={<PostcardFront card={card} />} />
                <p className="mt-3 text-center text-sm font-semibold text-ink-soft">
                  {THEMES[card.theme].name}{" "}
                  <span className="font-normal">· {THEMES[card.theme].tagline}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pensé pour être reçu */}
        <section className="border-y border-line/70 bg-cream/50 py-16">
          <div className="wrap">
            <h2 className="text-center font-display text-3xl font-semibold italic sm:text-4xl">
              Pensé pour celles et ceux qui reçoivent
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {PROMISES.map((promise) => (
                <div key={promise.title} className="panel p-7 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent">
                    <promise.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{promise.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {promise.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="wrap py-20">
          <div className="panel mx-auto max-w-3xl px-8 py-12 text-center sm:px-14">
            <h2 className="font-display text-3xl font-semibold italic sm:text-4xl">
              Un instant à envoyer&nbsp;?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-soft">
              Dans trente secondes, il sera dans une carte. Dans une minute, il fera
              sourire quelqu&apos;un.
            </p>
            <Link href="/studio" className="btn btn-primary mt-8">
              <Mic className="h-4 w-4" aria-hidden />
              Créer ma carte
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
