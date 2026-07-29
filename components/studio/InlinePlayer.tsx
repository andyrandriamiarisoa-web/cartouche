"use client";

import { useRef } from "react";
import { Pause, Play } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { useAudioPlayer } from "@/components/useAudioPlayer";
import { Waveform } from "@/components/postcard/Waveform";

const SITE_WAVE_COLORS = {
  from: "#d94a26",
  to: "#b53817",
  rest: "#ddd0b9",
};

interface InlinePlayerProps {
  src: string;
  duration: number;
  peaks: number[];
}

/** Lecteur de pré-écoute du studio, aux couleurs du site. */
export function InlinePlayer({ src, duration, peaks }: InlinePlayerProps) {
  const player = useAudioPlayer(src, duration);
  const zoneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const fractionFrom = (clientX: number) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-cream/80 p-4 shadow-sm">
      <button
        type="button"
        onClick={player.toggle}
        className="grid h-12 w-12 flex-none place-items-center rounded-full bg-accent text-[#fff6ef] shadow-md transition-transform hover:scale-105 active:scale-95"
        aria-label={player.playing ? "Mettre en pause" : "Écouter l'enregistrement"}
      >
        {player.playing ? (
          <Pause className="h-5 w-5" fill="currentColor" strokeWidth={0} aria-hidden />
        ) : (
          <Play
            className="ml-0.5 h-5 w-5"
            fill="currentColor"
            strokeWidth={0}
            aria-hidden
          />
        )}
      </button>
      <div
        ref={zoneRef}
        className="relative h-14 flex-1 cursor-pointer touch-none"
        role="slider"
        tabIndex={0}
        aria-label="Position de lecture"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(player.progress * 100)}
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          player.seek(fractionFrom(e.clientX));
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) player.seek(fractionFrom(e.clientX));
        }}
        onPointerUp={() => (draggingRef.current = false)}
        onPointerCancel={() => (draggingRef.current = false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") player.seek(Math.min(1, player.progress + 0.05));
          else if (e.key === "ArrowLeft") player.seek(Math.max(0, player.progress - 0.05));
          else return;
          e.preventDefault();
        }}
      >
        <Waveform peaks={peaks} colors={SITE_WAVE_COLORS} progress={player.progress} />
      </div>
      <span className="rec-timer flex-none text-sm text-ink-soft">
        {player.playing || player.progress > 0
          ? formatDuration(player.currentTime)
          : formatDuration(duration)}
      </span>
    </div>
  );
}
