export type ThemeId = "riviera" | "crepuscule" | "minuit" | "guinguette";

export type ThemeDecor = "sun" | "dusk" | "stars" | "bunting";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  tagline: string;
  /** Fond de la zone illustrée (recto). */
  artGradient: string;
  /** Élément décoratif dessiné dans la zone illustrée. */
  decor: ThemeDecor;
  decorColor: string;
  decorColor2: string;
  /** Couleur du papier de la carte (cadre du recto + verso). */
  paper: string;
  /** Encre principale sur papier. */
  ink: string;
  /** Encre secondaire sur papier. */
  inkSoft: string;
  /** Texte posé sur la zone illustrée (titre, métadonnées du recto). */
  artInk: string;
  /** Forme d'onde : dégradé des barres + couleur au repos (non lu). */
  waveFrom: string;
  waveTo: string;
  waveRest: string;
  /** Timbre du verso. */
  stampBg: string;
  stampFg: string;
  /** Couleur du cachet de la poste. */
  postmark: string;
  /** Ambiance de fond derrière la carte sur la page publique. */
  ambient: [string, string];
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  riviera: {
    id: "riviera",
    name: "Riviera",
    tagline: "Le bleu des vacances",
    artGradient: "linear-gradient(168deg, #AEE6EC 0%, #5BBDD4 46%, #16687F 100%)",
    decor: "sun",
    decorColor: "#FFE9AE",
    decorColor2: "#FFD470",
    paper: "#FBF6EA",
    ink: "#14424F",
    inkSoft: "#537E8B",
    artInk: "#FCF7E9",
    waveFrom: "#FFE9B3",
    waveTo: "#FFCE6B",
    waveRest: "rgba(252, 247, 233, 0.30)",
    stampBg: "#5BBDD4",
    stampFg: "#0E4B5C",
    postmark: "#1F7A99",
    ambient: ["#CBEDF2", "#8FD3E0"],
  },
  crepuscule: {
    id: "crepuscule",
    name: "Crépuscule",
    tagline: "L'heure dorée",
    artGradient: "linear-gradient(168deg, #FFDFA6 0%, #FF9F76 46%, #B85C82 100%)",
    decor: "dusk",
    decorColor: "#FFF4D6",
    decorColor2: "#FFC99A",
    paper: "#FFF8EF",
    ink: "#5A2A3C",
    inkSoft: "#9A6478",
    artInk: "#FFF6E8",
    waveFrom: "#4A1430",
    waveTo: "#7A2450",
    waveRest: "rgba(74, 20, 48, 0.28)",
    stampBg: "#FF9F76",
    stampFg: "#6B2244",
    postmark: "#A44A6F",
    ambient: ["#FFE4C4", "#F4B8A2"],
  },
  minuit: {
    id: "minuit",
    name: "Minuit",
    tagline: "Pour les bonne-nuit",
    artGradient: "linear-gradient(172deg, #2E4070 0%, #1A2450 52%, #0B1230 100%)",
    decor: "stars",
    decorColor: "#F4E8C2",
    decorColor2: "#EFE2AE",
    paper: "#F9F4E7",
    ink: "#26304F",
    inkSoft: "#5E6785",
    artInk: "#F6EFDC",
    waveFrom: "#F0D98C",
    waveTo: "#C8A94E",
    waveRest: "rgba(240, 217, 140, 0.24)",
    stampBg: "#1A2450",
    stampFg: "#F0D98C",
    postmark: "#3A4A80",
    ambient: ["#D8DCEC", "#AEB6D6"],
  },
  guinguette: {
    id: "guinguette",
    name: "Guinguette",
    tagline: "Les jours de fête",
    artGradient: "linear-gradient(166deg, #FFE9A3 0%, #FFD262 52%, #FFB84D 100%)",
    decor: "bunting",
    decorColor: "#D8402C",
    decorColor2: "#FFF7E6",
    paper: "#FFF7E6",
    ink: "#6E2415",
    inkSoft: "#A9593F",
    artInk: "#7C2114",
    waveFrom: "#D8402C",
    waveTo: "#A82615",
    waveRest: "rgba(168, 38, 21, 0.24)",
    stampBg: "#FFD262",
    stampFg: "#A82615",
    postmark: "#C03A22",
    ambient: ["#FFEFC2", "#FFDD9A"],
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const DEFAULT_THEME: ThemeId = "riviera";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && value in THEMES;
}
