import { del, get, head, list, put } from "@vercel/blob";
import { cache } from "react";
import { DEMO_CARDS } from "@/lib/demo";
import { hashToken, isValidCardId } from "@/lib/id";
import {
  CARD_MEDIA,
  cardBlobPath,
  cardBlobPrefix,
  cardMediaPath,
  type CardMediaKind,
} from "@/lib/media";
import type { CardData, CardMeta, StoredCard } from "@/lib/types";

/**
 * Le store est privé : aucun objet n'a d'URL publique, tout passe par le jeton
 * de lecture-écriture. Les médias sont donc relayés par l'application (voir
 * `streamCardMedia`) plutôt que servis directement depuis le blob.
 */
const BLOB_ACCESS = "private" as const;

const AUDIO_CACHE_SECONDS = 31536000; // l'audio d'une carte est immuable
const JSON_CACHE_SECONDS = 60; // propagation rapide des suppressions

/** Les médias ne changent jamais : le CDN peut les garder sans réserve. */
const MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** En-têtes de requête relayés tels quels vers le blob. */
const FORWARDED_REQUEST_HEADERS = ["range", "if-none-match", "if-modified-since"];
/** En-têtes de réponse repris du blob : ils décrivent l'octet, pas la carte. */
const FORWARDED_RESPONSE_HEADERS = ["content-length", "content-range", "etag", "last-modified"];

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export interface CreatedCard {
  card: CardData;
  ownerToken: string;
}

/** Écrit les médias puis les métadonnées d'une nouvelle carte dans le blob. */
export async function saveCard(
  id: string,
  audio: ArrayBuffer,
  meta: CardMeta,
  ownerToken: string,
  photo?: ArrayBuffer
): Promise<CardData> {
  // Une carte s'écrit en trois objets. Si l'un échoue, les précédents restaient
  // dans le store sans que rien n'y mène : invisibles, facturés, éternels. On
  // les reprend avant de propager l'erreur.
  const written: string[] = [];

  try {
    const audioPath = cardBlobPath(id, "audio");
    await put(audioPath, audio, {
      access: BLOB_ACCESS,
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: CARD_MEDIA.audio.contentType,
      cacheControlMaxAge: AUDIO_CACHE_SECONDS,
    });
    written.push(audioPath);

    if (photo) {
      const photoPath = cardBlobPath(id, "photo");
      await put(photoPath, photo, {
        access: BLOB_ACCESS,
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: CARD_MEDIA.photo.contentType,
        cacheControlMaxAge: AUDIO_CACHE_SECONDS,
      });
      written.push(photoPath);
    }

    const stored: StoredCard = {
      ...meta,
      id,
      createdAt: new Date().toISOString(),
      // Chemins servis par l'application, jamais l'URL interne du blob.
      audioUrl: cardMediaPath(id, "audio"),
      ...(photo ? { photoUrl: cardMediaPath(id, "photo") } : {}),
      ownerHash: await hashToken(ownerToken),
      version: 1,
    };

    // Le JSON est écrit en dernier : une carte n'est jamais visible sans son audio.
    await put(`${cardBlobPrefix(id)}card.json`, JSON.stringify(stored), {
      access: BLOB_ACCESS,
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "application/json",
      cacheControlMaxAge: JSON_CACHE_SECONDS,
    });

    const { ownerHash: _ownerHash, ...card } = stored;
    void _ownerHash;
    return card;
  } catch (err) {
    if (written.length > 0) {
      // Au mieux : un ménage raté ne doit pas masquer la vraie erreur.
      await del(written).catch(() => {});
    }
    throw err;
  }
}

async function readStoredCard(id: string): Promise<StoredCard | null> {
  // `useCache: false` : une suppression doit se voir immédiatement, sans
  // attendre l'expiration du CDN.
  const result = await get(`${cardBlobPrefix(id)}card.json`, {
    access: BLOB_ACCESS,
    useCache: false,
  });
  if (!result || result.statusCode !== 200) return null;
  const stored = JSON.parse(await new Response(result.stream).text()) as StoredCard;
  if (!stored || stored.id !== id) return null;
  return stored;
}

export type CardLookup =
  | { status: "found"; card: CardData }
  | { status: "missing" }
  | { status: "unconfigured" };

/**
 * Récupère une carte pour l'affichage public. Mémoïsé par requête afin que
 * `generateMetadata`, la page et l'image OG partagent la même lecture.
 */
export const getCard = cache(async (id: string): Promise<CardLookup> => {
  const demo = DEMO_CARDS[id];
  if (demo) {
    return { status: "found", card: demo };
  }
  if (!blobConfigured()) {
    return { status: "unconfigured" };
  }
  if (!isValidCardId(id)) {
    return { status: "missing" };
  }
  try {
    const stored = await readStoredCard(id);
    if (!stored) return { status: "missing" };
    const { ownerHash: _ownerHash, ...card } = stored;
    void _ownerHash;
    return { status: "found", card };
  } catch {
    return { status: "missing" };
  }
});

/** Contenu brut d'un média, pour le rendu serveur (image de partage). */
export async function readCardMediaBytes(
  id: string,
  kind: CardMediaKind
): Promise<Buffer | null> {
  if (!blobConfigured() || !isValidCardId(id)) return null;
  try {
    const result = await get(cardBlobPath(id, kind), { access: BLOB_ACCESS });
    if (!result || result.statusCode !== 200) return null;
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Relaie un média du store privé vers le navigateur.
 *
 * Les requêtes par plage sont transmises telles quelles : sans elles, iOS
 * refuse de lire un `<audio>` et le déplacement dans l'enregistrement ne
 * fonctionne pas. La réponse complète, elle, est immuable — le CDN l'absorbe
 * et la fonction n'est sollicitée qu'au premier passage dans chaque région.
 */
export async function streamCardMedia(
  id: string,
  kind: CardMediaKind,
  request: Request
): Promise<Response> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !isValidCardId(id)) return new Response(null, { status: 404 });

  let blobUrl: string;
  try {
    blobUrl = (await head(cardBlobPath(id, kind), { token })).url;
  } catch {
    // Média absent, carte supprimée, ou store injoignable.
    return new Response(null, { status: 404 });
  }

  const requestHeaders = new Headers({ Authorization: `Bearer ${token}` });
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) requestHeaders.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(blobUrl, { headers: requestHeaders, cache: "no-store" });
  } catch {
    return new Response(null, { status: 404 });
  }
  // 200, 206 (plage), 304 (déjà en cache) et 416 (plage invalide) sont des
  // réponses légitimes à transmettre ; le reste devient un 404.
  if (!upstream.ok && ![304, 416].includes(upstream.status)) {
    return new Response(null, { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": CARD_MEDIA[kind].contentType,
    "Content-Disposition": `inline; filename="${CARD_MEDIA[kind].file}"`,
    "Accept-Ranges": "bytes",
    "Cache-Control": MEDIA_CACHE_CONTROL,
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex",
  });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = upstream.status !== 304 && upstream.status !== 416;
  return new Response(hasBody ? upstream.body : null, {
    status: upstream.status,
    headers,
  });
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export type DeleteResult = "deleted" | "not_found" | "forbidden" | "unconfigured";

/** Supprime définitivement une carte si le jeton de propriété correspond. */
export async function deleteCard(id: string, ownerToken: string): Promise<DeleteResult> {
  if (!blobConfigured()) return "unconfigured";
  if (!isValidCardId(id)) return "not_found";

  const { blobs } = await list({ prefix: cardBlobPrefix(id), limit: 20 });
  if (blobs.length === 0) return "not_found";

  const stored = await readStoredCard(id);
  if (!stored) return "not_found";

  const providedHash = await hashToken(ownerToken);
  if (!stored.ownerHash || !timingSafeEqualHex(providedHash, stored.ownerHash)) {
    return "forbidden";
  }

  await del(blobs.map((b) => b.url));
  return "deleted";
}
