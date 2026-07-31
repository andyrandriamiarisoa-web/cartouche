import { describe, expect, it } from "vitest";
import { trimToMaxDuration } from "@/components/studio/useRecorder";
import { computePeaks } from "@/lib/audio/peaks";
import { encodeWav } from "@/lib/audio/wav";
import { AUDIO_TARGET_RATE, MAX_AUDIO_BYTES, MAX_DURATION_S } from "@/lib/types";

const RATE = AUDIO_TARGET_RATE;

function tone(seconds: number): Float32Array {
  const samples = new Float32Array(Math.round(seconds * RATE));
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.sin((i / RATE) * 440 * 2 * Math.PI) * 0.6;
  }
  return samples;
}

describe("coupure de l'enregistrement à la durée annoncée", () => {
  /**
   * L'arrêt automatique reposait sur `requestAnimationFrame`, qui s'arrête dès
   * que l'onglet passe en arrière-plan — écran verrouillé, application changée.
   * Sans rognage, la prise filait bien au-delà de trente secondes.
   */
  it("ramène un enregistrement trop long à la durée maximale", () => {
    const trimmed = trimToMaxDuration(tone(120), RATE);
    expect(trimmed.length).toBe(MAX_DURATION_S * RATE);
    expect(trimmed.length / RATE).toBe(MAX_DURATION_S);
  });

  it("laisse intact un enregistrement dans les clous", () => {
    const short = tone(8);
    expect(trimToMaxDuration(short, RATE)).toBe(short);
  });

  it("laisse intact un enregistrement pile à la limite", () => {
    const exact = tone(MAX_DURATION_S);
    expect(trimToMaxDuration(exact, RATE)).toBe(exact);
  });

  it("garde le début, pas la fin", () => {
    const samples = Float32Array.from({ length: RATE * 60 }, (_, i) => (i === 0 ? 1 : 0));
    const trimmed = trimToMaxDuration(samples, RATE);
    expect(trimmed[0]).toBe(1);
  });

  /** C'est tout l'intérêt : le fichier repasse sous le plafond d'envoi. */
  it("ramène le fichier sous le plafond serveur", () => {
    const long = tone(120);
    expect(encodeWav(long, RATE).byteLength).toBeGreaterThan(MAX_AUDIO_BYTES);
    expect(encodeWav(trimToMaxDuration(long, RATE), RATE).byteLength).toBeLessThan(
      MAX_AUDIO_BYTES
    );
  });

  /** La forme d'onde et la durée décrivent le son conservé, pas celui capté. */
  it("reste encodable et mesurable après rognage", () => {
    const trimmed = trimToMaxDuration(tone(45), RATE);
    expect(computePeaks(trimmed)).toHaveLength(72);
    expect(encodeWav(trimmed, RATE).byteLength).toBe(44 + trimmed.length * 2);
  });
});
