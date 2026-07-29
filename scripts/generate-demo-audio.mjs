/**
 * Génère l'audio de la carte de démonstration : un paysage sonore synthétique
 * (vagues + boîte à musique), 100 % reproductible, sans dépendance.
 *
 *   node scripts/generate-demo-audio.mjs
 *
 * Écrit :
 *   - public/demo/cartouche-demo.wav
 *   - lib/demo-peaks.json (durée + forme d'onde pour la carte)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SAMPLE_RATE = 32000;
const DURATION_S = 21;
const PEAK_COUNT = 72;

/** PRNG déterministe (mulberry32). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260724);
const n = SAMPLE_RATE * DURATION_S;
const samples = new Float32Array(n);

// --- Océan : bruit filtré, gonflé par des vagues périodiques -----------------
let lp = 0;
const alpha = 1 - Math.exp((-2 * Math.PI * 480) / SAMPLE_RATE);
let lp2 = 0;
const alpha2 = 1 - Math.exp((-2 * Math.PI * 140) / SAMPLE_RATE);

for (let i = 0; i < n; i++) {
  const t = i / SAMPLE_RATE;
  const white = rand() * 2 - 1;
  lp += alpha * (white - lp);
  lp2 += alpha2 * (lp - lp2);

  const swellA = Math.pow(0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 8.2 - Math.PI / 2), 2.4);
  const swellB = Math.pow(0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 5.7 + 1.4), 3.2);
  const surf = 0.16 + 0.65 * swellA + 0.35 * swellB;

  // écume (aigus) + fond de houle (graves)
  samples[i] += (lp * 0.75 + lp2 * 0.9) * surf * 0.55;
}

// --- Boîte à musique : petite phrase pentatonique ---------------------------
const NOTES = { A4: 440, B4: 493.88, Cs5: 554.37, E5: 659.25, Fs5: 739.99, A5: 880 };
const PHRASE = [
  [1.4, "A4"],
  [3.2, "Cs5"],
  [4.9, "E5"],
  [7.3, "Fs5"],
  [8.9, "E5"],
  [11.2, "A5"],
  [13.4, "Fs5"],
  [15.2, "E5"],
  [17.4, "Cs5"],
  [18.6, "A4"],
];

for (const [start, name] of PHRASE) {
  const f = NOTES[name];
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(2.8 * SAMPLE_RATE);
  for (let j = 0; j < length && startIndex + j < n; j++) {
    const t = j / SAMPLE_RATE;
    const attack = 1 - Math.exp(-t * 120);
    const decay = Math.exp(-t * 2.1);
    const tone =
      Math.sin(2 * Math.PI * f * t) * 0.6 +
      Math.sin(2 * Math.PI * f * 2 * t) * 0.25 * Math.exp(-t * 4) +
      Math.sin(2 * Math.PI * f * 4.02 * t) * 0.08 * Math.exp(-t * 7);
    samples[startIndex + j] += tone * attack * decay * 0.16;
  }
}

// --- Fondu d'entrée / de sortie + normalisation -----------------------------
const fadeIn = SAMPLE_RATE * 1.2;
const fadeOut = SAMPLE_RATE * 2.5;
for (let i = 0; i < fadeIn; i++) samples[i] *= i / fadeIn;
for (let i = 0; i < fadeOut; i++) samples[n - 1 - i] *= i / fadeOut;

let peak = 0;
for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(samples[i]));
const gain = peak > 0 ? 0.86 / peak : 1;
for (let i = 0; i < n; i++) samples[i] *= gain;

// --- Encodage WAV PCM 16 bits mono ------------------------------------------
function encodeWav(data, sampleRate) {
  const dataSize = data.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    buffer.writeInt16LE(Math.round(s < 0 ? s * 0x8000 : s * 0x7fff), 44 + i * 2);
  }
  return buffer;
}

// --- Forme d'onde (même algo que lib/audio/peaks.ts) ------------------------
function computePeaks(data, count) {
  const peaks = new Array(count);
  for (let i = 0; i < count; i++) {
    const start = Math.floor((i * data.length) / count);
    const end = Math.max(start + 1, Math.floor(((i + 1) * data.length) / count));
    let sum = 0;
    for (let j = start; j < end; j++) sum += data[j] * data[j];
    peaks[i] = Math.sqrt(sum / (end - start));
  }
  const max = Math.max(...peaks);
  return peaks.map((p) => Math.round((p / (max || 1)) * 1000) / 1000);
}

const outDir = join(root, "public", "demo");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "cartouche-demo.wav"), encodeWav(samples, SAMPLE_RATE));
writeFileSync(
  join(root, "lib", "demo-peaks.json"),
  JSON.stringify({ duration: DURATION_S, peaks: computePeaks(samples, PEAK_COUNT) }) + "\n"
);

console.log(
  `OK — public/demo/cartouche-demo.wav (${(((44 + n * 2) / 1024) | 0)} Ko, ${DURATION_S}s @ ${SAMPLE_RATE} Hz) + lib/demo-peaks.json`
);
