"use client";

import { BUILD_ID } from "@/lib/version";

/** Paramètre ajouté à l'URL pour forcer une navigation non mise en cache. */
const CACHE_BUSTER = "maj";

/**
 * Demande au serveur quelle version il sert maintenant. Retourne `true` si
 * elle diffère de celle qui fait tourner cette page.
 */
export async function isUpdateAvailable(signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch("/api/version", { cache: "no-store", signal });
    if (!response.ok) return false;
    const data = (await response.json()) as { buildId?: unknown };
    return typeof data.buildId === "string" && data.buildId !== BUILD_ID;
  } catch {
    // Hors ligne ou requête annulée : on ne dérange pas l'utilisateur.
    return false;
  }
}

/**
 * Recharge l'application en repartant de zéro : on vide les caches et on
 * navigue avec un paramètre anti-cache, car un simple `reload()` peut resservir
 * la page gardée en mémoire par une application ajoutée à l'écran d'accueil.
 */
export async function forceUpdate(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
  } catch {
    // Sans importance : on recharge quand même.
  }
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // Idem.
  }

  const url = new URL(window.location.href);
  url.searchParams.set(CACHE_BUSTER, Date.now().toString(36));
  window.location.replace(url.toString());
}

/** Retire le paramètre anti-cache de la barre d'adresse après le rechargement. */
export function cleanCacheBuster(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(CACHE_BUSTER)) return;
  url.searchParams.delete(CACHE_BUSTER);
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}
