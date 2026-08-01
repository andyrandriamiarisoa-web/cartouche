"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clapperboard, Loader2, Send } from "lucide-react";
import type { CardData } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { cardShareText } from "@/lib/share";
import { canEncodeVideo, decodeAudio, encodeCardVideo } from "@/lib/video/encode";
import { loadBackground } from "@/lib/video/render";
import { shareVideo } from "@/lib/video/share";
import { FALLBACK_TITLE } from "@/components/postcard/shared";
import { useToast } from "@/components/Toast";

interface VideoShareButtonProps {
  card: CardData;
  /** L'enregistrement local quand on vient de l'envoyer, sinon on le récupère. */
  audioBlob?: Blob;
}

type State =
  | { step: "idle" }
  | { step: "working"; ratio: number }
  | { step: "ready"; blob: Blob; url: string }
  | { step: "error"; message: string };

/**
 * Fabrique une vidéo de la carte et la remet au téléphone, qui sait la donner à
 * WhatsApp. Une vidéo se lit dans la conversation, avec le son — ce qu'aucun
 * aperçu de lien ne fait, et ce qu'un GIF ne peut pas faire faute de piste audio.
 *
 * En deux temps volontairement : l'encodage dure plusieurs secondes, et iOS
 * n'autorise le partage que sur un geste récent. Un seul bouton se ferait
 * refuser le partage juste après avoir fait patienter.
 */
export function VideoShareButton({ card, audioBlob }: VideoShareButtonProps) {
  const toast = useToast();
  const [available, setAvailable] = useState(false);
  const [state, setState] = useState<State>({ step: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    void canEncodeVideo().then(setAvailable);
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const title = card.title || FALLBACK_TITLE;

  const prepare = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ step: "working", ratio: 0 });

    try {
      let source: Blob;
      if (audioBlob) {
        source = audioBlob;
      } else {
        // `audioUrl` et non un chemin deviné : les cartes de démonstration
        // sont servies depuis les fichiers livrés avec l'application.
        const response = await fetch(card.audioUrl);
        if (!response.ok) throw new Error("audio indisponible");
        source = await response.blob();
      }

      const [background, audio] = await Promise.all([
        loadBackground(card.id),
        decodeAudio(source),
      ]);

      const blob = await encodeCardVideo({
        background,
        audio,
        peaks: card.peaks,
        theme: THEMES[card.theme],
        signal: controller.signal,
        onProgress: (ratio) => setState({ step: "working", ratio }),
      });

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setState({ step: "ready", blob, url });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({
        step: "error",
        message: "La vidéo n'a pas pu être fabriquée. Le lien, lui, marche toujours.",
      });
    }
  }, [audioBlob, card.audioUrl, card.id, card.peaks, card.theme]);

  if (!available) return null;

  if (state.step === "ready") {
    return (
      <div className="pop-in mx-auto flex w-full max-w-xs flex-col items-center gap-3">
        <video
          src={state.url}
          className="w-full rounded-2xl border border-line shadow-sm"
          controls
          playsInline
          preload="metadata"
        />
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={async () => {
            const outcome = await shareVideo(state.blob, {
              title,
              text: cardShareText(title),
            });
            if (outcome === "downloaded") {
              toast("Vidéo enregistrée — joignez-la à votre message.");
            }
          }}
        >
          <Send className="h-4 w-4" aria-hidden />
          Envoyer la vidéo
        </button>
        <p className="text-center text-xs text-ink-soft">
          Elle se lit directement dans la conversation, avec le son.
        </p>
      </div>
    );
  }

  if (state.step === "working") {
    return (
      <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-2">
        <div className="btn btn-soft w-full justify-center" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          On monte la vidéo… {Math.round(state.ratio * 100)}%
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(state.ratio * 100)}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200"
            style={{ width: `${state.ratio * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" className="btn btn-soft" onClick={() => void prepare()}>
        <Clapperboard className="h-4 w-4" aria-hidden />
        Préparer une vidéo
      </button>
      {state.step === "error" && (
        <p className="max-w-xs text-center text-xs text-accent-deep">{state.message}</p>
      )}
    </div>
  );
}
