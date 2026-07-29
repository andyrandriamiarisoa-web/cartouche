"use client";

import { useRef } from "react";
import { Pause, Play } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { formatDateFr, formatDuration } from "@/lib/format";
import { Waveform } from "@/components/postcard/Waveform";
import { ThemeDecor } from "@/components/postcard/decors";
import { CartoucheGlyph } from "@/components/Logo";
import {
  FALLBACK_TITLE,
  safeImageUrl,
  waveColors,
  type CardFace,
} from "@/components/postcard/shared";

interface PostcardFrontProps {
  card: CardFace;
  playing?: boolean;
  progress?: number;
  timeLabel?: string;
  onToggle?: () => void;
  onSeek?: (fraction: number) => void;
}

/** Recto : zone illustrée (ou photo), titre, lecteur avec forme d'onde. */
export function PostcardFront({
  card,
  playing = false,
  progress = 0,
  timeLabel,
  onToggle,
  onSeek,
}: PostcardFrontProps) {
  const theme = THEMES[card.theme];
  const photo = safeImageUrl(card.photoUrl);
  const zoneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const seekable = Boolean(onSeek);

  const fractionFrom = (clientX: number) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const metaLine = [card.location, formatDateFr(card.createdAt)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="pc-front-inner">
      <div className={`pc-art${photo ? " pc-art--photo" : ""}`}>
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pc-photo" src={photo} alt="" aria-hidden />
            <span className="pc-photo-scrim" aria-hidden />
          </>
        ) : (
          <ThemeDecor theme={theme} />
        )}
        <span className="pc-duration">{formatDuration(card.duration)}</span>
        <h2 className="pc-title">{card.title || FALLBACK_TITLE}</h2>
        <div className="pc-player">
          {onToggle && (
            <button
              type="button"
              className="pc-play"
              onClick={onToggle}
              aria-label={playing ? "Mettre en pause" : "Écouter la carte"}
            >
              {playing ? (
                <Pause fill="currentColor" strokeWidth={0} aria-hidden />
              ) : (
                <Play
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden
                  style={{ marginLeft: "0.5cqw" }}
                />
              )}
            </button>
          )}
          <div
            ref={zoneRef}
            className="pc-wave-zone"
            data-seekable={seekable ? "true" : "false"}
            {...(seekable
              ? {
                  role: "slider",
                  tabIndex: 0,
                  "aria-label": "Position de lecture",
                  "aria-valuemin": 0,
                  "aria-valuemax": 100,
                  "aria-valuenow": Math.round(progress * 100),
                  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
                    draggingRef.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    onSeek?.(fractionFrom(e.clientX));
                  },
                  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
                    if (draggingRef.current) onSeek?.(fractionFrom(e.clientX));
                  },
                  onPointerUp: () => {
                    draggingRef.current = false;
                  },
                  onPointerCancel: () => {
                    draggingRef.current = false;
                  },
                  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "ArrowRight") onSeek?.(Math.min(1, progress + 0.05));
                    else if (e.key === "ArrowLeft") onSeek?.(Math.max(0, progress - 0.05));
                    else if (e.key === "Home") onSeek?.(0);
                    else if (e.key === "End") onSeek?.(1);
                    else return;
                    e.preventDefault();
                  },
                }
              : {})}
          >
            <Waveform
              peaks={card.peaks}
              colors={waveColors(theme, Boolean(photo))}
              progress={progress}
            />
          </div>
          {timeLabel && <span className="pc-time">{timeLabel}</span>}
        </div>
      </div>
      <div className="pc-strip">
        <span>{metaLine || "Quelque part, un jour heureux"}</span>
        <span className="pc-strip-brand">
          <CartoucheGlyph className="h-[2.6cqw] w-[4cqw]" />
          Cartouche
        </span>
      </div>
    </div>
  );
}
