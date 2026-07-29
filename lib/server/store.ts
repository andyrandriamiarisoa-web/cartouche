import { del, list, put } from "@vercel/blob";
import { cache } from "react";
import { DEMO_CARDS } from "@/lib/demo";
import { hashToken } from "@/lib/id";
import type { CardData, CardMeta, StoredCard } from "@/lib/types";

const AUDIO_CACHE_SECONDS = 31536000; // l'audio d'une carte est immuable
const JSON_CACHE_SECONDS = 60; // propagation rapide des suppressions

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function prefixFor(id: string): string {
  return `cards/${id}/`;
}

export interface CreatedCard {
  card: CardData;
  ownerToken: string;
}

/**
 * Écrit les médias puis les métadonnées d'une nouvelle carte dans le blob.
 * Le JSON est écrit en dernier : une carte n'est jamais visible sans son audio.
 */
export async function saveCard(
  id: string,
  audio: ArrayBuffer,
  meta: CardMeta,
  ownerToken: string,
  photo?: ArrayBuffer
): Promise<CardData> {
  const audioBlob = await put(`${prefixFor(id)}audio.wav`, audio, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "audio/wav",
    cacheControlMaxAge: AUDIO_CACHE_SECONDS,
  });

  const photoBlob = photo
    ? await put(`${prefixFor(id)}photo.jpg`, photo, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "image/jpeg",
        cacheControlMaxAge: AUDIO_CACHE_SECONDS,
      })
    : null;

  const stored: StoredCard = {
    ...meta,
    id,
    createdAt: new Date().toISOString(),
    audioUrl: audioBlob.url,
    ...(photoBlob ? { photoUrl: photoBlob.url } : {}),
    ownerHash: await hashToken(ownerToken),
    version: 1,
  };

  await put(`${prefixFor(id)}card.json`, JSON.stringify(stored), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/json",
    cacheControlMaxAge: JSON_CACHE_SECONDS,
  });

  const { ownerHash: _ownerHash, ...card } = stored;
  void _ownerHash;
  return card;
}

async function readStoredCard(id: string): Promise<StoredCard | null> {
  const { blobs } = await list({ prefix: prefixFor(id), limit: 20 });
  const jsonBlob = blobs.find((b) => b.pathname.endsWith("card.json"));
  if (!jsonBlob) return null;
  const response = await fetch(jsonBlob.url, { cache: "no-store" });
  if (!response.ok) return null;
  const stored = (await response.json()) as StoredCard;
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

  const { blobs } = await list({ prefix: prefixFor(id), limit: 20 });
  if (blobs.length === 0) return "not_found";

  const jsonBlob = blobs.find((b) => b.pathname.endsWith("card.json"));
  if (!jsonBlob) return "not_found";

  const response = await fetch(jsonBlob.url, { cache: "no-store" });
  if (!response.ok) return "not_found";
  const stored = (await response.json()) as StoredCard;

  const providedHash = await hashToken(ownerToken);
  if (!stored.ownerHash || !timingSafeEqualHex(providedHash, stored.ownerHash)) {
    return "forbidden";
  }

  await del(blobs.map((b) => b.url));
  return "deleted";
}
