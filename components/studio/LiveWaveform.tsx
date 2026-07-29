"use client";

import { useEffect, useRef } from "react";

interface LiveWaveformProps {
  analyser: AnalyserNode | null;
  active: boolean;
}

/** Barres défilantes façon mémo vocal, dessinées depuis l'AnalyserNode. */
export function LiveWaveform({ analyser, active }: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!active || !analyser) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      barsRef.current = [];
      return;
    }

    const data = new Float32Array(analyser.fftSize);
    let raf = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
      }

      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      barsRef.current.push(Math.min(1, rms * 3.4));

      const W = canvas.width;
      const H = canvas.height;
      const barWidth = 4 * dpr;
      const gap = 3 * dpr;
      const maxBars = Math.max(8, Math.floor(W / (barWidth + gap)));
      if (barsRef.current.length > maxBars) {
        barsRef.current.splice(0, barsRef.current.length - maxBars);
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = getComputedStyle(canvas).color;
      const bars = barsRef.current;
      for (let i = 0; i < bars.length; i++) {
        const height = Math.max(2.5 * dpr, bars[i] * H * 0.9);
        const x = W - (bars.length - i) * (barWidth + gap);
        const y = (H - height) / 2;
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, height, barWidth / 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth, height);
        }
      }
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [analyser, active]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full text-accent"
      aria-hidden
    />
  );
}
