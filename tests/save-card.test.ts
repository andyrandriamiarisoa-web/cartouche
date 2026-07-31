import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CardMeta } from "@/lib/types";

const blob = vi.hoisted(() => ({
  put: vi.fn(),
  del: vi.fn(),
  get: vi.fn(),
  head: vi.fn(),
  list: vi.fn(),
}));

vi.mock("@vercel/blob", () => blob);

const { saveCard } = await import("@/lib/server/store");

const META: CardMeta = {
  title: "La mer, en vrai",
  message: "On pense à vous.",
  location: "Sanary-sur-Mer",
  theme: "riviera",
  duration: 21,
  peaks: [0.4, 0.8, 0.2],
};

const AUDIO = new ArrayBuffer(8);
const PHOTO = new ArrayBuffer(4);

/** Chemins effectivement passés à `del`, à plat. */
function deleted(): string[] {
  return blob.del.mock.calls.flatMap(([arg]) => (Array.isArray(arg) ? arg : [arg]));
}

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_store_secret";
  blob.put.mockReset().mockResolvedValue({ url: "https://store.private.blob/x" });
  blob.del.mockReset().mockResolvedValue(undefined);
});

describe("écriture d'une carte", () => {
  it("écrit l'audio puis les métadonnées, et expose des chemins de l'application", async () => {
    const card = await saveCard("abcdefgh1234", AUDIO, META, "jeton");

    expect(blob.put.mock.calls.map(([path]) => path)).toEqual([
      "cards/abcdefgh1234/audio.wav",
      "cards/abcdefgh1234/card.json",
    ]);
    expect(card.audioUrl).toBe("/c/abcdefgh1234/audio.wav");
    expect(card.photoUrl).toBeUndefined();
    expect(blob.del).not.toHaveBeenCalled();
  });

  it("écrit la photo quand il y en a une", async () => {
    const card = await saveCard("abcdefgh1234", AUDIO, META, "jeton", PHOTO);
    expect(blob.put.mock.calls.map(([path]) => path)).toContain(
      "cards/abcdefgh1234/photo.jpg"
    );
    expect(card.photoUrl).toBe("/c/abcdefgh1234/photo.jpg");
  });

  it("n'expose jamais l'empreinte du jeton de propriété", async () => {
    const card = await saveCard("abcdefgh1234", AUDIO, META, "jeton");
    expect(card).not.toHaveProperty("ownerHash");
    // …mais elle est bien écrite dans le blob.
    const [, body] = blob.put.mock.calls.at(-1)!;
    expect(JSON.parse(body as string).ownerHash).toMatch(/^[0-9a-f]{64}$/);
  });

  /**
   * Une carte s'écrit en trois objets. Sans reprise, l'audio d'un envoi
   * interrompu restait dans le store sans que rien n'y mène : invisible,
   * facturé, éternel — et chaque réessai en ajoutait un.
   */
  it("reprend l'audio déjà écrit quand les métadonnées échouent", async () => {
    blob.put
      .mockResolvedValueOnce({ url: "https://store.private.blob/audio" })
      .mockRejectedValueOnce(new Error("blob indisponible"));

    await expect(saveCard("abcdefgh1234", AUDIO, META, "jeton")).rejects.toThrow(
      "blob indisponible"
    );
    expect(deleted()).toEqual(["cards/abcdefgh1234/audio.wav"]);
  });

  it("reprend l'audio et la photo quand les métadonnées échouent", async () => {
    blob.put
      .mockResolvedValueOnce({ url: "https://store.private.blob/audio" })
      .mockResolvedValueOnce({ url: "https://store.private.blob/photo" })
      .mockRejectedValueOnce(new Error("blob indisponible"));

    await expect(
      saveCard("abcdefgh1234", AUDIO, META, "jeton", PHOTO)
    ).rejects.toThrow();
    expect(deleted()).toEqual([
      "cards/abcdefgh1234/audio.wav",
      "cards/abcdefgh1234/photo.jpg",
    ]);
  });

  it("ne supprime rien si la toute première écriture échoue", async () => {
    blob.put.mockRejectedValue(new Error("blob indisponible"));
    await expect(saveCard("abcdefgh1234", AUDIO, META, "jeton")).rejects.toThrow();
    expect(blob.del).not.toHaveBeenCalled();
  });

  /** Un ménage raté ne doit pas masquer la vraie erreur. */
  it("propage l'erreur d'origine même si le ménage échoue", async () => {
    blob.put
      .mockResolvedValueOnce({ url: "https://store.private.blob/audio" })
      .mockRejectedValueOnce(new Error("blob indisponible"));
    blob.del.mockRejectedValue(new Error("suppression impossible"));

    await expect(saveCard("abcdefgh1234", AUDIO, META, "jeton")).rejects.toThrow(
      "blob indisponible"
    );
  });
});
