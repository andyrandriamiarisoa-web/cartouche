import { NextResponse } from "next/server";
import { newCardId, newOwnerToken } from "@/lib/id";
import { blobConfigured, saveCard } from "@/lib/server/store";
import { MAX_AUDIO_BYTES, MAX_PHOTO_BYTES } from "@/lib/types";
import { looksLikeJpeg, looksLikeWav, parseCardMeta } from "@/lib/validate";

export const runtime = "nodejs";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** Refuse les envois cross-site : l'API n'est pas un service ouvert. */
function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // requêtes same-origin anciennes ou outils locaux
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!blobConfigured()) {
    return jsonError(
      503,
      "Le stockage n'est pas configuré : ajoutez un Blob store Vercel au projet (variable BLOB_READ_WRITE_TOKEN)."
    );
  }
  if (!originAllowed(request)) {
    return jsonError(403, "Origine non autorisée.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "Requête illisible.");
  }

  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return jsonError(400, "Fichier audio manquant.");
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return jsonError(413, "Fichier audio trop volumineux.");
  }

  const rawMeta = form.get("meta");
  if (typeof rawMeta !== "string") {
    return jsonError(400, "Métadonnées manquantes.");
  }
  let metaInput: unknown;
  try {
    metaInput = JSON.parse(rawMeta);
  } catch {
    return jsonError(400, "Métadonnées illisibles.");
  }
  const parsed = parseCardMeta(metaInput);
  if (!parsed.ok) {
    return jsonError(422, parsed.error);
  }

  const audioBytes = await audio.arrayBuffer();
  if (!looksLikeWav(new Uint8Array(audioBytes))) {
    return jsonError(415, "Format audio inattendu (WAV requis).");
  }

  // La photo est facultative : elle remplace l'illustration du décor.
  const photo = form.get("photo");
  let photoBytes: ArrayBuffer | undefined;
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return jsonError(413, "Photo trop volumineuse.");
    }
    photoBytes = await photo.arrayBuffer();
    if (!looksLikeJpeg(new Uint8Array(photoBytes))) {
      return jsonError(415, "Format de photo inattendu (JPEG requis).");
    }
  }

  try {
    const id = newCardId();
    const ownerToken = newOwnerToken();
    const card = await saveCard(id, audioBytes, parsed.meta, ownerToken, photoBytes);
    return NextResponse.json(
      {
        id,
        path: `/c/${id}`,
        createdAt: card.createdAt,
        ownerToken,
        photoUrl: card.photoUrl ?? null,
      },
      { status: 201 }
    );
  } catch {
    return jsonError(500, "L'envoi a échoué, réessayez dans un instant.");
  }
}
