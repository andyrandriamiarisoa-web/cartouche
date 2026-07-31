import { describe, expect, it } from "vitest";
import { DRAFT_MAX_AGE_MS, isFresh, isValidDraft, type CardDraft } from "@/lib/draft";

function draft(overrides: Partial<Record<keyof CardDraft, unknown>> = {}): unknown {
  return {
    wav: new Blob([new Uint8Array([1, 2, 3])], { type: "audio/wav" }),
    duration: 12.4,
    peaks: [0.1, 0.9, 0.4],
    photo: null,
    values: { title: "Le rire d'Anna", message: "", location: "Orange", theme: "riviera" },
    savedAt: "2026-07-31T18:00:00.000Z",
    ...overrides,
  };
}

describe("brouillon d'enregistrement", () => {
  it("accepte un brouillon complet", () => {
    expect(isValidDraft(draft())).toBe(true);
  });

  it("accepte une photo jointe", () => {
    expect(isValidDraft(draft({ photo: new Blob(["x"], { type: "image/jpeg" }) }))).toBe(
      true
    );
  });

  /**
   * Ce qui ressort d'IndexedDB a pu être écrit par une version antérieure :
   * un brouillon douteux doit être ignoré, pas restauré à moitié.
   */
  it.each([
    ["sans audio", { wav: undefined }],
    ["avec un audio vide", { wav: new Blob([]) }],
    ["avec une durée absurde", { duration: 0 }],
    ["avec une durée non numérique", { duration: "12" }],
    ["sans forme d'onde", { peaks: [] }],
    ["avec une forme d'onde corrompue", { peaks: [0.2, "haut"] }],
    ["avec une photo qui n'en est pas une", { photo: "photo.jpg" }],
    ["avec un thème inconnu", { values: { title: "", message: "", location: "", theme: "neige-de-mars" } }],
    ["avec un champ de texte manquant", { values: { title: "a", message: "b", theme: "riviera" } }],
    ["sans date", { savedAt: undefined }],
    ["avec une date illisible", { savedAt: "hier" }],
  ])("refuse un brouillon %s", (_label, overrides) => {
    expect(isValidDraft(draft(overrides))).toBe(false);
  });

  it("refuse ce qui n'est pas un objet", () => {
    expect(isValidDraft(null)).toBe(false);
    expect(isValidDraft("brouillon")).toBe(false);
  });

  it("considère un brouillon oublié depuis trop longtemps comme périmé", () => {
    const saved = Date.parse("2026-07-01T10:00:00.000Z");
    const fresh = draft({ savedAt: new Date(saved).toISOString() }) as CardDraft;
    expect(isFresh(fresh, saved + DRAFT_MAX_AGE_MS - 1000)).toBe(true);
    expect(isFresh(fresh, saved + DRAFT_MAX_AGE_MS + 1000)).toBe(false);
  });
});
