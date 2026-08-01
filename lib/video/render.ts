"use client";

import type { ThemeDef } from "@/lib/themes";
import { FRAME_SIZE, WAVE_BARS, WAVE_RECT } from "@/lib/video/layout";

/** Rayon des barres, proportionnel à leur largeur. */
const BAR_RADIUS_RATIO = 0.45;
/** Une barre muette reste visible : sinon l'onde a des trous. */
const MIN_BAR = 0.08;

function roundedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const radius = Math.min(width * BAR_RADIUS_RATIO, height / 2);
  ctx.beginPath();
  // `roundRect` manque encore sur quelques Safari : on garde un repli.
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fill();
}

/**
 * Dessine une image de la vidéo : le fond rendu par le serveur, puis la forme
 * d'onde dans la bande qu'il a laissée vide. Les barres déjà lues sont pleines,
 * les suivantes en retrait — la même grammaire que le lecteur de l'application.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  background: CanvasImageSource,
  peaks: number[],
  theme: ThemeDef,
  progress: number
): void {
  ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
  ctx.drawImage(background, 0, 0, FRAME_SIZE, FRAME_SIZE);

  const bars = Math.min(WAVE_BARS, peaks.length) || WAVE_BARS;
  const slot = WAVE_RECT.width / bars;
  const barWidth = Math.max(2, slot * 0.58);
  const centerY = WAVE_RECT.y + WAVE_RECT.height / 2;

  const played = ctx.createLinearGradient(
    0,
    WAVE_RECT.y,
    0,
    WAVE_RECT.y + WAVE_RECT.height
  );
  played.addColorStop(0, theme.waveFrom);
  played.addColorStop(1, theme.waveTo);

  for (let i = 0; i < bars; i++) {
    const peak = Math.max(MIN_BAR, peaks[i] ?? 0);
    const height = peak * WAVE_RECT.height;
    const x = WAVE_RECT.x + i * slot + (slot - barWidth) / 2;
    const y = centerY - height / 2;

    // Une barre est « lue » quand la tête de lecture a dépassé son centre.
    ctx.fillStyle = (i + 0.5) / bars <= progress ? played : theme.waveRest;
    roundedBar(ctx, x, y, barWidth, height);
  }
}

/** Charge le fond servi par le serveur, prêt à être dessiné. */
export async function loadBackground(cardId: string): Promise<ImageBitmap> {
  const response = await fetch(`/c/${cardId}/frame.png`, { cache: "force-cache" });
  if (!response.ok) throw new Error("fond indisponible");
  return createImageBitmap(await response.blob());
}
