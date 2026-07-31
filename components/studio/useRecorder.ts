"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { computePeaks } from "@/lib/audio/peaks";
import { encodeWav, mixToMono } from "@/lib/audio/wav";
import { AUDIO_TARGET_RATE, MAX_DURATION_S } from "@/lib/types";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "ready"
  | "error";

export interface RecordingResult {
  /** WAV PCM mono — lisible par tous les navigateurs. */
  wavBlob: Blob;
  /** URL objet pour la pré-écoute locale. */
  url: string;
  duration: number;
  peaks: number[];
}

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m));
}

/**
 * Ramène l'enregistrement en mono à `AUDIO_TARGET_RATE`. Le WAV est deux fois
 * plus léger qu'au 48 kHz d'origine, ce qui garde l'envoi loin de la limite de
 * corps de requête de Vercel — surtout quand une photo l'accompagne.
 */
async function toMono24k(
  buffer: AudioBuffer
): Promise<{ samples: Float32Array; sampleRate: number }> {
  const Offline: typeof OfflineAudioContext | undefined =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;

  if (Offline && buffer.sampleRate > AUDIO_TARGET_RATE) {
    try {
      const length = Math.max(1, Math.ceil(buffer.duration * AUDIO_TARGET_RATE));
      const offline = new Offline(1, length, AUDIO_TARGET_RATE);
      const source = offline.createBufferSource();
      source.buffer = buffer;
      source.connect(offline.destination);
      source.start();
      const rendered = await offline.startRendering();
      return { samples: rendered.getChannelData(0), sampleRate: AUDIO_TARGET_RATE };
    } catch {
      // Navigateur récalcitrant : on garde le taux d'origine.
    }
  }

  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
    buffer.getChannelData(i)
  );
  return { samples: mixToMono(channels), sampleRate: buffer.sampleRate };
}

function friendlyError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      return "Le micro a été refusé. Autorisez son accès dans votre navigateur, puis réessayez.";
    }
    if (err.name === "NotFoundError") {
      return "Aucun micro détecté sur cet appareil.";
    }
    if (err.name === "NotReadableError") {
      return "Le micro est occupé par une autre application.";
    }
  }
  return "Impossible de démarrer l'enregistrement.";
}

/**
 * Capture micro → décodage → ré-encodage WAV mono + calcul de la forme d'onde.
 * Le traitement est fait côté client : le serveur ne reçoit qu'un WAV prêt à servir.
 */
export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  // Optimiste au premier rendu pour que SSR et hydratation coïncident,
  // vérifié réellement après montage.
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(
      Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined"
    );
  }, []);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const rafRef = useRef(0);
  const startedAtRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);

  const cleanupCapture = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setAnalyser(null);
    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    if (ctx && ctx.state !== "closed") {
      void ctx.close().catch(() => {});
    }
  }, []);

  const discardResult = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
  }, []);

  useEffect(() => {
    return () => {
      cleanupCapture();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, [cleanupCapture]);

  const process = useCallback(
    async (recorded: Blob) => {
      setStatus("processing");
      try {
        const Ctx: typeof AudioContext =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const decodeCtx = new Ctx();
        const buffer = await decodeCtx.decodeAudioData(await recorded.arrayBuffer());
        void decodeCtx.close().catch(() => {});

        if (buffer.duration < 0.5) {
          setError("C'était un peu court ! Visez au moins une seconde.");
          setStatus("error");
          return;
        }

        const { samples: mono, sampleRate } = await toMono24k(buffer);
        const peaks = computePeaks(mono);
        const wav = new Blob([encodeWav(mono, sampleRate)], {
          type: "audio/wav",
        });

        discardResult();
        const url = URL.createObjectURL(wav);
        resultUrlRef.current = url;
        setResult({
          wavBlob: wav,
          url,
          duration: Math.min(buffer.duration, MAX_DURATION_S),
          peaks,
        });
        setStatus("ready");
      } catch {
        setError("Impossible de traiter l'enregistrement. Réessayez.");
        setStatus("error");
      }
    },
    [discardResult]
  );

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!supported) {
      setError("Votre navigateur ne permet pas l'enregistrement audio.");
      setStatus("error");
      return;
    }
    setError(null);
    discardResult();
    setElapsed(0);
    setStatus("requesting");

    let stream: MediaStream;
    try {
      // Réduction de bruit désactivée : on veut le vrai grain d'un marché ou de la mer.
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });
    } catch (err) {
      setError(friendlyError(err));
      setStatus("error");
      return;
    }

    streamRef.current = stream;

    try {
      const Ctx: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 1024;
      source.connect(node);
      setAnalyser(node);
    } catch {
      // La visualisation est un bonus : l'enregistrement reste possible sans elle.
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined
    );
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.addEventListener("dataavailable", (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    });
    recorder.addEventListener("stop", () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });
      cleanupCapture();
      void process(blob);
    });

    recorder.start(250);
    startedAtRef.current = performance.now();
    setStatus("recording");

    const tick = () => {
      const seconds = (performance.now() - startedAtRef.current) / 1000;
      setElapsed(Math.min(seconds, MAX_DURATION_S));
      if (seconds >= MAX_DURATION_S) {
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [supported, discardResult, cleanupCapture, process, stop]);

  const reset = useCallback(() => {
    cleanupCapture();
    discardResult();
    setError(null);
    setElapsed(0);
    setStatus("idle");
  }, [cleanupCapture, discardResult]);

  return { status, error, elapsed, result, analyser, supported, start, stop, reset };
}
