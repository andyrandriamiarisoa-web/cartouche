/**
 * Génère la photo de démonstration (paysage abstrait, sans dépendance) :
 *
 *   node scripts/generate-demo-photo.mjs
 *
 * Écrit public/demo/photo-plage.png — utilisée par la carte d'exemple
 * « avec photo » et par la vitrine de l'accueil.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTH = 1280;
const HEIGHT = 960;

/* ----------------------------- encodage PNG ----------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(rgb, width, height) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits par canal
  ihdr[9] = 2; // truecolor RGB
  // Une ligne = 1 octet de filtre + 3 octets par pixel. Le filtre Paeth (4)
  // prédit chaque octet d'après ses voisins : sur un dégradé, il divise le
  // poids du PNG par deux.
  const bpp = 3;
  const stride = width * bpp;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + stride);
    raw[rowStart] = 4;
    for (let i = 0; i < stride; i++) {
      const cur = rgb[y * stride + i];
      const a = i >= bpp ? rgb[y * stride + i - bpp] : 0;
      const b = y > 0 ? rgb[(y - 1) * stride + i] : 0;
      const c = y > 0 && i >= bpp ? rgb[(y - 1) * stride + i - bpp] : 0;
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      raw[rowStart + 1 + i] = (cur - pred) & 0xff;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------ le paysage ------------------------------ */

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.min(1, Math.max(0, t)));

const SKY_TOP = [122, 152, 186];
const SKY_MID = [247, 197, 139];
const SKY_LOW = [240, 143, 96];
const SEA_FAR = [86, 116, 138];
const SEA_NEAR = [46, 74, 96];
const SAND_FAR = [214, 178, 132];
const SAND_NEAR = [236, 214, 182];
const SUN = [255, 238, 198];

const HORIZON = 0.58;
const SHORE = 0.76;
const SUN_X = 0.66;
const SUN_Y = 0.5;
const SUN_R = 0.075;

const rgb = Buffer.alloc(WIDTH * HEIGHT * 3);

for (let y = 0; y < HEIGHT; y++) {
  const v = y / HEIGHT;
  for (let x = 0; x < WIDTH; x++) {
    const u = x / WIDTH;
    let color;

    if (v < HORIZON) {
      // Ciel : bleu doux en haut, chaleur près de l'horizon.
      const t = v / HORIZON;
      color = t < 0.62 ? mix(SKY_TOP, SKY_MID, t / 0.62) : mix(SKY_MID, SKY_LOW, (t - 0.62) / 0.38);
      // Disque solaire et halo.
      const dx = (u - SUN_X) * (WIDTH / HEIGHT);
      const dy = v - SUN_Y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < SUN_R) {
        color = mix(color, SUN, 1 - Math.pow(d / SUN_R, 6));
      } else {
        color = mix(color, SUN, Math.max(0, 0.55 - d * 1.9));
      }
    } else if (v < SHORE) {
      // Mer : bandes horizontales + scintillement sous le soleil.
      const t = (v - HORIZON) / (SHORE - HORIZON);
      color = mix(SEA_FAR, SEA_NEAR, t);
      const glint =
        Math.max(0, 1 - Math.abs(u - SUN_X) * 5) *
        Math.pow(Math.max(0, Math.sin(v * 260 + Math.sin(u * 22) * 2)), 8);
      color = mix(color, SUN, glint * (0.75 - t * 0.4));
      const ripple = Math.pow(Math.max(0, Math.sin(v * 150 + Math.sin(u * 9) * 3)), 6);
      color = mix(color, [190, 210, 220], ripple * 0.16);
    } else {
      // Sable mouillé puis sec.
      const t = (v - SHORE) / (1 - SHORE);
      color = mix(SAND_FAR, SAND_NEAR, Math.pow(t, 0.7));
      const foam = Math.pow(Math.max(0, 1 - Math.abs(t - 0.05) * 11), 2);
      color = mix(color, [248, 242, 232], foam * 0.55);
    }

    // Vignettage. Pas de grain ici : le site en applique déjà un par-dessus.
    const cx = u - 0.5;
    const cy = v - 0.5;
    const vignette = 1 - (cx * cx + cy * cy) * 0.42;

    const o = (y * WIDTH + x) * 3;
    for (let c = 0; c < 3; c++) {
      rgb[o + c] = Math.max(0, Math.min(255, Math.round(color[c] * vignette)));
    }
  }
}

const outDir = join(root, "public", "demo");
mkdirSync(outDir, { recursive: true });
const png = encodePng(rgb, WIDTH, HEIGHT);
writeFileSync(join(outDir, "photo-plage.png"), png);

console.log(
  `OK — public/demo/photo-plage.png (${WIDTH}×${HEIGHT}, ${Math.round(png.length / 1024)} Ko)`
);
