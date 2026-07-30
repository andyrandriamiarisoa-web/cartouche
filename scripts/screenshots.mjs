/**
 * Captures d'écran de l'application (serveur de production) pour la
 * documentation. Utilise le Chromium géré par Playwright.
 *
 *   npm run build && npm run start -- -p 4310   # dans un autre terminal
 *   node scripts/screenshots.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:4310";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "screenshots");
mkdirSync(outDir, { recursive: true });

const executablePath =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

function samplePeaks(seed) {
  return Array.from({ length: 72 }, (_, i) => {
    const wave =
      Math.abs(Math.sin(i * 0.34 + seed)) * 0.55 +
      Math.abs(Math.sin(i * 0.11 + seed * 2.3)) * 0.45;
    return Math.round(Math.min(1, 0.15 + wave * 0.85) * 100) / 100;
  });
}

const GALLERY_SEED = [
  {
    id: "seed1",
    path: "/c/demo",
    title: "La mer, en vrai",
    message: "On pense à vous depuis la plage !",
    location: "Sanary-sur-Mer",
    theme: "riviera",
    createdAt: "2026-07-24T10:30:00.000Z",
    duration: 21,
    peaks: samplePeaks(1),
  },
  {
    id: "seed2",
    path: "/c/demo",
    title: "Bonne nuit, papi",
    message: "Dors bien, on t'embrasse fort.",
    location: "",
    theme: "minuit",
    createdAt: "2026-07-18T21:10:00.000Z",
    duration: 12,
    peaks: samplePeaks(3),
  },
  {
    id: "seed3",
    path: "/c/demo",
    title: "Le marché du dimanche",
    message: "Les abricots sentaient trop bon.",
    location: "Aix-en-Provence",
    theme: "guinguette",
    createdAt: "2026-07-12T09:45:00.000Z",
    duration: 28,
    peaks: samplePeaks(4),
  },
  {
    id: "seed4",
    path: "/c/demo-photo",
    title: "Notre coucher de soleil",
    message: "La photo du soir, avec le bruit des vagues.",
    location: "Sanary-sur-Mer",
    theme: "crepuscule",
    createdAt: "2026-07-25T19:40:00.000Z",
    duration: 21,
    peaks: samplePeaks(2),
    photoUrl: "/demo/photo-plage.png",
  },
];

const errors = [];

function watch(page, label) {
  page.on("pageerror", (err) => errors.push(`[${label}] pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[${label}] console: ${msg.text()}`);
  });
}

async function settle(page, ms = 1400) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(ms);
}

async function main() {
  const browser = await chromium.launch({
    executablePath,
    args: [
      "--no-sandbox",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--autoplay-policy=no-user-gesture-required",
      "--force-prefers-reduced-motion=no",
    ],
  });

  // ---------------- Desktop ----------------
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: Number(process.env.SCREENSHOT_DSF ?? 1),
    locale: "fr-FR",
  });

  {
    const page = await desktop.newPage();
    watch(page, "home");
    await page.goto(`${BASE}/`);
    await settle(page);
    await page.screenshot({ path: join(outDir, "accueil.png") });
    await page.close();
  }

  {
    const page = await desktop.newPage();
    watch(page, "carte");
    await page.goto(`${BASE}/c/demo`);
    await settle(page);
    // Lecture en cours pour montrer la progression sur l'onde
    await page.click(".pc-play");
    await page.waitForTimeout(3500);
    await page.screenshot({ path: join(outDir, "carte-lecture.png") });
    // Verso
    await page.click(".pc-flip");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(outDir, "carte-verso.png") });
    await page.close();
  }

  {
    const page = await desktop.newPage();
    watch(page, "studio");
    await page.goto(`${BASE}/studio`);
    await settle(page);
    await page.click(".rec-button");
    await page.waitForTimeout(4200);
    await page.screenshot({ path: join(outDir, "studio-enregistrement.png") });
    // Fin d'enregistrement → pré-écoute
    await page.click(".rec-button");
    await page.waitForSelector("text=C'est dans la boîte", { timeout: 15000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(outDir, "studio-pret.png") });
    // Étape habillage avec aperçu vivant
    await page.click("text=Habiller ma carte");
    await page.waitForTimeout(1400);
    await page.screenshot({ path: join(outDir, "studio-habillage.png") });
    // Parcours photo : import, recadrage et rendu sur la carte.
    await page.setInputFiles(
      'input[type="file"]',
      join(root, "public", "demo", "photo-plage.png")
    );
    await page.waitForSelector("text=Photo ajoutée", { timeout: 15000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(outDir, "studio-photo.png") });
    await page.close();
  }

  {
    const page = await desktop.newPage();
    watch(page, "carte-photo");
    await page.goto(`${BASE}/c/demo-photo`);
    await settle(page);
    await page.click(".pc-play");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(outDir, "carte-photo.png") });
    await page.click(".pc-flip");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(outDir, "carte-photo-verso.png") });
    await page.close();
  }

  {
    const page = await desktop.newPage();
    watch(page, "galerie");
    await page.addInitScript((seed) => {
      window.localStorage.setItem("cartouche.gallery.v1", JSON.stringify(seed));
    }, GALLERY_SEED);
    await page.goto(`${BASE}/galerie`);
    await settle(page);
    await page.screenshot({ path: join(outDir, "galerie.png") });
    await page.close();
  }

  // ---------------- Mobile ----------------
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "fr-FR",
  });

  {
    const page = await mobile.newPage();
    watch(page, "home-mobile");
    await page.goto(`${BASE}/`);
    await settle(page);
    await page.screenshot({ path: join(outDir, "accueil-mobile.png") });
    await page.close();
  }

  {
    const page = await mobile.newPage();
    watch(page, "carte-mobile");
    await page.goto(`${BASE}/c/demo`);
    await settle(page);
    await page.click(".pc-play");
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(outDir, "carte-mobile.png") });
    await page.close();
  }

  await browser.close();

  // ---------------- Image OpenGraph ----------------
  for (const [id, file] of [
    ["demo", "og-demo.png"],
    ["demo-photo", "og-demo-photo.png"],
  ]) {
    const og = await fetch(`${BASE}/c/${id}/opengraph-image`);
    if (og.ok) {
      writeFileSync(join(outDir, file), Buffer.from(await og.arrayBuffer()));
    } else {
      errors.push(`[og:${id}] HTTP ${og.status}`);
    }
  }

  if (errors.length) {
    console.log("\n⚠ Erreurs relevées :");
    for (const e of errors) console.log("  " + e);
    process.exitCode = 1;
  } else {
    console.log("OK — captures dans docs/screenshots/ sans erreur console.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
