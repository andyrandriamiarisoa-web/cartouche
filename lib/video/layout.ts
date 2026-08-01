/**
 * Géométrie partagée entre l'image de fond (rendue par le serveur) et la forme
 * d'onde animée (dessinée par le navigateur, image par image). Les deux doivent
 * s'accorder au pixel près : le fond réserve la bande, le client la remplit.
 *
 * Le format est carré : dans une conversation WhatsApp, une vidéo carrée occupe
 * bien plus de place qu'une vidéo paysage, et se voit sans plisser les yeux.
 */

/** Côté de la vidéo, en pixels. Rendu et encodage se font à cette taille. */
export const FRAME_SIZE = 720;

/** Marge de papier autour de l'illustration, façon carte postale. */
export const FRAME_PAD = 24;
export const ART_SIZE = FRAME_SIZE - FRAME_PAD * 2;

/** Marges intérieures du calque de texte. */
export const CONTENT_PAD = 36;
const CONTENT_X = FRAME_PAD + CONTENT_PAD;
const CONTENT_W = ART_SIZE - CONTENT_PAD * 2;

/** Bande laissée vide par le serveur, où le client dessine l'onde. */
export const WAVE_RECT = {
  x: CONTENT_X,
  y: 496,
  width: CONTENT_W,
  height: 120,
} as const;

/** Ligne du bas : lieu · date à gauche, cartouche à droite. */
export const FOOTER_Y = WAVE_RECT.y + WAVE_RECT.height + 24;
export const FOOTER_H = 44;

/** Le titre s'appuie sur le haut de la bande d'onde. */
export const TITLE_BOTTOM = FRAME_SIZE - (WAVE_RECT.y - 26);

/** Nombre de barres dessinées, aligné sur `PEAK_COUNT`. */
export const WAVE_BARS = 72;

/** Images par seconde. 25 suffit pour une onde qui progresse, et allège l'encodage. */
export const FRAME_RATE = 25;

/**
 * Profil H.264 « Baseline 3.1 » et AAC-LC : c'est la combinaison que décodent
 * aussi bien un vieil iPhone qu'un Android d'entrée de gamme. Viser plus moderne
 * (HEVC, AV1) ferait un fichier plus léger que la moitié des destinataires ne
 * pourrait pas lire — l'inverse du but recherché.
 */
export const VIDEO_CODEC = "avc1.42001f";
export const AUDIO_CODEC = "mp4a.40.2";
export const VIDEO_BITRATE = 1_500_000;
export const AUDIO_BITRATE = 96_000;
