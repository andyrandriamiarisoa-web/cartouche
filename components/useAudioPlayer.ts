"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioPlayerState {
  playing: boolean;
  /** Progression 0..1. */
  progress: number;
  currentTime: number;
  duration: number;
  toggle: () => void;
  seek: (fraction: number) => void;
}

/**
 * Lecteur audio minimaliste construit sur un élément `<audio>` hors-DOM.
 * L'élément n'est créé qu'au premier geste (exigence iOS) et la progression
 * est suivie en requestAnimationFrame pour une aiguille fluide.
 */
export function useAudioPlayer(src: string, fallbackDuration = 0): AudioPlayerState {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const durationOf = useCallback(
    (audio: HTMLAudioElement | null) => {
      const d = audio?.duration;
      return d !== undefined && Number.isFinite(d) && d > 0 ? d : fallbackDuration;
    },
    [fallbackDuration]
  );

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(src);
    audio.preload = "metadata";
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });
    audioRef.current = audio;
    return audio;
  }, [src]);

  // Changement de source (ré-enregistrement) : on repart de zéro.
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audioRef.current = null;
      }
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
  }, [src]);

  // Aiguille de lecture.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const step = () => {
      const audio = audioRef.current;
      if (audio) {
        const total = durationOf(audio);
        if (total > 0) {
          setProgress(Math.min(1, audio.currentTime / total));
          setCurrentTime(audio.currentTime);
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, durationOf]);

  const toggle = useCallback(() => {
    const audio = ensureAudio();
    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [ensureAudio]);

  const seek = useCallback(
    (fraction: number) => {
      const audio = ensureAudio();
      const total = durationOf(audio);
      if (total <= 0) return;
      const clamped = Math.min(1, Math.max(0, fraction));
      audio.currentTime = clamped * total;
      setProgress(clamped);
      setCurrentTime(clamped * total);
    },
    [ensureAudio, durationOf]
  );

  return {
    playing,
    progress,
    currentTime,
    duration: durationOf(audioRef.current),
    toggle,
    seek,
  };
}
