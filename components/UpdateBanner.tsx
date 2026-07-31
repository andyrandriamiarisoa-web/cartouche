"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, X } from "lucide-react";
import { cleanCacheBuster, forceUpdate, isUpdateAvailable } from "@/lib/update";

/** Toutes les 10 minutes tant que l'onglet est ouvert. */
const CHECK_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Surveille discrètement la mise en ligne d'une nouvelle version et propose de
 * recharger. Une application gardée sur l'écran d'accueil peut rester des jours
 * sur du code périmé : la vérification est donc refaite chaque fois que
 * l'utilisateur revient sur l'application, pas seulement au premier chargement.
 */
export function UpdateBanner() {
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const check = useCallback(async (signal?: AbortSignal) => {
    if (await isUpdateAvailable(signal)) setAvailable(true);
  }, []);

  useEffect(() => {
    cleanCacheBuster();

    const controller = new AbortController();
    void check(controller.signal);

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const timer = window.setInterval(() => void check(), CHECK_INTERVAL_MS);

    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.clearInterval(timer);
    };
  }, [check]);

  if (!available || dismissed) return null;

  return (
    <div
      className="pop-in fixed inset-x-3 bottom-3 z-[70] mx-auto flex max-w-md flex-col gap-3 rounded-2xl border border-line bg-cream p-3.5 shadow-lg sm:inset-x-auto sm:right-4 sm:flex-row sm:items-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-accent-soft text-accent">
          <RefreshCw className="h-4 w-4" aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-sm">
          <span className="block font-semibold">Une nouvelle version est prête</span>
          <span className="block text-xs text-ink-soft">
            Rechargez pour en profiter.
          </span>
        </p>
      </div>
      <div className="flex flex-none items-center gap-1.5">
        <button
          type="button"
          className="btn btn-primary btn-sm flex-1 sm:flex-none"
          onClick={() => {
            setUpdating(true);
            void forceUpdate();
          }}
          disabled={updating}
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            "Mettre à jour"
          )}
        </button>
        <button
          type="button"
          className="flex-none rounded-full p-1.5 text-ink-soft transition-colors hover:text-ink"
          onClick={() => setDismissed(true)}
          aria-label="Plus tard"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
