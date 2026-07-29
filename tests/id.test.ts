import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashToken, isValidCardId, newCardId, newOwnerToken } from "@/lib/id";

const BASE58 = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

describe("newCardId", () => {
  it("génère 12 caractères base58", () => {
    for (let i = 0; i < 50; i++) {
      const id = newCardId();
      expect(id).toHaveLength(12);
      expect(id).toMatch(BASE58);
    }
  });

  it("ne produit pas de doublons sur un petit échantillon", () => {
    const ids = new Set(Array.from({ length: 500 }, () => newCardId()));
    expect(ids.size).toBe(500);
  });
});

describe("newOwnerToken", () => {
  it("génère 48 caractères hexadécimaux", () => {
    const token = newOwnerToken();
    expect(token).toMatch(/^[0-9a-f]{48}$/);
  });
});

describe("hashToken", () => {
  it("correspond au SHA-256 de node:crypto", async () => {
    const token = "cartouche-test-token";
    const expected = createHash("sha256").update(token).digest("hex");
    await expect(hashToken(token)).resolves.toBe(expected);
  });
});

describe("isValidCardId", () => {
  it("accepte les identifiants générés et « demo »", () => {
    expect(isValidCardId(newCardId())).toBe(true);
    expect(isValidCardId("demo")).toBe(true);
  });

  it("rejette les identifiants dangereux ou hors format", () => {
    expect(isValidCardId("")).toBe(false);
    expect(isValidCardId("ab")).toBe(false); // trop court
    expect(isValidCardId("x".repeat(25))).toBe(false); // trop long
    expect(isValidCardId("../secrets")).toBe(false);
    expect(isValidCardId("abc0def")).toBe(false); // 0 exclu de base58
    expect(isValidCardId("abc def")).toBe(false);
  });
});
