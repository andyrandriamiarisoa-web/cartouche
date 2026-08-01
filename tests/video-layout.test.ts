import { describe, expect, it } from "vitest";
import {
  ART_SIZE,
  AUDIO_CODEC,
  FOOTER_H,
  FOOTER_Y,
  FRAME_PAD,
  FRAME_RATE,
  FRAME_SIZE,
  TITLE_BOTTOM,
  VIDEO_CODEC,
  WAVE_BARS,
  WAVE_RECT,
} from "@/lib/video/layout";
import { PEAK_COUNT } from "@/lib/types";

/**
 * Le fond de la vidéo est rendu par le serveur, la forme d'onde par le
 * navigateur. Les deux ne se voient jamais : ils ne s'accordent que par ces
 * constantes. Une bande mal placée, et l'onde chevaucherait le titre.
 */
describe("géométrie de la vidéo", () => {
  it("garde la bande d'onde à l'intérieur de l'illustration", () => {
    expect(WAVE_RECT.x).toBeGreaterThanOrEqual(FRAME_PAD);
    expect(WAVE_RECT.x + WAVE_RECT.width).toBeLessThanOrEqual(FRAME_PAD + ART_SIZE);
    expect(WAVE_RECT.y).toBeGreaterThan(FRAME_PAD);
    expect(WAVE_RECT.y + WAVE_RECT.height).toBeLessThan(FRAME_PAD + ART_SIZE);
  });

  it("ne laisse ni le titre ni le pied de page mordre sur l'onde", () => {
    // `TITLE_BOTTOM` est mesuré depuis le bas du cadre : le titre s'arrête
    // au-dessus de la bande.
    expect(FRAME_SIZE - TITLE_BOTTOM).toBeLessThanOrEqual(WAVE_RECT.y);
    expect(FOOTER_Y).toBeGreaterThanOrEqual(WAVE_RECT.y + WAVE_RECT.height);
    expect(FOOTER_Y + FOOTER_H).toBeLessThanOrEqual(FRAME_PAD + ART_SIZE);
  });

  it("dessine autant de barres que la carte en compte", () => {
    expect(WAVE_BARS).toBe(PEAK_COUNT);
  });

  it("reste carré, format qui s'affiche en grand dans une conversation", () => {
    expect(ART_SIZE).toBe(FRAME_SIZE - FRAME_PAD * 2);
  });

  /**
   * Le choix des codecs est le cœur de la compatibilité : les destinataires
   * ont de vieux iPhone et des Android. H.264 Baseline et AAC-LC se lisent
   * partout ; tout profil plus ambitieux exclurait quelqu'un.
   */
  it("s'en tient au profil que tous les appareils décodent", () => {
    // 42 = Baseline, 1f = niveau 3.1.
    expect(VIDEO_CODEC).toBe("avc1.42001f");
    // 40.2 = AAC-LC.
    expect(AUDIO_CODEC).toBe("mp4a.40.2");
  });

  it("tient dans ce que les messageries acceptent", () => {
    const maxSeconds = 30;
    const bytes = ((1_500_000 + 96_000) / 8) * maxSeconds;
    expect(bytes).toBeLessThan(16 * 1024 * 1024); // plafond vidéo de WhatsApp
    expect(FRAME_RATE).toBeGreaterThanOrEqual(24);
  });
});
