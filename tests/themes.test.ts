import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_FAMILIES,
  THEME_IDS,
  isThemeId,
  themesByFamily,
} from "@/lib/themes";
import { decorGlyphs } from "@/components/postcard/decors";

const HEX = /^#[0-9A-Fa-f]{6}$/;
const RGBA = /^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, [\d.]+\)$/;

/** Luminance relative WCAG. */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Dernier arrêt du dégradé : c'est là que le titre et l'onde sont posés. */
function lastGradientStop(gradient: string): string {
  const stops = gradient.match(/#[0-9A-Fa-f]{6}/g);
  if (!stops || stops.length === 0) throw new Error(`dégradé sans couleur : ${gradient}`);
  return stops[stops.length - 1];
}

const themes = THEME_IDS.map((id) => THEMES[id]);

describe("catalogue de décors", () => {
  it("propose au moins 20 décors", () => {
    expect(THEME_IDS.length).toBeGreaterThanOrEqual(20);
  });

  it("n'a ni doublon d'identifiant ni doublon de nom", () => {
    expect(new Set(THEME_IDS).size).toBe(THEME_IDS.length);
    expect(new Set(themes.map((t) => t.name)).size).toBe(themes.length);
  });

  it("expose un décor par défaut valide", () => {
    expect(isThemeId(DEFAULT_THEME)).toBe(true);
    expect(isThemeId("inconnu")).toBe(false);
    expect(isThemeId("toString")).toBe(false);
  });

  it("range chaque décor dans une famille connue", () => {
    for (const t of themes) {
      expect(THEME_FAMILIES).toContain(t.family);
    }
    const grouped = themesByFamily().flatMap((g) => g.themes);
    expect(grouped).toHaveLength(themes.length);
  });
});

describe.each(themes.map((t) => [t.id, t] as const))("décor %s", (_id, t) => {
  it("a des couleurs bien formées", () => {
    for (const key of [
      "decorColor",
      "decorColor2",
      "paper",
      "ink",
      "inkSoft",
      "artInk",
      "waveFrom",
      "waveTo",
      "stampBg",
      "stampFg",
      "postmark",
    ] as const) {
      expect(t[key], `${t.id}.${key}`).toMatch(HEX);
    }
    expect(t.waveRest === undefined || HEX.test(t.waveRest) || RGBA.test(t.waveRest)).toBe(true);
    expect(t.ambient).toHaveLength(2);
    for (const c of t.ambient) expect(c).toMatch(HEX);
    expect(t.artGradient).toMatch(/^linear-gradient\(/);
  });

  it("garde le titre lisible sur le bas du dégradé", () => {
    // Le titre et la forme d'onde sont posés en bas de la zone illustrée.
    expect(contrast(t.artInk, lastGradientStop(t.artGradient))).toBeGreaterThanOrEqual(3);
  });

  it("garde l'encre lisible sur le papier et le timbre lisible", () => {
    expect(contrast(t.ink, t.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.inkSoft, t.paper)).toBeGreaterThanOrEqual(3);
    expect(contrast(t.stampFg, t.stampBg)).toBeGreaterThanOrEqual(3);
  });

  it("sait dessiner son illustration", () => {
    expect(decorGlyphs(t)).toBeTruthy();
  });
});
