"use client";

import { ArrowRight, Loader2, Mic, RotateCcw, Square } from "lucide-react";
import { MAX_DURATION_S } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import type { useRecorder } from "@/components/studio/useRecorder";
import { LiveWaveform } from "@/components/studio/LiveWaveform";
import { InlinePlayer } from "@/components/studio/InlinePlayer";

interface RecordStepProps {
  recorder: ReturnType<typeof useRecorder>;
  onContinue: () => void;
}

export function RecordStep({ recorder, onContinue }: RecordStepProps) {
  const { status, error, elapsed, result, analyser, supported } = recorder;

  return (
    <section className="mx-auto max-w-2xl text-center">
      <p className="kicker">Étape 1 · Enregistrer</p>
      <h1 className="mt-3 font-display text-4xl font-semibold italic tracking-tight sm:text-5xl">
        Capturez l&apos;instant
      </h1>
      <p className="mx-auto mt-4 max-w-md text-ink-soft">
        Le rire du petit, le brouhaha du marché, un bonne-nuit murmuré. Trente
        secondes suffisent — c&apos;est la contrainte qui fait le charme.
      </p>

      {!supported && (
        <div className="panel mx-auto mt-8 max-w-md p-6 text-sm text-ink-soft">
          Votre navigateur ne permet pas d&apos;enregistrer de son. Essayez avec une
          version récente de Chrome, Safari ou Firefox.
        </div>
      )}

      {error && (status === "error" || status === "idle") && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-accent-soft px-5 py-3.5 text-sm font-medium text-accent-deep">
          {error}
        </div>
      )}

      {supported && (status === "idle" || status === "error") && (
        <div className="mt-10 flex flex-col items-center gap-5">
          <button
            type="button"
            className="rec-button"
            onClick={() => void recorder.start()}
            aria-label="Démarrer l'enregistrement"
          >
            <Mic className="h-9 w-9" aria-hidden />
          </button>
          <p className="text-sm font-medium text-ink-soft">
            Appuyez pour enregistrer · {MAX_DURATION_S} secondes max
          </p>
        </div>
      )}

      {status === "requesting" && (
        <div className="mt-10 flex flex-col items-center gap-5">
          <div className="rec-button opacity-70" aria-hidden>
            <Loader2 className="h-9 w-9 animate-spin" />
          </div>
          <p className="text-sm font-medium text-ink-soft">
            Autorisez l&apos;accès au micro…
          </p>
        </div>
      )}

      {status === "recording" && (
        <div className="rise-in mt-10 flex flex-col items-center gap-6">
          <div className="rec-timer text-5xl">
            {formatDuration(elapsed)}
            <span className="text-xl text-ink-soft"> / {formatDuration(MAX_DURATION_S)}</span>
          </div>
          <div className="h-24 w-full overflow-hidden rounded-2xl border border-line bg-cream/80 px-4">
            <LiveWaveform analyser={analyser} active />
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MAX_DURATION_S}
            aria-valuenow={Math.round(elapsed)}
            aria-label="Durée d'enregistrement"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-150 ease-linear"
              style={{ width: `${(elapsed / MAX_DURATION_S) * 100}%` }}
            />
          </div>
          <button
            type="button"
            className="rec-button"
            data-recording="true"
            onClick={recorder.stop}
            aria-label="Terminer l'enregistrement"
          >
            <Square className="h-7 w-7" fill="currentColor" strokeWidth={0} aria-hidden />
          </button>
          <p className="text-sm font-medium text-ink-soft">Appuyez pour terminer</p>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-12 flex flex-col items-center gap-4 text-ink-soft">
          <Loader2 className="h-10 w-10 animate-spin text-accent" aria-hidden />
          <p className="text-sm font-medium">On développe la pellicule…</p>
        </div>
      )}

      {status === "ready" && result && (
        <div className="rise-in mt-10 flex flex-col gap-6 text-left">
          <h2 className="text-center font-display text-2xl font-semibold italic">
            C&apos;est dans la boîte !
          </h2>
          <InlinePlayer src={result.url} duration={result.duration} peaks={result.peaks} />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" className="btn btn-ghost" onClick={recorder.reset}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Refaire
            </button>
            <button type="button" className="btn btn-primary" onClick={onContinue}>
              Habiller ma carte
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
