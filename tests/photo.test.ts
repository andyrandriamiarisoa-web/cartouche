import { describe, expect, it } from "vitest";
import { looksLikeJpeg } from "@/lib/validate";
import { safeImageUrl } from "@/components/postcard/shared";
import {
  MAX_AUDIO_BYTES,
  MAX_PHOTO_BYTES,
  MAX_UPLOAD_BYTES,
  PHOTO_ASPECT,
  PHOTO_MAX_WIDTH,
  PHOTO_TARGET_BYTES,
} from "@/lib/types";

describe("looksLikeJpeg", () => {
  it("reconnaît un en-tête JPEG", () => {
    expect(looksLikeJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]))).toBe(true);
    expect(looksLikeJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xdb]))).toBe(true);
  });

  it("refuse les autres formats et les fichiers tronqués", () => {
    // PNG
    expect(looksLikeJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
    // GIF
    expect(looksLikeJpeg(new TextEncoder().encode("GIF89a"))).toBe(false);
    // SVG (vecteur d'injection classique)
    expect(looksLikeJpeg(new TextEncoder().encode("<svg onload="))).toBe(false);
    expect(looksLikeJpeg(new Uint8Array([0xff, 0xd8]))).toBe(false);
    expect(looksLikeJpeg(new Uint8Array())).toBe(false);
  });
});

describe("safeImageUrl", () => {
  it("accepte les sources légitimes", () => {
    expect(safeImageUrl("/demo/photo-plage.png")).toBe("/demo/photo-plage.png");
    expect(safeImageUrl("blob:https://exemple.fr/abc")).toBe("blob:https://exemple.fr/abc");
    expect(safeImageUrl("https://blob.vercel-storage.com/x.jpg")).toBe(
      "https://blob.vercel-storage.com/x.jpg"
    );
  });

  it("écarte les URL douteuses venues du localStorage", () => {
    expect(safeImageUrl(undefined)).toBeUndefined();
    expect(safeImageUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeImageUrl("http://exemple.fr/x.jpg")).toBeUndefined();
    expect(safeImageUrl("pas une url")).toBeUndefined();
  });
});

describe("contraintes d'envoi", () => {
  it("garde des dimensions de photo raisonnables", () => {
    expect(PHOTO_ASPECT).toBeCloseTo(4 / 3);
    expect(PHOTO_MAX_WIDTH).toBeLessThanOrEqual(2000);
    expect(PHOTO_TARGET_BYTES).toBeLessThanOrEqual(MAX_PHOTO_BYTES);
  });

  it("tient sous la limite de corps de requête de Vercel, audio + photo compris", () => {
    // Vercel coupe à 4,5 Mo : le pire cas doit rester en dessous, sinon la
    // requête est rejetée par la plateforme sans message exploitable.
    const VERCEL_BODY_LIMIT = 4.5 * 1024 * 1024;
    expect(MAX_UPLOAD_BYTES).toBeLessThan(VERCEL_BODY_LIMIT);
    expect(MAX_AUDIO_BYTES + MAX_PHOTO_BYTES).toBeLessThanOrEqual(VERCEL_BODY_LIMIT);
  });
});
