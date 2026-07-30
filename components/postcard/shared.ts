import type { CSSProperties } from "react";
import type { ThemeDef } from "@/lib/themes";
import type { CardData } from "@/lib/types";
import type { WaveColors } from "@/components/postcard/Waveform";

/** Ce que la carte affiche — sous-ensemble commun aux cartes publiées et aux aperçus. */
export type CardFace = Pick<
  CardData,
  | "title"
  | "message"
  | "location"
  | "createdAt"
  | "duration"
  | "peaks"
  | "theme"
  | "photoUrl"
>;

/** Variables CSS injectées sur la scène pour thémer recto et verso. */
export function themeVars(theme: ThemeDef): CSSProperties {
  return {
    "--pc-paper": theme.paper,
    "--pc-ink": theme.ink,
    "--pc-ink-soft": theme.inkSoft,
    "--pc-art": theme.artGradient,
    "--pc-art-ink": theme.artInk,
    "--pc-stamp-bg": theme.stampBg,
    "--pc-stamp-fg": theme.stampFg,
    "--pc-postmark": theme.postmark,
  } as CSSProperties;
}

/** Forme d'onde posée sur une photo : blanc lumineux, lisible sur tout cliché. */
export const PHOTO_WAVE: WaveColors = {
  from: "#FFFFFF",
  to: "#FFE9B3",
  rest: "rgba(255, 255, 255, 0.34)",
};

export function waveColors(theme: ThemeDef, hasPhoto: boolean): WaveColors {
  if (hasPhoto) return PHOTO_WAVE;
  return { from: theme.waveFrom, to: theme.waveTo, rest: theme.waveRest };
}

/**
 * N'accepte que des URL d'image inoffensives. Les entrées de galerie viennent
 * du localStorage : on ne leur fait pas aveuglément confiance.
 */
export function safeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/") || url.startsWith("blob:") || url.startsWith("data:image/")) {
    return url;
  }
  try {
    return new URL(url).protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export const FALLBACK_TITLE = "Un instant sonore";
