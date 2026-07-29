"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import {
  canNativeShare,
  cardShareText,
  copyToClipboard,
  nativeShare,
  whatsappShareUrl,
} from "@/lib/share";
import { useToast } from "@/components/Toast";

interface CardActionsProps {
  path: string;
  title: string;
}

/** Boutons de partage de la page publique d'une carte. */
export function CardActions({ path, title }: CardActionsProps) {
  const toast = useToast();
  const [shareUrl, setShareUrl] = useState("");
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${path}`);
    setNativeAvailable(canNativeShare());
  }, [path]);

  const shareText = cardShareText(title);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        className="btn btn-soft"
        onClick={async () => {
          if (!shareUrl) return;
          const ok = await copyToClipboard(shareUrl);
          if (ok) {
            setCopied(true);
            toast("Lien copié !");
            window.setTimeout(() => setCopied(false), 2200);
          }
        }}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Copié
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden />
            Copier le lien
          </>
        )}
      </button>
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
    </div>
  );
}
