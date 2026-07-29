import { describe, expect, it } from "vitest";
import { encodeWav, mixToMono } from "@/lib/audio/wav";
import { looksLikeWav } from "@/lib/validate";

function ascii(view: DataView, start: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += String.fromCharCode(view.getUint8(start + i));
  return out;
}

describe("encodeWav", () => {
  it("écrit un en-tête RIFF/WAVE valide (PCM 16 bits mono)", () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1]);
    const buffer = encodeWav(samples, 48000);
    const view = new DataView(buffer);

    expect(buffer.byteLength).toBe(44 + samples.length * 2);
    expect(ascii(view, 0, 4)).toBe("RIFF");
    expect(view.getUint32(4, true)).toBe(36 + samples.length * 2);
    expect(ascii(view, 8, 4)).toBe("WAVE");
    expect(ascii(view, 12, 4)).toBe("fmt ");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getUint32(28, true)).toBe(48000 * 2);
    expect(view.getUint16(34, true)).toBe(16);
    expect(ascii(view, 36, 4)).toBe("data");
    expect(view.getUint32(40, true)).toBe(samples.length * 2);
  });

  it("encode les échantillons en Int16 avec écrêtage", () => {
    const samples = new Float32Array([0, 1, -1, 2, -2, 0.5]);
    const view = new DataView(encodeWav(samples, 44100));
    const read = (i: number) => view.getInt16(44 + i * 2, true);

    expect(read(0)).toBe(0);
    expect(read(1)).toBe(0x7fff);
    expect(read(2)).toBe(-0x8000);
    expect(read(3)).toBe(0x7fff); // écrêté
    expect(read(4)).toBe(-0x8000); // écrêté
    expect(read(5)).toBeCloseTo(0.5 * 0x7fff, -1);
  });

  it("produit un fichier reconnu par looksLikeWav", () => {
    const bytes = new Uint8Array(encodeWav(new Float32Array(8), 32000));
    expect(looksLikeWav(bytes)).toBe(true);
    expect(looksLikeWav(bytes.slice(0, 8))).toBe(false);
    expect(looksLikeWav(new TextEncoder().encode("OggS\0\0\0\0plop"))).toBe(false);
  });
});

describe("mixToMono", () => {
  it("moyenne les canaux", () => {
    const left = new Float32Array([1, 0, -1]);
    const right = new Float32Array([0, 0, 1]);
    const mono = mixToMono([left, right]);
    expect(Array.from(mono)).toEqual([0.5, 0, 0]);
  });

  it("retourne le canal unique tel quel", () => {
    const only = new Float32Array([0.25, -0.25]);
    expect(mixToMono([only])).toBe(only);
  });

  it("gère l'absence de canaux", () => {
    expect(mixToMono([]).length).toBe(0);
  });
});
