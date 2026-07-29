"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Mail, Mic, Trash2 } from "lucide-react";
import type { GalleryEntry } from "@/lib/types";
import { listGallery, removeFromGallery } from "@/lib/gallery";
import { copyToClipboard } from "@/lib/share";
import { formatDateFr, formatDuration } from "@/lib/format";
import { useToast } from "@/components/Toast";
import { PostcardShell } from "@/components/postcard/PostcardShell";
import { PostcardFront } from "@/components/postcard/PostcardFront";
import { FALLBACK_TITLE } from "@/components/postcard/shared";

function EmptyState() {
  return (
    <div className="panel mx-auto max-w-lg px-8 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
        <Mail className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-2xl font-semibold italic">
        Aucune carte pour l&apos;instant
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
        Les cartes que vous enverrez depuis cet appareil s&apos;afficheront ici,
        prêtes à être réécoutées et repartagées.
      </p>
      <Link href="/studio" className="btn btn-primary mt-7">
        <Mic className="h-4 w-4" aria-hidden />
        Créer ma première carte
      </Link>
    </div>
  );
}

function GalleryItem({
  entry,
  onDelete,
}: {
  entry: GalleryEntry;
  onDelete: (entry: GalleryEntry) => void;
}) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const confirmTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(confirmTimer.current), []);

  return (
    <article className="flex flex-col gap-3">
      <Link
        href={entry.path}
        className="block transition-transform duration-300 hover:-translate-y-1.5"
        aria-label={`Ouvrir la carte « ${entry.title || FALLBACK_TITLE} »`}
      >
        <PostcardShell theme={entry.theme} front={<PostcardFront card={entry} />} />
      </Link>
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="min-w-0 truncate text-sm text-ink-soft">
          {formatDateFr(entry.createdAt)} · {formatDuration(entry.duration)}
        </p>
        <div className="flex flex-none items-center gap-1.5">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              const ok = await copyToClipboard(`${window.location.origin}${entry.path}`);
              toast(ok ? "Lien copié !" : "Impossible de copier le lien.");
            }}
            aria-label="Copier le lien de la carte"
          >
            <Copy className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={`btn btn-ghost btn-sm btn-danger ${confirming ? "!border-accent !bg-accent-soft" : ""}`}
            onClick={() => {
              if (confirming) {
                window.clearTimeout(confirmTimer.current);
                onDelete(entry);
                return;
              }
              setConfirming(true);
              confirmTimer.current = window.setTimeout(
                () => setConfirming(false),
                3200
              );
            }}
            aria-label={
              confirming ? "Confirmer la suppression" : "Supprimer la carte"
            }
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {confirming && <span className="text-xs font-bold">Sûr&nbsp;?</span>}
          </button>
        </div>
      </div>
    </article>
  );
}

export function GalleryView() {
  const toast = useToast();
  const [entries, setEntries] = useState<GalleryEntry[] | null>(null);

  useEffect(() => {
    setEntries(listGallery());
  }, []);

  const handleDelete = async (entry: GalleryEntry) => {
    let serverOk = !entry.ownerToken;
    if (entry.ownerToken) {
      try {
        const response = await fetch(`/api/cards/${entry.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${entry.ownerToken}` },
        });
        serverOk = response.ok || response.status === 404;
      } catch {
        serverOk = false;
      }
    }
    removeFromGallery(entry.id);
    setEntries(listGallery());
    toast(
      serverOk
        ? "Carte supprimée."
        : "Carte retirée d'ici — la suppression du lien a échoué, réessayez plus tard."
    );
  };

  if (entries === null) {
    return (
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-[1.2rem] bg-card shadow-sm"
            style={{ aspectRatio: "148 / 105" }}
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <GalleryItem key={entry.id} entry={entry} onDelete={handleDelete} />
        ))}
      </div>
      <p className="mt-12 text-center text-sm text-ink-soft">
        Votre galerie vit dans ce navigateur, sans compte : pensez à garder les
        liens des cartes auxquelles vous tenez.
      </p>
    </>
  );
}
