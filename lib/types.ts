import type { ThemeId } from "@/lib/themes";

/** Nombre de barres de la forme d'onde stockée avec chaque carte. */
export const PEAK_COUNT = 72;

/** Durée maximale d'un enregistrement, en secondes. */
export const MAX_DURATION_S = 30;

/** Taille maximale acceptée pour le fichier audio (WAV mono ≤ 48 kHz · 30 s ≈ 2,9 Mo). */
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

export const TEXT_LIMITS = {
  title: 48,
  message: 180,
  location: 40,
} as const;

/** Métadonnées fournies à la création d'une carte. */
export interface CardMeta {
  title: string;
  message: string;
  location: string;
  theme: ThemeId;
  duration: number;
  peaks: number[];
}

/** Carte telle qu'exposée aux pages publiques. */
export interface CardData extends CardMeta {
  id: string;
  createdAt: string;
  audioUrl: string;
  version: 1;
}

/** Carte telle que stockée dans le blob (le hash du jeton n'est jamais exposé au rendu). */
export interface StoredCard extends CardData {
  ownerHash: string;
}

/** Entrée de la galerie personnelle (localStorage de l'appareil). */
export interface GalleryEntry {
  id: string;
  /** Chemin relatif de la carte, ex. `/c/abc123`. */
  path: string;
  title: string;
  message: string;
  location: string;
  theme: ThemeId;
  createdAt: string;
  duration: number;
  peaks: number[];
  /** Jeton de propriété permettant la suppression définitive. */
  ownerToken?: string;
}
