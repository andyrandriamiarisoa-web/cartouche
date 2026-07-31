"use client";

import { Trash2, Undo2 } from "lucide-react";
import type { CardDraft } from "@/lib/draft";
import { formatDuration } from "@/lib/format";

interface DraftNoticeProps {
  draft: CardDraft;
  onResume: () => void;
  onDiscard: () => void;
}

/**
 * Une prise non envoyée retrouvée sur l'appareil. On la propose sans
 * l'imposer : l'instant a pu être remplacé par un autre entre-temps.
 */
export function DraftNotice({ draft, onResume, onDiscard }: DraftNoticeProps) {
  const title = draft.values.title.trim();

  return (
    <div
      className="pop-in mx-auto mb-10 flex max-w-2xl flex-col gap-4 rounded-2xl border border-line bg-cream px-5 py-4 shadow-sm sm:flex-row sm:items-center"
      role="status"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Un enregistrement vous attend</p>
        <p className="mt-0.5 text-sm text-ink-soft">
          {title ? `« ${title} » — ` : ""}
          {formatDuration(draft.duration)} enregistrées et jamais envoyées.
        </p>
      </div>
      <div className="flex flex-none items-center gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={onResume}>
          <Undo2 className="h-4 w-4" aria-hidden />
          Reprendre
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onDiscard}
          aria-label="Supprimer l'enregistrement en attente"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
