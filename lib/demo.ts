import demoWave from "@/lib/demo-peaks.json";
import type { CardData } from "@/lib/types";

export const DEMO_CARD_ID = "demo";

/**
 * Carte d'exemple embarquée dans l'application : elle fonctionne sans stockage
 * configuré et sert de vitrine sur la page d'accueil comme sur `/c/demo`.
 */
export const DEMO_CARD: CardData = {
  id: DEMO_CARD_ID,
  title: "La mer, en vrai",
  message:
    "On pense à vous depuis la plage. Fermez les yeux, écoutez les vagues — c'est comme si vous y étiez. À très vite ! ♥",
  location: "Sanary-sur-Mer",
  theme: "riviera",
  createdAt: "2026-07-24T10:30:00.000Z",
  duration: demoWave.duration,
  peaks: demoWave.peaks,
  audioUrl: "/demo/cartouche-demo.wav",
  version: 1,
};
