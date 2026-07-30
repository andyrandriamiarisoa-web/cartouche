import demoWave from "@/lib/demo-peaks.json";
import type { CardData } from "@/lib/types";

export const DEMO_CARD_ID = "demo";
export const DEMO_PHOTO_CARD_ID = "demo-photo";

/**
 * Cartes d'exemple embarquées dans l'application : elles fonctionnent sans
 * stockage configuré et servent de vitrine sur l'accueil comme sur `/c/demo`.
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

/** Même enregistrement, mais habillé d'une photo à la place de l'illustration. */
export const DEMO_PHOTO_CARD: CardData = {
  id: DEMO_PHOTO_CARD_ID,
  title: "Notre coucher de soleil",
  message:
    "La photo du soir, avec le bruit des vagues qui va avec. On vous embrasse tous les deux !",
  location: "Sanary-sur-Mer",
  theme: "crepuscule",
  createdAt: "2026-07-25T19:40:00.000Z",
  duration: demoWave.duration,
  peaks: demoWave.peaks,
  audioUrl: "/demo/cartouche-demo.wav",
  photoUrl: "/demo/photo-plage.png",
  version: 1,
};

export const DEMO_CARDS: Record<string, CardData> = {
  [DEMO_CARD_ID]: DEMO_CARD,
  [DEMO_PHOTO_CARD_ID]: DEMO_PHOTO_CARD,
};
