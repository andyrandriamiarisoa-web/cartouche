"use client";

import { useState } from "react";
import type { CardData } from "@/lib/types";
import { addToGallery } from "@/lib/gallery";
import { useRecorder } from "@/components/studio/useRecorder";
import { RecordStep } from "@/components/studio/RecordStep";
import { CustomizeStep, type CardFormValues } from "@/components/studio/CustomizeStep";
import { ShareStep } from "@/components/studio/ShareStep";

type Step = "record" | "dress" | "share";

const STEPS: Array<{ id: Step; label: string }> = [
  { id: "record", label: "Enregistrer" },
  { id: "dress", label: "Habiller" },
  { id: "share", label: "Envoyer" },
];

function StepDots({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="mx-auto mb-12 flex w-full max-w-md items-center gap-3" aria-label="Progression">
      {STEPS.map((step, i) => (
        <li key={step.id} className="flex flex-1 items-center gap-3 last:flex-none">
          <span
            className={`flex items-center gap-2 ${
              i <= currentIndex ? "text-ink" : "text-ink-soft/70"
            }`}
            aria-current={i === currentIndex ? "step" : undefined}
          >
            <span
              className={`grid h-7 w-7 flex-none place-items-center rounded-full text-xs font-bold ${
                i < currentIndex
                  ? "bg-accent/15 text-accent"
                  : i === currentIndex
                    ? "bg-accent text-[#fff6ef]"
                    : "bg-line text-ink-soft"
              }`}
            >
              {i + 1}
            </span>
            <span className="hidden text-sm font-semibold sm:inline">{step.label}</span>
          </span>
          {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

export function StudioFlow() {
  const recorder = useRecorder();
  const [step, setStep] = useState<Step>("record");
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [published, setPublished] = useState<{ card: CardData; path: string } | null>(
    null
  );

  const submit = async (values: CardFormValues) => {
    const recording = recorder.result;
    if (!recording) return;
    setSending(true);
    setSubmitError(null);

    try {
      const form = new FormData();
      form.append("audio", recording.wavBlob, "cartouche.wav");
      form.append(
        "meta",
        JSON.stringify({
          ...values,
          duration: recording.duration,
          peaks: recording.peaks,
        })
      );

      const response = await fetch("/api/cards", { method: "POST", body: form });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setSubmitError(data?.error ?? "L'envoi a échoué, réessayez dans un instant.");
        return;
      }

      const data = (await response.json()) as {
        id: string;
        path: string;
        createdAt: string;
        ownerToken: string;
      };

      const card: CardData = {
        id: data.id,
        ...values,
        createdAt: data.createdAt,
        duration: recording.duration,
        peaks: recording.peaks,
        // Lecture instantanée depuis l'enregistrement local, le blob prend le relai ensuite.
        audioUrl: recording.url,
        version: 1,
      };

      addToGallery({
        id: data.id,
        path: data.path,
        title: values.title,
        message: values.message,
        location: values.location,
        theme: values.theme,
        createdAt: data.createdAt,
        duration: recording.duration,
        peaks: recording.peaks,
        ownerToken: data.ownerToken,
      });

      setPublished({ card, path: data.path });
      setStep("share");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("L'envoi a échoué — vérifiez votre connexion et réessayez.");
    } finally {
      setSending(false);
    }
  };

  const createAnother = () => {
    recorder.reset();
    setPublished(null);
    setSubmitError(null);
    setStep("record");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-6">
      <StepDots current={step} />
      {step === "record" && (
        <RecordStep recorder={recorder} onContinue={() => setStep("dress")} />
      )}
      {step === "dress" && recorder.result && (
        <CustomizeStep
          recording={recorder.result}
          sending={sending}
          submitError={submitError}
          onBack={() => {
            recorder.reset();
            setStep("record");
          }}
          onSubmit={(values) => void submit(values)}
        />
      )}
      {step === "share" && published && (
        <ShareStep
          card={published.card}
          path={published.path}
          onCreateAnother={createAnother}
        />
      )}
    </div>
  );
}
