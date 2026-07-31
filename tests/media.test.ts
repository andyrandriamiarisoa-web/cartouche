import { describe, expect, it } from "vitest";
import {
  CARD_MEDIA,
  cardBlobPath,
  cardBlobPrefix,
  cardMediaPath,
  type CardMediaKind,
} from "@/lib/media";

const KINDS: CardMediaKind[] = ["audio", "photo"];

describe("nomenclature des médias", () => {
  it("sert chaque média sous la carte à laquelle il appartient", () => {
    expect(cardMediaPath("abc123", "audio")).toBe("/c/abc123/audio.wav");
    expect(cardMediaPath("abc123", "photo")).toBe("/c/abc123/photo.jpg");
  });

  it("range les objets d'une carte sous un préfixe commun", () => {
    for (const kind of KINDS) {
      expect(cardBlobPath("abc123", kind).startsWith(cardBlobPrefix("abc123"))).toBe(true);
    }
  });

  /**
   * L'URL publique et le chemin dans le blob se terminent par le même nom de
   * fichier : les routes `app/c/[id]/<fichier>/route.ts` en dépendent, elles
   * sont nommées d'après lui.
   */
  it("garde le même nom de fichier des deux côtés", () => {
    for (const kind of KINDS) {
      const { file } = CARD_MEDIA[kind];
      expect(cardMediaPath("abc123", kind).endsWith(`/${file}`)).toBe(true);
      expect(cardBlobPath("abc123", kind).endsWith(`/${file}`)).toBe(true);
    }
  });

  it("annonce un type MIME cohérent avec l'extension", () => {
    expect(CARD_MEDIA.audio.file.endsWith(".wav")).toBe(true);
    expect(CARD_MEDIA.audio.contentType).toBe("audio/wav");
    expect(CARD_MEDIA.photo.file.endsWith(".jpg")).toBe(true);
    expect(CARD_MEDIA.photo.contentType).toBe("image/jpeg");
  });
});
