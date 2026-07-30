"use client";

import { useId } from "react";

const VIEW_W = 720;
const VIEW_H = 120;

/** Couleurs des barres : dégradé de la partie lue, teinte du reste. */
export interface WaveColors {
  from: string;
  to: string;
  rest: string;
}

interface WaveformProps {
  peaks: number[];
  colors: WaveColors;
  /** Progression de lecture, entre 0 et 1. */
  progress?: number;
}

/** Forme d'onde stylisée : barres arrondies en miroir, dégradé sur la partie lue. */
export function Waveform({ peaks, colors, progress = 0 }: WaveformProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradientId = `wg${uid}`;
  const clipId = `wc${uid}`;

  const n = Math.max(peaks.length, 1);
  const step = VIEW_W / n;
  const barWidth = Math.min(step * 0.6, 10);
  const radius = barWidth / 2;

  const bars = peaks.map((peak, i) => {
    const height = Math.max(peak, 0.055) * VIEW_H * 0.94;
    return {
      key: i,
      x: i * step + (step - barWidth) / 2,
      y: (VIEW_H - height) / 2,
      height,
    };
  });

  const clipWidth = Math.max(0, Math.min(1, progress)) * VIEW_W;

  return (
    <svg
      className="pc-wave"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={clipWidth} height={VIEW_H} />
        </clipPath>
      </defs>
      <g fill={colors.rest}>
        {bars.map((bar) => (
          <rect
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={barWidth}
            height={bar.height}
            rx={radius}
          />
        ))}
      </g>
      {clipWidth > 0 && (
        <g fill={`url(#${gradientId})`} clipPath={`url(#${clipId})`}>
          {bars.map((bar) => (
            <rect
              key={bar.key}
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.height}
              rx={radius}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
