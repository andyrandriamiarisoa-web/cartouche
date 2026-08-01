"use client";

import { ArrayBufferTarget, Muxer } from "mp4-muxer";
import type { ThemeDef } from "@/lib/themes";
import { AUDIO_TARGET_RATE } from "@/lib/types";
import {
  AUDIO_BITRATE,
  AUDIO_CODEC,
  FRAME_RATE,
  FRAME_SIZE,
  VIDEO_BITRATE,
  VIDEO_CODEC,
} from "@/lib/video/layout";
import { drawFrame } from "@/lib/video/render";

/** Une image-clé toutes les deux secondes : lecture fluide même en reprise. */
const KEYFRAME_EVERY = FRAME_RATE * 2;
/** Au-delà, on laisse l'encodeur respirer plutôt que de saturer la mémoire. */
const MAX_QUEUE = 8;

export interface VideoJob {
  background: CanvasImageSource;
  audio: AudioBuffer;
  peaks: number[];
  theme: ThemeDef;
  /** Progression 0..1, pour la barre affichée à l'utilisateur. */
  onProgress?: (ratio: number) => void;
  signal?: AbortSignal;
}

type Codecs = typeof globalThis & {
  VideoEncoder?: typeof VideoEncoder;
  AudioEncoder?: typeof AudioEncoder;
};

/**
 * WebCodecs n'est pas partout, et un encodeur présent ne garantit pas que ce
 * profil précis soit accepté. On demande à l'avance plutôt que d'échouer au
 * milieu d'un rendu.
 */
export async function canEncodeVideo(): Promise<boolean> {
  const scope = globalThis as Codecs;
  if (!scope.VideoEncoder || !scope.AudioEncoder) return false;
  try {
    const [video, audio] = await Promise.all([
      scope.VideoEncoder.isConfigSupported({
        codec: VIDEO_CODEC,
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        bitrate: VIDEO_BITRATE,
        framerate: FRAME_RATE,
      }),
      scope.AudioEncoder.isConfigSupported({
        codec: AUDIO_CODEC,
        // Le taux réel des enregistrements, pas une valeur de principe.
        sampleRate: AUDIO_TARGET_RATE,
        numberOfChannels: 1,
        bitrate: AUDIO_BITRATE,
      }),
    ]);
    return Boolean(video.supported && audio.supported);
  } catch {
    return false;
  }
}

function assertLive(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Rendu annulé", "AbortError");
}

/** Laisse l'encodeur écouler sa file avant de lui pousser d'autres images. */
async function drain(encoder: { encodeQueueSize: number }) {
  while (encoder.encodeQueueSize > MAX_QUEUE) {
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
}

/**
 * Fabrique le MP4 : la carte animée en H.264, l'enregistrement en AAC.
 *
 * Le profil est volontairement modeste — Baseline 3.1, AAC-LC, 720×720. Un
 * encodage plus moderne donnerait un fichier plus léger que la moitié des
 * destinataires ne saurait pas lire, ce qui est exactement l'inverse du but :
 * la carte doit s'ouvrir sur le vieil iPhone comme sur l'Android du voisin.
 */
export async function encodeCardVideo(job: VideoJob): Promise<Blob> {
  const { background, audio, peaks, theme, onProgress, signal } = job;
  const scope = globalThis as Codecs;
  if (!scope.VideoEncoder || !scope.AudioEncoder) {
    throw new Error("encodage vidéo indisponible");
  }

  const canvas = document.createElement("canvas");
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("canvas indisponible");

  const duration = audio.duration;
  const totalFrames = Math.max(1, Math.round(duration * FRAME_RATE));

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: FRAME_SIZE, height: FRAME_SIZE, frameRate: FRAME_RATE },
    audio: {
      codec: "aac",
      numberOfChannels: 1,
      sampleRate: audio.sampleRate,
    },
    // L'index en tête du fichier : la lecture démarre sans télécharger le tout.
    fastStart: "in-memory",
  });

  let failure: unknown = null;
  const videoEncoder = new scope.VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (err) => {
      failure = err;
    },
  });
  videoEncoder.configure({
    codec: VIDEO_CODEC,
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    bitrate: VIDEO_BITRATE,
    framerate: FRAME_RATE,
    // Un encodeur logiciel accepte le profil sans discuter ; le matériel est
    // parfois plus regardant sur des dimensions non standard.
    hardwareAcceleration: "no-preference",
  });

  const audioEncoder = new scope.AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (err) => {
      failure = err;
    },
  });
  audioEncoder.configure({
    codec: AUDIO_CODEC,
    sampleRate: audio.sampleRate,
    numberOfChannels: 1,
    bitrate: AUDIO_BITRATE,
  });

  try {
    // Piste audio, par tranches d'une seconde : certains encodeurs AAC
    // rechignent devant un bloc de trente secondes d'un coup.
    const channel = audio.getChannelData(0);
    const block = audio.sampleRate;
    for (let offset = 0; offset < channel.length; offset += block) {
      const slice = channel.subarray(offset, Math.min(offset + block, channel.length));
      const data = new AudioData({
        format: "f32-planar",
        sampleRate: audio.sampleRate,
        numberOfFrames: slice.length,
        numberOfChannels: 1,
        timestamp: Math.round((offset / audio.sampleRate) * 1_000_000),
        data: slice.slice(),
      });
      audioEncoder.encode(data);
      data.close();
      await drain(audioEncoder);
    }

    // Piste vidéo : une image tous les 1/25 de seconde.
    for (let i = 0; i < totalFrames; i++) {
      assertLive(signal);
      if (failure) throw failure;

      drawFrame(ctx, background, peaks, theme, i / (totalFrames - 1 || 1));

      const frame = new VideoFrame(canvas, {
        timestamp: Math.round((i / FRAME_RATE) * 1_000_000),
        duration: Math.round(1_000_000 / FRAME_RATE),
      });
      videoEncoder.encode(frame, { keyFrame: i % KEYFRAME_EVERY === 0 });
      frame.close();

      await drain(videoEncoder);
      onProgress?.(((i + 1) / totalFrames) * 0.94);
    }

    await Promise.all([videoEncoder.flush(), audioEncoder.flush()]);
    if (failure) throw failure;

    muxer.finalize();
    onProgress?.(1);
    return new Blob([muxer.target.buffer], { type: "video/mp4" });
  } finally {
    if (videoEncoder.state !== "closed") videoEncoder.close();
    if (audioEncoder.state !== "closed") audioEncoder.close();
  }
}

/** Décode un WAV (ou tout format lisible) en échantillons exploitables. */
export async function decodeAudio(source: Blob | ArrayBuffer): Promise<AudioBuffer> {
  const Ctx: typeof AudioContext =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const bytes = source instanceof Blob ? await source.arrayBuffer() : source;
    return await ctx.decodeAudioData(bytes);
  } finally {
    void ctx.close().catch(() => {});
  }
}
