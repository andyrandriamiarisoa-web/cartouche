import type { CSSProperties } from "react";
import type { ThemeDef } from "@/lib/themes";
import type { CardData } from "@/lib/types";

/** Ce que la carte affiche — sous-ensemble commun aux cartes publiées et aux aperçus. */
export type CardFace = Pick<
  CardData,
  "title" | "message" | "location" | "createdAt" | "duration" | "peaks" | "theme"
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

export const FALLBACK_TITLE = "Un instant sonore";
