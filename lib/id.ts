/** Alphabet base58 (sans 0/O/I/l) pour des identifiants courts et lisibles. */
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function randomFromAlphabet(length: number): string {
  const out: string[] = [];
  const bytes = new Uint8Array(length * 2);
  while (out.length < length) {
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      // Échantillonnage par rejet pour une distribution uniforme.
      if (byte < ALPHABET.length * 4) {
        out.push(ALPHABET[byte % ALPHABET.length]);
        if (out.length === length) break;
      }
    }
  }
  return out.join("");
}

/** Identifiant public d'une carte (58^12 ≈ 10^21 possibilités : non devinable). */
export function newCardId(): string {
  return randomFromAlphabet(12);
}

/** Jeton de propriété remis une seule fois à l'expéditeur. */
export function newOwnerToken(): string {
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256 hexadécimal — seule l'empreinte du jeton est stockée. */
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const CARD_ID_PATTERN = new RegExp(`^[${ALPHABET}]{4,24}$`);

/** Garde d'entrée pour les identifiants reçus dans les URL. */
export function isValidCardId(value: string): boolean {
  return CARD_ID_PATTERN.test(value);
}
