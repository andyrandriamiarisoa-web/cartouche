"use client";

import {
  MAX_PHOTO_BYTES,
  PHOTO_ASPECT,
  PHOTO_MAX_WIDTH,
  PHOTO_TARGET_BYTES,
} from "@/lib/types";

export interface ProcessedPhoto {
  /** JPEG recadré en 4:3, prêt à être envoyé. */
  blob: Blob;
  /** URL objet pour l'aperçu local (à révoquer par l'appelant). */
  url: string;
  width: number;
  height: number;
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      // `from-image` applique l'orientation EXIF (photos prises à la verticale).
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // On retombe sur l'élément <img> ci-dessous.
      }
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image illisible"));
    };
    img.src = url;
  });
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Recadre la photo en 4:3 (cadrage centré, sans agrandissement) puis la
 * ré-encode en JPEG. Le passage par le canvas retire au passage les
 * métadonnées EXIF — dont la position GPS.
 */
export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  const source = await loadBitmap(file);
  const sourceWidth = "width" in source ? source.width : 0;
  const sourceHeight = "height" in source ? source.height : 0;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("image illisible");
  }

  // Zone de recadrage centrée au format 4:3.
  let cropWidth = sourceWidth;
  let cropHeight = cropWidth / PHOTO_ASPECT;
  if (cropHeight > sourceHeight) {
    cropHeight = sourceHeight;
    cropWidth = cropHeight * PHOTO_ASPECT;
  }
  const sx = (sourceWidth - cropWidth) / 2;
  const sy = (sourceHeight - cropHeight) / 2;

  const width = Math.max(1, Math.min(PHOTO_MAX_WIDTH, Math.round(cropWidth)));
  const height = Math.round(width / PHOTO_ASPECT);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponible");
  ctx.drawImage(source, sx, sy, cropWidth, cropHeight, 0, 0, width, height);
  if ("close" in source) source.close();

  // On descend la qualité jusqu'à atteindre le poids visé : l'envoi doit rester
  // largement sous la limite de corps de requête, audio compris.
  let blob: Blob | null = null;
  for (const quality of [0.8, 0.7, 0.6, 0.5, 0.4]) {
    blob = await encode(canvas, quality);
    if (blob && blob.size <= PHOTO_TARGET_BYTES) break;
  }
  if (!blob) throw new Error("encodage impossible");
  if (blob.size > MAX_PHOTO_BYTES) throw new Error("image trop lourde");

  return { blob, url: URL.createObjectURL(blob), width, height };
}

/** Message court et lisible pour l'utilisateur. */
export function photoErrorMessage(err: unknown): string {
  const reason = err instanceof Error ? err.message : "";
  if (reason === "image trop lourde") {
    return "Cette image est trop lourde, essayez-en une autre.";
  }
  return "Cette image n'a pas pu être lue. Essayez un JPEG ou un PNG.";
}
