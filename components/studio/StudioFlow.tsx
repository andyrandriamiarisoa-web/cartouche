"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_UPLOAD_BYTES, type CardData } from "@/lib/types";
import { photoFromBlob, type ProcessedPhoto } from "@/lib/photo";
import { DEFAULT_THEME } from "@/lib/themes";
import { addToGallery } from "@/lib/gallery";
import { clearDraft, loadDraft, saveDraft, type CardDraft } from "@/lib/draft";
import { useRecorder } from "@/components/studio/useRecorder";
import { RecordStep } from "@/components/studio/RecordStep";
import { CustomizeStep, type CardFormValues } from "@/components/studio/CustomizeStep";
import { DraftNotice } from "@/components/studio/DraftNotice";
import { ShareStep } from "@/components/studio/ShareStep";

type Step = "record" | "dress" | "share";

const EMPTY_VALUES: CardFormValues = {
  title: "",
  message: "",
  location: "",
  theme: DEFAULT_THEME,
};

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
  const [photo, setPhoto] = useState<ProcessedPhoto | null>(null);
  const [values, setValues] = useState<CardFormValues>(EMPTY_VALUES);
  const [pendingDraft, setPendingDraft] = useState<CardDraft | null>(null);
  const [published, setPublished] = useState<{ card: CardData; path: string } | null>(
    null
  );

  // L'URL objet de la photo doit être libérée à chaque remplacement.
  const photoUrlRef = useRef<string | null>(null);
  const changePhoto = useCallback((next: ProcessedPhoto | null) => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = next?.url ?? null;
    setPhoto(next);
  }, []);
  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, []);

  // Un enregistrement en attente sur l'appareil : on le propose plutôt que de
  // le réimposer — l'instant a pu être remplacé par un autre.
  useEffect(() => {
    let cancelled = false;
    void loadDraft().then((draft) => {
      if (!cancelled && draft) setPendingDraft(draft);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Le brouillon suit l'enregistrement et tout ce qui l'habille : dès qu'une
   * prise est prête, rien de ce qui a été fait ne dépend plus de l'onglet.
   */
  const recording = recorder.result;
  useEffect(() => {
    if (!recording || published) return;
    void saveDraft({
      wav: recording.wavBlob,
      duration: recording.duration,
      peaks: recording.peaks,
      photo: photo?.blob ?? null,
      values,
    });
  }, [recording, photo, values, published]);

  const resumeDraft = useCallback(
    (draft: CardDraft) => {
      recorder.restore(draft.wav, draft.duration, draft.peaks);
      setValues(draft.values);
      changePhoto(draft.photo ? photoFromBlob(draft.photo) : null);
      setPendingDraft(null);
      setStep("dress");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [recorder, changePhoto]
  );

  const discardDraft = useCallback(() => {
    setPendingDraft(null);
    void clearDraft();
  }, []);

  const submit = async () => {
    if (!recording) return;
    setSending(true);
    setSubmitError(null);

    // Au-delà de la limite de corps de requête, Vercel coupe la requête avant
    // notre code : mieux vaut le dire clairement que laisser un échec opaque.
    const uploadBytes = recording.wavBlob.size + (photo?.blob.size ?? 0);
    if (uploadBytes > MAX_UPLOAD_BYTES) {
      setSubmitError(
        "L'ensemble audio + photo est trop lourd. Retirez la photo ou refaites un enregistrement plus court."
      );
      setSending(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("audio", recording.wavBlob, "cartouche.wav");
      if (photo) form.append("photo", photo.blob, "cartouche.jpg");
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
        photoUrl: string | null;
      };

      const photoUrl = data.photoUrl ?? undefined;
      const card: CardData = {
        id: data.id,
        ...values,
        createdAt: data.createdAt,
        duration: recording.duration,
        peaks: recording.peaks,
        // Lecture instantanée depuis l'enregistrement local, le blob prend le relai ensuite.
        audioUrl: recording.url,
        photoUrl,
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
        photoUrl,
        ownerToken: data.ownerToken,
      });

      setPublished({ card, path: data.path });
      // La carte est partie : le brouillon n'a plus de raison d'être.
      void clearDraft();
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
    changePhoto(null);
    setValues(EMPTY_VALUES);
    setPublished(null);
    setSubmitError(null);
    void clearDraft();
    setStep("record");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-6">
      <StepDots current={step} />
      {step === "record" && (
        <>
          {pendingDraft && (
            <DraftNotice
              draft={pendingDraft}
              onResume={() => resumeDraft(pendingDraft)}
              onDiscard={discardDraft}
            />
          )}
          <RecordStep
            recorder={recorder}
            onContinue={() => setStep("dress")}
            onDiscardRecording={() => void clearDraft()}
          />
        </>
      )}
      {step === "dress" && recording && (
        <CustomizeStep
          recording={recording}
          photo={photo}
          onPhotoChange={changePhoto}
          values={values}
          onValuesChange={setValues}
          sending={sending}
          submitError={submitError}
          // Revenir en arrière ne détruit plus la prise : elle reste
          // disponible tant que l'expéditeur n'en refait pas une lui-même.
          onBack={() => setStep("record")}
          onSubmit={() => void submit()}
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
