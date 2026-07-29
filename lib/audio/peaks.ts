import { PEAK_COUNT } from "@/lib/types";

/**
 * Réduit un signal audio en `count` barres normalisées [0, 1] (RMS par tranche).
 * C'est la forme d'onde stylisée dessinée sur la carte, l'image OG et la galerie.
 */
export function computePeaks(samples: Float32Array, count: number = PEAK_COUNT): number[] {
  if (samples.length === 0 || count <= 0) {
    return new Array(Math.max(count, 0)).fill(0);
  }

  const peaks: number[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const start = Math.floor((i * samples.length) / count);
    const end = Math.max(start + 1, Math.floor(((i + 1) * samples.length) / count));
    let sumSquares = 0;
    for (let j = start; j < end; j++) {
      sumSquares += samples[j] * samples[j];
    }
    peaks[i] = Math.sqrt(sumSquares / (end - start));
  }

  const max = Math.max(...peaks);
  if (max <= 0) return peaks.fill(0);

  // Normalisation douce : la barre la plus forte touche 1, le reste garde ses proportions.
  return peaks.map((p) => Math.round((p / max) * 1000) / 1000);
}
