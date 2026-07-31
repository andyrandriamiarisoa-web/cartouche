"use client";

import { useState } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { forceUpdate, isUpdateAvailable } from "@/lib/update";
import { shortBuildId } from "@/lib/version";

/**
 * Mise à jour à la demande, toujours accessible depuis le pied de page.
 * Si l'application est déjà à jour, on le dit plutôt que de recharger pour rien.
 */
export function UpdateButton() {
  const [state, setState] = useState<"idle" | "checking" | "uptodate">("idle");

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={state === "checking"}
        onClick={async () => {
          setState("checking");
          if (await isUpdateAvailable()) {
            await forceUpdate();
            return;
          }
          setState("uptodate");
          window.setTimeout(() => setState("idle"), 2600);
        }}
      >
        {state === "checking" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Recherche…
          </>
        ) : state === "uptodate" ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden />
            À jour
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Mettre à jour
          </>
        )}
      </button>
      <span className="font-mono text-xs text-ink-soft/80" title="Version installée">
        {shortBuildId()}
      </span>
    </span>
  );
}
