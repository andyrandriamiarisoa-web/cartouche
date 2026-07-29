import { describe, expect, it } from "vitest";
import { computePeaks } from "@/lib/audio/peaks";
import { PEAK_COUNT } from "@/lib/types";

describe("computePeaks", () => {
  it("retourne le nombre de barres demandé (défaut : PEAK_COUNT)", () => {
    const samples = new Float32Array(10000).fill(0.5);
    expect(computePeaks(samples)).toHaveLength(PEAK_COUNT);
    expect(computePeaks(samples, 16)).toHaveLength(16);
  });

  it("normalise la barre la plus forte à 1", () => {
    const samples = new Float32Array(9600);
    // première moitié douce, deuxième moitié forte
    for (let i = 0; i < samples.length; i++) {
      samples[i] = (i < samples.length / 2 ? 0.1 : 0.8) * Math.sin(i * 0.3);
    }
    const peaks = computePeaks(samples, 24);
    expect(Math.max(...peaks)).toBe(1);
    // la moitié douce doit rester nettement plus basse
    expect(Math.max(...peaks.slice(0, 10))).toBeLessThan(0.3);
  });

  it("retourne des zéros pour le silence", () => {
    const peaks = computePeaks(new Float32Array(4000), 12);
    expect(peaks.every((p) => p === 0)).toBe(true);
  });

  it("gère un signal vide", () => {
    expect(computePeaks(new Float32Array(0), 8)).toHaveLength(8);
  });

  it("borne chaque valeur entre 0 et 1", () => {
    const samples = new Float32Array(5000).map(() => Math.random() * 2 - 1);
    const peaks = computePeaks(samples, 32);
    for (const p of peaks) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});
