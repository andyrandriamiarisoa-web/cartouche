export type ThemeId =
  // Bord de mer
  | "riviera"
  | "vagues"
  | "phare"
  | "sable"
  // Ciel
  | "crepuscule"
  | "minuit"
  | "nuages"
  | "aurore"
  | "arcenciel"
  | "pluie"
  // Nature
  | "foret"
  | "montagne"
  | "lavande"
  | "prairie"
  | "automne"
  | "neige"
  | "printemps"
  | "jardin"
  // Fêtes
  | "guinguette"
  | "anniversaire"
  | "confettis"
  | "coeurs"
  // Douceurs
  | "berceau"
  | "cafe"
  | "kraft"
  // Ailleurs
  | "ville"
  | "retro"
  | "vinyle";

/** Illustration dessinée dans la zone colorée du recto. */
export type ThemeDecor =
  | "sun"
  | "waves"
  | "lighthouse"
  | "dunes"
  | "dusk"
  | "stars"
  | "clouds"
  | "aurora"
  | "rainbow"
  | "rain"
  | "pines"
  | "peaks"
  | "lavender"
  | "meadow"
  | "leaves"
  | "snow"
  | "blossom"
  | "foliage"
  | "bunting"
  | "balloons"
  | "confetti"
  | "hearts"
  | "mobile"
  | "steam"
  | "kraft"
  | "skyline"
  | "rays"
  | "vinyl";

export type ThemeFamily =
  | "Bord de mer"
  | "Ciel"
  | "Nature"
  | "Fêtes"
  | "Douceurs"
  | "Ailleurs";

/** Ordre d'affichage des familles dans le sélecteur du studio. */
export const THEME_FAMILIES: ThemeFamily[] = [
  "Bord de mer",
  "Ciel",
  "Nature",
  "Fêtes",
  "Douceurs",
  "Ailleurs",
];

export interface ThemeDef {
  id: ThemeId;
  name: string;
  tagline: string;
  family: ThemeFamily;
  /** Fond de la zone illustrée (recto). Toujours du clair vers le foncé. */
  artGradient: string;
  decor: ThemeDecor;
  decorColor: string;
  decorColor2: string;
  /** Couleur du papier de la carte (cadre du recto + verso). */
  paper: string;
  /** Encre principale sur papier. */
  ink: string;
  /** Encre secondaire sur papier. */
  inkSoft: string;
  /** Texte posé sur la zone illustrée (titre, durée). */
  artInk: string;
  /** Forme d'onde : dégradé des barres jouées. */
  waveFrom: string;
  waveTo: string;
  /** Barres non encore jouées — dérivé de `artInk` si absent. */
  waveRest: string;
  /** Timbre du verso. */
  stampBg: string;
  stampFg: string;
  postmark: string;
  /** Ambiance de fond derrière la carte sur la page publique. */
  ambient: [string, string];
}

type ThemeInput = Omit<ThemeDef, "waveRest"> & { waveRest?: string };

/** `#RRGGBB` → `rgba(r, g, b, a)`. */
function alpha(hex: string, a: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Complète les valeurs dérivables pour garder les définitions lisibles. */
function theme(input: ThemeInput): ThemeDef {
  return { ...input, waveRest: input.waveRest ?? alpha(input.artInk, 0.3) };
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  /* ------------------------------------------------------------------ Bord de mer */
  riviera: theme({
    id: "riviera",
    name: "Riviera",
    tagline: "Le bleu des vacances",
    family: "Bord de mer",
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
    stampBg: "#5BBDD4",
    stampFg: "#0E4B5C",
    postmark: "#1F7A99",
    ambient: ["#CBEDF2", "#8FD3E0"],
  }),
  vagues: theme({
    id: "vagues",
    name: "Vagues",
    tagline: "Le ressac, encore et encore",
    family: "Bord de mer",
    artGradient: "linear-gradient(170deg, #C4E7EA 0%, #5FA9C4 48%, #0F4C68 100%)",
    decor: "waves",
    decorColor: "#EAF8FA",
    decorColor2: "#A8DCE8",
    paper: "#F7F4EC",
    ink: "#123C50",
    inkSoft: "#527687",
    artInk: "#F4FBFC",
    waveFrom: "#FFF3D4",
    waveTo: "#F5C97A",
    stampBg: "#5FA9C4",
    stampFg: "#0F4257",
    postmark: "#256B8A",
    ambient: ["#D3EEF2", "#9AD2DF"],
  }),
  phare: theme({
    id: "phare",
    name: "Phare",
    tagline: "Une lumière dans la nuit",
    family: "Bord de mer",
    artGradient: "linear-gradient(172deg, #CDE4E4 0%, #5C93A6 46%, #103648 100%)",
    decor: "lighthouse",
    decorColor: "#FFE7B0",
    decorColor2: "#E4402C",
    paper: "#F6F3EA",
    ink: "#12333F",
    inkSoft: "#4F717E",
    artInk: "#F3F8F8",
    waveFrom: "#FFE3A8",
    waveTo: "#F0B858",
    stampBg: "#5C93A6",
    stampFg: "#0E323F",
    postmark: "#2C6274",
    ambient: ["#D8E9EA", "#A6C6CE"],
  }),
  sable: theme({
    id: "sable",
    name: "Sable",
    tagline: "Les dunes au soleil",
    family: "Bord de mer",
    artGradient: "linear-gradient(166deg, #FBE7C6 0%, #F0C88E 48%, #B07A43 100%)",
    decor: "dunes",
    decorColor: "#FFF6E2",
    decorColor2: "#8C5C2C",
    paper: "#FDF7EA",
    ink: "#4A3116",
    inkSoft: "#8B6C46",
    artInk: "#3B2412",
    waveFrom: "#5A3A18",
    waveTo: "#8A5C2A",
    stampBg: "#F0C88E",
    stampFg: "#6B4520",
    postmark: "#A5763F",
    ambient: ["#FBEBD2", "#EDD3AC"],
  }),

  /* ------------------------------------------------------------------------ Ciel */
  crepuscule: theme({
    id: "crepuscule",
    name: "Crépuscule",
    tagline: "L'heure dorée",
    family: "Ciel",
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
  }),
  minuit: theme({
    id: "minuit",
    name: "Minuit",
    tagline: "Pour les bonne-nuit",
    family: "Ciel",
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
    stampBg: "#1A2450",
    stampFg: "#F0D98C",
    postmark: "#3A4A80",
    ambient: ["#D8DCEC", "#AEB6D6"],
  }),
  nuages: theme({
    id: "nuages",
    name: "Nuages",
    tagline: "La tête en l'air",
    family: "Ciel",
    artGradient: "linear-gradient(168deg, #EEF6FD 0%, #C6DDF4 48%, #7FAAD8 100%)",
    decor: "clouds",
    decorColor: "#FFFFFF",
    decorColor2: "#FFE9B0",
    paper: "#FAF7F0",
    ink: "#23384F",
    inkSoft: "#5F7590",
    artInk: "#1F3652",
    waveFrom: "#264B75",
    waveTo: "#4C7BAC",
    stampBg: "#C6DDF4",
    stampFg: "#2A4665",
    postmark: "#5B84B4",
    ambient: ["#E6F0FB", "#C2D9F0"],
  }),
  aurore: theme({
    id: "aurore",
    name: "Aurore",
    tagline: "Les nuits du grand Nord",
    family: "Ciel",
    artGradient: "linear-gradient(172deg, #12324A 0%, #14515C 50%, #08172A 100%)",
    decor: "aurora",
    decorColor: "#8CF0C4",
    decorColor2: "#B6A6F0",
    paper: "#F2F6F4",
    ink: "#17323F",
    inkSoft: "#546E76",
    artInk: "#EAF7F2",
    waveFrom: "#9DF3CE",
    waveTo: "#59C79E",
    stampBg: "#14515C",
    stampFg: "#9DF3CE",
    postmark: "#2E6B73",
    ambient: ["#D5E9E4", "#A8CFCB"],
  }),
  arcenciel: theme({
    id: "arcenciel",
    name: "Arc-en-ciel",
    tagline: "Après la pluie",
    family: "Ciel",
    artGradient: "linear-gradient(166deg, #FFF6DC 0%, #FFE0E6 50%, #C6E4F5 100%)",
    decor: "rainbow",
    decorColor: "#E4552F",
    decorColor2: "#4C9BD6",
    paper: "#FFFBF2",
    ink: "#46325A",
    inkSoft: "#7E6C93",
    artInk: "#43305A",
    waveFrom: "#5C3F7C",
    waveTo: "#8A66B0",
    stampBg: "#FFE0E6",
    stampFg: "#7A3A5E",
    postmark: "#8A66B0",
    ambient: ["#FFF1E0", "#DCE9F7"],
  }),
  pluie: theme({
    id: "pluie",
    name: "Pluie",
    tagline: "Le bruit sur les carreaux",
    family: "Ciel",
    artGradient: "linear-gradient(172deg, #CFDBE3 0%, #8FA5B5 48%, #445B6C 100%)",
    decor: "rain",
    decorColor: "#EEF6FA",
    decorColor2: "#B9CFDC",
    paper: "#F5F5F1",
    ink: "#2C3D49",
    inkSoft: "#687987",
    artInk: "#F4F8FA",
    waveFrom: "#DCEAF2",
    waveTo: "#A8C2D2",
    stampBg: "#8FA5B5",
    stampFg: "#1F2F3A",
    postmark: "#5A7182",
    ambient: ["#DDE6EC", "#B6C6D1"],
  }),

  /* ---------------------------------------------------------------------- Nature */
  foret: theme({
    id: "foret",
    name: "Forêt",
    tagline: "Sous les grands arbres",
    family: "Nature",
    artGradient: "linear-gradient(170deg, #D3E6D0 0%, #6FA37A 46%, #1B4430 100%)",
    decor: "pines",
    decorColor: "#26543C",
    decorColor2: "#F6E7B4",
    paper: "#F7F5E9",
    ink: "#1F3F2E",
    inkSoft: "#5B7A66",
    artInk: "#F2F8F0",
    waveFrom: "#F7E9B8",
    waveTo: "#D9BF72",
    stampBg: "#6FA37A",
    stampFg: "#17402C",
    postmark: "#3E7355",
    ambient: ["#DCEBD8", "#AFCFB2"],
  }),
  montagne: theme({
    id: "montagne",
    name: "Montagne",
    tagline: "L'air des sommets",
    family: "Nature",
    artGradient: "linear-gradient(170deg, #E0EBF2 0%, #9DB9CC 48%, #39566E 100%)",
    decor: "peaks",
    decorColor: "#FFFFFF",
    decorColor2: "#5E7D96",
    paper: "#F7F6F1",
    ink: "#2A4257",
    inkSoft: "#63798D",
    artInk: "#F6FAFC",
    waveFrom: "#FFE6AE",
    waveTo: "#E0B96B",
    stampBg: "#9DB9CC",
    stampFg: "#263E52",
    postmark: "#52708C",
    ambient: ["#E4EDF3", "#BACDDA"],
  }),
  lavande: theme({
    id: "lavande",
    name: "Lavande",
    tagline: "Un été en Provence",
    family: "Nature",
    artGradient: "linear-gradient(168deg, #F0E6F8 0%, #C3A9E0 48%, #684B90 100%)",
    decor: "lavender",
    decorColor: "#7E5FA8",
    decorColor2: "#FBF3D8",
    paper: "#FAF6FB",
    ink: "#3E2A57",
    inkSoft: "#7A6690",
    artInk: "#FBF6FF",
    waveFrom: "#FBEFC8",
    waveTo: "#DDC078",
    stampBg: "#C3A9E0",
    stampFg: "#3F2A5C",
    postmark: "#7B5EA5",
    ambient: ["#EFE6F7", "#CDB8E4"],
  }),
  prairie: theme({
    id: "prairie",
    name: "Prairie",
    tagline: "Les herbes hautes",
    family: "Nature",
    artGradient: "linear-gradient(168deg, #F4F5CE 0%, #BEDA8E 48%, #4C7838 100%)",
    decor: "meadow",
    decorColor: "#5E8F42",
    decorColor2: "#FFF3B8",
    paper: "#FAFAEC",
    ink: "#31481F",
    inkSoft: "#6C825A",
    artInk: "#F9FCEF",
    waveFrom: "#FFF6C2",
    waveTo: "#E2CE74",
    stampBg: "#BEDA8E",
    stampFg: "#3A5427",
    postmark: "#5F8A46",
    ambient: ["#F0F4D8", "#CCE0AB"],
  }),
  automne: theme({
    id: "automne",
    name: "Automne",
    tagline: "Le tapis de feuilles",
    family: "Nature",
    artGradient: "linear-gradient(168deg, #FCE2BC 0%, #E8A25C 48%, #99481F 100%)",
    decor: "leaves",
    decorColor: "#C4622A",
    decorColor2: "#F7D9A0",
    paper: "#FDF6E9",
    ink: "#5A2C12",
    inkSoft: "#94674A",
    artInk: "#FFF4E4",
    waveFrom: "#FFEBC4",
    waveTo: "#EEC078",
    stampBg: "#E8A25C",
    stampFg: "#6B3213",
    postmark: "#A85A2A",
    ambient: ["#FBE8CE", "#EFC79C"],
  }),
  neige: theme({
    id: "neige",
    name: "Neige",
    tagline: "Le silence de l'hiver",
    family: "Nature",
    artGradient: "linear-gradient(168deg, #F6FAFD 0%, #DCEAF3 46%, #9BC0D6 100%)",
    decor: "snow",
    decorColor: "#FFFFFF",
    decorColor2: "#6FA0BE",
    paper: "#FAFAF6",
    ink: "#1E3B4F",
    inkSoft: "#5D7A8C",
    artInk: "#1B3849",
    waveFrom: "#22465F",
    waveTo: "#4E7C99",
    stampBg: "#DCEAF3",
    stampFg: "#28495F",
    postmark: "#5E8AA6",
    ambient: ["#EEF5FA", "#CBDFEC"],
  }),
  printemps: theme({
    id: "printemps",
    name: "Printemps",
    tagline: "Les cerisiers en fleurs",
    family: "Nature",
    artGradient: "linear-gradient(166deg, #FFF3F5 0%, #FFD5DE 48%, #EE9AB5 100%)",
    decor: "blossom",
    decorColor: "#FFFFFF",
    decorColor2: "#8C5A3C",
    paper: "#FFF9F8",
    ink: "#65243A",
    inkSoft: "#A0687D",
    artInk: "#66203A",
    waveFrom: "#7E2C48",
    waveTo: "#B05374",
    stampBg: "#FFD5DE",
    stampFg: "#7A2E49",
    postmark: "#C4708C",
    ambient: ["#FFEDF1", "#FBD3DE"],
  }),
  jardin: theme({
    id: "jardin",
    name: "Jardin",
    tagline: "À l'ombre du feuillage",
    family: "Nature",
    artGradient: "linear-gradient(170deg, #E8F2DC 0%, #A8CB86 48%, #3D6838 100%)",
    decor: "foliage",
    decorColor: "#5C8C4A",
    decorColor2: "#EAF6D8",
    paper: "#F8F8EC",
    ink: "#2C4726",
    inkSoft: "#66805C",
    artInk: "#F5FAEE",
    waveFrom: "#FBF0BE",
    waveTo: "#DCC97A",
    stampBg: "#A8CB86",
    stampFg: "#33512B",
    postmark: "#557E4A",
    ambient: ["#E9F2DC", "#C2D9AE"],
  }),

  /* ----------------------------------------------------------------------- Fêtes */
  guinguette: theme({
    id: "guinguette",
    name: "Guinguette",
    tagline: "Les jours de fête",
    family: "Fêtes",
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
  }),
  anniversaire: theme({
    id: "anniversaire",
    name: "Anniversaire",
    tagline: "Un vœu et on souffle",
    family: "Fêtes",
    artGradient: "linear-gradient(166deg, #FFF4E4 0%, #FFD7A8 48%, #F0A055 100%)",
    decor: "balloons",
    decorColor: "#E4552F",
    decorColor2: "#4C9BD6",
    paper: "#FFFAF0",
    ink: "#6B2E12",
    inkSoft: "#A06A46",
    artInk: "#63290F",
    waveFrom: "#C0421F",
    waveTo: "#E4713E",
    stampBg: "#FFD7A8",
    stampFg: "#8A3A16",
    postmark: "#C4703A",
    ambient: ["#FFF0DC", "#FBD6AE"],
  }),
  confettis: theme({
    id: "confettis",
    name: "Confettis",
    tagline: "Ça y est, c'est la fête",
    family: "Fêtes",
    artGradient: "linear-gradient(166deg, #FFFCF3 0%, #FDECD2 50%, #F4C99A 100%)",
    decor: "confetti",
    decorColor: "#E4552F",
    decorColor2: "#3F8ECC",
    paper: "#FFFCF4",
    ink: "#4A2E1A",
    inkSoft: "#8A6B4F",
    artInk: "#472B18",
    waveFrom: "#C24A24",
    waveTo: "#E07A46",
    stampBg: "#FDECD2",
    stampFg: "#6B3E1F",
    postmark: "#B4784A",
    ambient: ["#FFF6E6", "#F8DEBE"],
  }),
  coeurs: theme({
    id: "coeurs",
    name: "Cœurs",
    tagline: "Pour dire je t'aime",
    family: "Fêtes",
    artGradient: "linear-gradient(166deg, #FFEEF0 0%, #FFC6D2 48%, #E3768F 100%)",
    decor: "hearts",
    decorColor: "#FFFFFF",
    decorColor2: "#C6415E",
    paper: "#FFF8F8",
    ink: "#5C1B2A",
    inkSoft: "#9A5F6E",
    artInk: "#5A1A29",
    waveFrom: "#7A2038",
    waveTo: "#B04A63",
    stampBg: "#FFC6D2",
    stampFg: "#6E2033",
    postmark: "#C4677E",
    ambient: ["#FFE9EE", "#F9C8D3"],
  }),

  /* -------------------------------------------------------------------- Douceurs */
  berceau: theme({
    id: "berceau",
    name: "Berceau",
    tagline: "Tout doux, tout petit",
    family: "Douceurs",
    artGradient: "linear-gradient(168deg, #F6F0FC 0%, #E0E8F8 48%, #B4C8EA 100%)",
    decor: "mobile",
    decorColor: "#FFFFFF",
    decorColor2: "#F0C8D8",
    paper: "#FCFAFB",
    ink: "#3A3357",
    inkSoft: "#7A7495",
    artInk: "#372F52",
    waveFrom: "#4E4478",
    waveTo: "#8079AE",
    stampBg: "#E0E8F8",
    stampFg: "#3F3760",
    postmark: "#7E77A6",
    ambient: ["#F2EDFA", "#D6DFF3"],
  }),
  cafe: theme({
    id: "cafe",
    name: "Café",
    tagline: "La pause du matin",
    family: "Douceurs",
    artGradient: "linear-gradient(170deg, #F0E2D0 0%, #C8A484 48%, #67462F 100%)",
    decor: "steam",
    decorColor: "#FBF2E6",
    decorColor2: "#E8D2B4",
    paper: "#FAF4EA",
    ink: "#432D1C",
    inkSoft: "#8A6E56",
    artInk: "#FBF3E8",
    waveFrom: "#F6E0BC",
    waveTo: "#D8B078",
    stampBg: "#C8A484",
    stampFg: "#4A3120",
    postmark: "#8A6244",
    ambient: ["#F2E6D6", "#D8C0A6"],
  }),
  kraft: theme({
    id: "kraft",
    name: "Kraft",
    tagline: "Le charme du simple",
    family: "Douceurs",
    artGradient: "linear-gradient(168deg, #EADCC2 0%, #D6C09B 48%, #B79A70 100%)",
    decor: "kraft",
    decorColor: "#4A3720",
    decorColor2: "#8A6E48",
    paper: "#F7F0E2",
    ink: "#3A2A17",
    inkSoft: "#7E6A4E",
    artInk: "#382713",
    waveFrom: "#4A3520",
    waveTo: "#7E6038",
    stampBg: "#D6C09B",
    stampFg: "#4A3520",
    postmark: "#8A7048",
    ambient: ["#F0E6D2", "#DCC9A8"],
  }),

  /* -------------------------------------------------------------------- Ailleurs */
  ville: theme({
    id: "ville",
    name: "Ville",
    tagline: "Les lumières du soir",
    family: "Ailleurs",
    artGradient: "linear-gradient(170deg, #F8DCB6 0%, #D98E6A 46%, #533050 100%)",
    decor: "skyline",
    decorColor: "#3E2246",
    decorColor2: "#FFE3A0",
    paper: "#FBF4EC",
    ink: "#43284A",
    inkSoft: "#856A8A",
    artInk: "#FFF2E4",
    waveFrom: "#FFE0A2",
    waveTo: "#F0B266",
    stampBg: "#D98E6A",
    stampFg: "#43244A",
    postmark: "#8A5070",
    ambient: ["#FAE6CC", "#DEB6B0"],
  }),
  retro: theme({
    id: "retro",
    name: "Rétro",
    tagline: "Un air de vieille photo",
    family: "Ailleurs",
    artGradient: "linear-gradient(166deg, #FFE6C8 0%, #F2A65A 48%, #BE4F3A 100%)",
    decor: "rays",
    decorColor: "#FFF0D2",
    decorColor2: "#E07A46",
    paper: "#FDF3E4",
    ink: "#48180F",
    inkSoft: "#94553F",
    artInk: "#3A1410",
    waveFrom: "#4A1810",
    waveTo: "#8A3420",
    stampBg: "#F2A65A",
    stampFg: "#5A1E12",
    postmark: "#B4543A",
    ambient: ["#FBE6CE", "#F0BC9A"],
  }),
  vinyle: theme({
    id: "vinyle",
    name: "Vinyle",
    tagline: "La face B",
    family: "Ailleurs",
    artGradient: "linear-gradient(170deg, #ECE7DF 0%, #B9B2A8 48%, #37332D 100%)",
    decor: "vinyl",
    decorColor: "#F0EAE0",
    decorColor2: "#D8A048",
    paper: "#F6F3EC",
    ink: "#33302A",
    inkSoft: "#75706A",
    artInk: "#F6F2EA",
    waveFrom: "#F0C878",
    waveTo: "#C89A44",
    stampBg: "#B9B2A8",
    stampFg: "#2E2B26",
    postmark: "#6E6A62",
    ambient: ["#EDEAE2", "#C8C3BA"],
  }),
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const DEFAULT_THEME: ThemeId = "riviera";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(THEMES, value);
}

/** Décors regroupés par famille, dans l'ordre d'affichage. */
export function themesByFamily(): Array<{ family: ThemeFamily; themes: ThemeDef[] }> {
  return THEME_FAMILIES.map((family) => ({
    family,
    themes: THEME_IDS.map((id) => THEMES[id]).filter((t) => t.family === family),
  }));
}
