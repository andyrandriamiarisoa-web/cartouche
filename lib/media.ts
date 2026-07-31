/**
 * Les médias d'une carte ne sont pas servis depuis le blob : le store est
 * privé, donc ni l'audio ni la photo n'ont d'URL publique. L'application les
 * relaie elle-même sous `/c/<id>/<fichier>` — le lien de partage reste public,
 * mais les fichiers ne sont atteignables qu'à travers l'application.
 *
 * Ce module ne contient que la nomenclature, partagée par l'écriture, la
 * lecture et les routes : le nom du fichier est identique dans le blob et dans
 * l'URL, ce qui évite toute table de correspondance.
 */

export type CardMediaKind = "audio" | "photo";

export interface CardMediaDescriptor {
  /** Nom du fichier, dans le blob comme dans l'URL publique. */
  file: string;
  contentType: string;
}

export const CARD_MEDIA: Record<CardMediaKind, CardMediaDescriptor> = {
  audio: { file: "audio.wav", contentType: "audio/wav" },
  photo: { file: "photo.jpg", contentType: "image/jpeg" },
};

/** Chemin dans le blob, ex. `cards/abc123/audio.wav`. */
export function cardBlobPath(id: string, kind: CardMediaKind): string {
  return `cards/${id}/${CARD_MEDIA[kind].file}`;
}

/** Préfixe commun à tous les objets d'une carte. */
export function cardBlobPrefix(id: string): string {
  return `cards/${id}/`;
}

/** URL servie au navigateur, ex. `/c/abc123/audio.wav`. */
export function cardMediaPath(id: string, kind: CardMediaKind): string {
  return `/c/${id}/${CARD_MEDIA[kind].file}`;
}
