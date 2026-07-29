"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Plus, Share2 } from "lucide-react";
import type { CardData } from "@/lib/types";
import {
  canNativeShare,
  cardShareText,
  copyToClipboard,
  nativeShare,
  whatsappShareUrl,
} from "@/lib/share";
import { useToast } from "@/components/Toast";
import { PlayableCard } from "@/components/postcard/PlayableCard";
import { FALLBACK_TITLE } from "@/components/postcard/shared";

interface ShareStepProps {
  card: CardData;
  path: string;
  onCreateAnother: () => void;
}

export function ShareStep({ card, path, onCreateAnother }: ShareStepProps) {
  const toast = useToast();
  const [shareUrl, setShareUrl] = useState("");
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${path}`);
    setNativeAvailable(canNativeShare());
  }, [path]);

  const title = card.title || FALLBACK_TITLE;
  const shareText = cardShareText(title);

  const copy = async () => {
    if (!shareUrl) return;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      toast("Lien copié — prêt à partager !");
      window.setTimeout(() => setCopied(false), 2200);
    } else {
      toast("Impossible de copier, sélectionnez le lien à la main.");
    }
  };

  return (
    <section className="mx-auto max-w-2xl text-center">
      <p className="kicker">Étape 3 · Envoyer</p>
      <h1 className="mt-3 font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
        Elle est en route !
      </h1>
      <p className="mx-auto mt-4 max-w-md text-ink-soft">
        Partagez ce lien : la carte s&apos;ouvre partout, dans n&apos;importe quel
        navigateur, sans compte ni application.
      </p>

      <div className="mx-auto mt-10 w-full max-w-xl">
        <PlayableCard card={card} sentStamp />
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-cream/80 p-2 pl-5 shadow-sm">
        <input
          readOnly
          value={shareUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink-soft outline-none"
          aria-label="Lien de la carte"
        />
        <button type="button" className="btn btn-primary btn-sm flex-none" onClick={copy}>
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Copié
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden />
              Copier
            </>
          )}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {nativeAvailable && (
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => void nativeShare({ title, text: shareText, url: shareUrl })}
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Partager…
          </button>
        )}
        <a
          className="btn btn-soft"
          href={shareUrl ? whatsappShareUrl(shareText, shareUrl) : "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <Link href={path} className="btn btn-ghost">
          <ExternalLink className="h-4 w-4" aria-hidden />
          Voir la carte
        </Link>
      </div>

      <p className="mt-8 text-sm text-ink-soft">
        Elle vous attend aussi dans{" "}
        <Link href="/galerie" className="font-semibold text-accent underline-offset-4 hover:underline">
          votre galerie
        </Link>
        .
      </p>

      <button type="button" className="btn btn-ghost mt-8" onClick={onCreateAnother}>
        <Plus className="h-4 w-4" aria-hidden />
        Créer une autre carte
      </button>
    </section>
  );
}
