import type { ThemeId } from "@/lib/themes";

/** Nombre de barres de la forme d'onde stockée avec chaque carte. */
export const PEAK_COUNT = 72;

/** Durée maximale d'un enregistrement, en secondes. */
export const MAX_DURATION_S = 30;

/**
 * Les fonctions serverless Vercel refusent toute requête dont le corps dépasse
 * 4,5 Mo — et ce refus vient de la plateforme, avant même d'atteindre notre
 * code : ni message clair, ni trace. Tout le pipeline vise donc à rester
 * nettement en dessous, avec cette marge comme garde-fou côté client.
 */
export const MAX_UPLOAD_BYTES = 4_200_000;

/**
 * Taille maximale du fichier audio : un WAV mono 24 kHz de 30 s pèse ~1,4 Mo,
 * mais on laisse la place au repli 48 kHz des navigateurs sans
 * `OfflineAudioContext` (~2,9 Mo).
 */
export const MAX_AUDIO_BYTES = 2_900_000;

/**
 * L'audio est ré-échantillonné à 24 kHz avant encodage : largement assez pour
 * une voix ou une ambiance, et deux fois plus léger qu'un 48 kHz.
 */
export const AUDIO_TARGET_RATE = 24000;

/** Plafond dur de la photo, vérifié aussi côté serveur. */
export const MAX_PHOTO_BYTES = 1_400_000;

/** Poids visé pour la photo : on baisse la qualité JPEG jusqu'à l'atteindre. */
export const PHOTO_TARGET_BYTES = 1_200_000;

/** Largeur cible de la photo ré-encodée (recadrée en 4:3). */
export const PHOTO_MAX_WIDTH = 1400;
export const PHOTO_ASPECT = 4 / 3;

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
  /** Photo choisie par l'expéditeur — remplace l'illustration du décor. */
  photoUrl?: string;
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
  photoUrl?: string;
  /** Jeton de propriété permettant la suppression définitive. */
  ownerToken?: string;
}
