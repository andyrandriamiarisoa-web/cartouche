"use client";

import { useMemo } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { THEMES, THEME_IDS, type ThemeId } from "@/lib/themes";
import { TEXT_LIMITS, type CardData } from "@/lib/types";
import type { ProcessedPhoto } from "@/lib/photo";
import type { RecordingResult } from "@/components/studio/useRecorder";
import { PlayableCard } from "@/components/postcard/PlayableCard";
import { DecorPicker } from "@/components/studio/DecorPicker";
import { PhotoField } from "@/components/studio/PhotoField";

export interface CardFormValues {
  title: string;
  message: string;
  location: string;
  theme: ThemeId;
}

interface CustomizeStepProps {
  recording: RecordingResult;
  photo: ProcessedPhoto | null;
  onPhotoChange: (photo: ProcessedPhoto | null) => void;
  /**
   * Le formulaire est piloté par le studio : ce qui est écrit ici survit à un
   * retour en arrière, à un rechargement et à une mise à jour.
   */
  values: CardFormValues;
  onValuesChange: (values: CardFormValues) => void;
  sending: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export function CustomizeStep({
  recording,
  photo,
  onPhotoChange,
  values,
  onValuesChange,
  sending,
  submitError,
  onBack,
  onSubmit,
}: CustomizeStepProps) {
  const { title, message, location, theme } = values;
  const set = <K extends keyof CardFormValues>(key: K, value: CardFormValues[K]) =>
    onValuesChange({ ...values, [key]: value });

  const createdAt = useMemo(() => new Date().toISOString(), []);

  const previewCard: CardData = {
    id: "apercu",
    title,
    message,
    location,
    theme,
    createdAt,
    duration: recording.duration,
    peaks: recording.peaks,
    audioUrl: recording.url,
    photoUrl: photo?.url,
    version: 1,
  };

  return (
    <section className="mx-auto max-w-5xl">
      <div className="text-center">
        <p className="kicker">Étape 2 · Habiller</p>
        <h1 className="mt-3 font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
          Habillez votre carte
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          {THEME_IDS.length} décors, ou votre propre photo. La carte est vivante :
          écoutez-la, retournez-la.
        </p>
      </div>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* Aperçu vivant */}
        <div className="order-first mx-auto w-full max-w-xl lg:sticky lg:top-8 lg:order-last">
          <PlayableCard card={previewCard} />
          <p className="mt-4 text-center text-sm text-ink-soft">
            Aperçu en direct — le petit bouton retourne la carte.
          </p>
        </div>

        {/* Formulaire */}
        <form
          className="flex flex-col gap-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (!sending) onSubmit();
          }}
        >
          <div>
            <p className="field-label">
              Le décor
              <span className="font-normal tracking-normal normal-case">
                {THEMES[theme].name} · {THEMES[theme].tagline}
              </span>
            </p>
            <DecorPicker
              value={theme}
              onChange={(next: ThemeId) => set("theme", next)}
              mutedByPhoto={Boolean(photo)}
            />
            {photo && (
              <p className="mt-2 text-xs text-ink-soft">
                Votre photo occupe le devant de la carte : le décor habille le
                papier, le timbre et la forme d&apos;onde.
              </p>
            )}
          </div>

          <PhotoField photo={photo} onChange={onPhotoChange} disabled={sending} />

          <div>
            <label htmlFor="card-title" className="field-label">
              Le titre
              <span className="font-normal tracking-normal normal-case">
                {title.length}/{TEXT_LIMITS.title}
              </span>
            </label>
            <input
              id="card-title"
              className="field"
              placeholder="Le rire d'Anna"
              value={title}
              maxLength={TEXT_LIMITS.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="card-location" className="field-label">
              Le lieu <span className="font-normal tracking-normal normal-case">facultatif</span>
            </label>
            <input
              id="card-location"
              className="field"
              placeholder="Sanary-sur-Mer"
              value={location}
              maxLength={TEXT_LIMITS.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="card-message" className="field-label">
              Quelques mots au verso
              <span className="font-normal tracking-normal normal-case">
                {message.length}/{TEXT_LIMITS.message}
              </span>
            </label>
            <textarea
              id="card-message"
              className="field resize-none"
              rows={3}
              placeholder="On pense à vous depuis la plage…"
              value={message}
              maxLength={TEXT_LIMITS.message}
              onChange={(e) => set("message", e.target.value)}
            />
          </div>

          {submitError && (
            <div className="rounded-2xl bg-accent-soft px-5 py-3.5 text-sm font-medium text-accent-deep">
              {submitError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onBack}
              disabled={sending}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Retour
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  On glisse la carte dans l&apos;enveloppe…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  Envoyer la carte
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
