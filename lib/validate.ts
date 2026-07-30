import { isThemeId } from "@/lib/themes";
import { MAX_DURATION_S, TEXT_LIMITS, type CardMeta } from "@/lib/types";

export type ParseResult =
  | { ok: true; meta: CardMeta }
  | { ok: false; error: string };

/** Retire les caractères de contrôle et normalise les espaces. */
function cleanText(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length > max) return null;
  return cleaned;
}

/**
 * Valide les métadonnées d'une carte envoyées par le client.
 * Utilisé côté serveur (source de vérité) et réutilisable côté client.
 */
export function parseCardMeta(raw: unknown): ParseResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "Métadonnées illisibles." };
  }
  const input = raw as Record<string, unknown>;

  const title = cleanText(input.title, TEXT_LIMITS.title);
  if (title === null) return { ok: false, error: "Titre invalide ou trop long." };

  const message = cleanText(input.message, TEXT_LIMITS.message);
  if (message === null) return { ok: false, error: "Message invalide ou trop long." };

  const location = cleanText(input.location, TEXT_LIMITS.location);
  if (location === null) return { ok: false, error: "Lieu invalide ou trop long." };

  if (!isThemeId(input.theme)) return { ok: false, error: "Thème inconnu." };

  const duration = input.duration;
  if (
    typeof duration !== "number" ||
    !Number.isFinite(duration) ||
    duration < 0.5 ||
    duration > MAX_DURATION_S + 1.5
  ) {
    return { ok: false, error: "Durée invalide (0,5 à 30 secondes)." };
  }

  const peaks = input.peaks;
  if (!Array.isArray(peaks) || peaks.length < 8 || peaks.length > 256) {
    return { ok: false, error: "Forme d'onde invalide." };
  }
  const safePeaks: number[] = [];
  for (const p of peaks) {
    if (typeof p !== "number" || !Number.isFinite(p) || p < 0 || p > 1) {
      return { ok: false, error: "Forme d'onde invalide." };
    }
    safePeaks.push(Math.round(p * 1000) / 1000);
  }

  return {
    ok: true,
    meta: {
      title,
      message,
      location,
      theme: input.theme,
      duration: Math.round(duration * 10) / 10,
      peaks: safePeaks,
    },
  };
}

/** Vérifie l'en-tête RIFF/WAVE d'un fichier audio. */
export function looksLikeWav(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE";
}

/** Vérifie la signature JPEG (SOI + marqueur) d'une photo. */
export function looksLikeJpeg(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}
