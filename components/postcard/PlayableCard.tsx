"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import type { CardData } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { useAudioPlayer } from "@/components/useAudioPlayer";
import { PostcardShell } from "@/components/postcard/PostcardShell";
import { PostcardFront } from "@/components/postcard/PostcardFront";
import { PostcardBack } from "@/components/postcard/PostcardBack";

interface PlayableCardProps {
  card: CardData;
  className?: string;
  /** Affiche le tampon « envoyée » (écran de succès du studio). */
  sentStamp?: boolean;
  flippable?: boolean;
}

/** Carte complète et vivante : lecture audio, seek sur l'onde, flip recto/verso. */
export function PlayableCard({
  card,
  className,
  sentStamp = false,
  flippable = true,
}: PlayableCardProps) {
  const [flipped, setFlipped] = useState(false);
  const player = useAudioPlayer(card.audioUrl, card.duration);

  const timeLabel =
    player.playing || player.progress > 0
      ? formatDuration(player.currentTime)
      : formatDuration(card.duration);

  return (
    <PostcardShell
      theme={card.theme}
      className={className}
      flipped={flipped}
      front={
        <PostcardFront
          card={card}
          playing={player.playing}
          progress={player.progress}
          timeLabel={timeLabel}
          onToggle={player.toggle}
          onSeek={player.seek}
        />
      }
      back={<PostcardBack card={card} />}
      overlay={
        <>
          {flippable && (
            <button
              type="button"
              className="pc-flip"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Voir le recto" : "Lire le message au verso"}
              title={flipped ? "Voir le recto" : "Lire le message au verso"}
            >
              <RefreshCcw aria-hidden />
            </button>
          )}
          {sentStamp && <div className="pc-sent-stamp">Envoyée</div>}
        </>
      }
    />
  );
}
