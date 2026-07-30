"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { photoErrorMessage, processPhoto, type ProcessedPhoto } from "@/lib/photo";

interface PhotoFieldProps {
  photo: ProcessedPhoto | null;
  onChange: (photo: ProcessedPhoto | null) => void;
  disabled?: boolean;
}

/** Import d'une photo : recadrage 4:3 et ré-encodage JPEG côté navigateur. */
export function PhotoField({ photo, onChange, disabled = false }: PhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await processPhoto(file));
    } catch (err) {
      setError(photoErrorMessage(err));
    } finally {
      setBusy(false);
      // Permet de re-sélectionner le même fichier après un retrait.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="field-label">
        Votre photo
        <span className="font-normal tracking-normal normal-case">facultatif</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {photo ? (
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-cream/70 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt="Aperçu de la photo choisie"
            className="h-16 w-[5.4rem] flex-none rounded-lg object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Photo ajoutée</p>
            <p className="text-xs text-ink-soft">
              Recadrée en 4:3 · {Math.round(photo.blob.size / 1024)} Ko · métadonnées retirées
            </p>
          </div>
          <div className="flex flex-none items-center gap-1.5">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={pick}
              disabled={disabled || busy}
              aria-label="Changer de photo"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-danger"
              onClick={() => onChange(null)}
              disabled={disabled}
              aria-label="Retirer la photo"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={disabled || busy}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-cream/40 px-5 py-4 text-left transition-colors hover:border-accent hover:bg-cream disabled:opacity-60"
        >
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-accent-soft text-accent">
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              {busy ? "Préparation de la photo…" : "Ajouter une photo"}
            </span>
            <span className="block text-xs text-ink-soft">
              Elle remplace l&apos;illustration ; le décor habille le reste de la carte.
            </span>
          </span>
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm font-medium text-accent-deep">{error}</p>
      )}
    </div>
  );
}
