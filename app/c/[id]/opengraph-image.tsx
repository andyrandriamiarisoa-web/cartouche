import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCard } from "@/lib/server/store";
import { THEMES, type ThemeDef } from "@/lib/themes";
import { formatDateFr, formatDuration } from "@/lib/format";
import type { CardData } from "@/lib/types";
import { FALLBACK_TITLE } from "@/components/postcard/shared";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Carte postale sonore";

async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const data = await readFile(
      join(process.cwd(), "assets", "fonts", "Fraunces-SemiBoldItalic.ttf")
    );
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  } catch {
    return null;
  }
}

const GENERIC_CARD: CardData = {
  id: "carte",
  title: "Une carte postale sonore",
  message: "",
  location: "",
  theme: "riviera",
  createdAt: new Date(0).toISOString(),
  duration: 30,
  peaks: Array.from({ length: 72 }, (_, i) =>
    Math.round(Math.min(1, 0.2 + Math.abs(Math.sin(i * 0.3)) * 0.8) * 100) / 100
  ),
  audioUrl: "",
  version: 1,
};

function Decor({ theme }: { theme: ThemeDef }) {
  if (theme.decor === "sun") {
    return (
      <div style={{ display: "flex", position: "absolute", top: 44, left: 56 }}>
        <div
          style={{
            position: "absolute",
            top: -26,
            left: -26,
            width: 184,
            height: 184,
            borderRadius: 999,
            border: `5px solid ${theme.decorColor2}`,
            opacity: 0.55,
          }}
        />
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 999,
            background: theme.decorColor,
            opacity: 0.95,
          }}
        />
      </div>
    );
  }
  if (theme.decor === "dusk") {
    return (
      <div style={{ display: "flex", position: "absolute", top: 44, left: 56 }}>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 999,
            background: theme.decorColor,
            opacity: 0.92,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 52,
            left: -24,
            width: 200,
            height: 12,
            borderRadius: 8,
            background: theme.decorColor2,
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 92,
            left: -8,
            width: 172,
            height: 10,
            borderRadius: 8,
            background: theme.decorColor2,
            opacity: 0.45,
          }}
        />
      </div>
    );
  }
  if (theme.decor === "stars") {
    return (
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 400 }}>
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 64,
            width: 118,
            height: 118,
            borderRadius: 999,
            background: theme.decorColor,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 34,
            left: 96,
            width: 104,
            height: 104,
            borderRadius: 999,
            background: "#232E5C",
          }}
        />
        {[
          [260, 90, 8],
          [340, 52, 6],
          [430, 120, 7],
          [540, 60, 5],
          [660, 100, 8],
          [780, 48, 6],
          [900, 110, 7],
          [1020, 70, 5],
        ].map(([x, y, s], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: x,
              width: s,
              height: s,
              borderRadius: 999,
              background: theme.decorColor2,
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    );
  }
  // bunting
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 34,
            height: 34,
            transform: `rotate(45deg) translateY(${i % 2 === 0 ? 0 : 14}px)`,
            borderRadius: 8,
            background: i % 2 === 0 ? theme.decorColor : theme.decorColor2,
            opacity: 0.92,
          }}
        />
      ))}
    </div>
  );
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await getCard(id);
  const card = lookup.status === "found" ? lookup.card : GENERIC_CARD;
  const theme = THEMES[card.theme];
  const title = card.title || FALLBACK_TITLE;
  const fontData = await loadDisplayFont();

  const metaLine = [card.location, formatDateFr(card.createdAt)]
    .filter(Boolean)
    .join("  ·  ")
    .toUpperCase();

  const barCount = Math.min(card.peaks.length, 72);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: theme.paper,
          padding: 34,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: "relative",
            borderRadius: 30,
            background: theme.artGradient,
            padding: "52px 56px",
            overflow: "hidden",
          }}
        >
          <Decor theme={theme} />

          {/* Pastille durée */}
          <div
            style={{
              position: "absolute",
              top: 42,
              right: 48,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 26px",
              borderRadius: 999,
              background: "rgba(255, 253, 245, 0.22)",
              border: `2.5px solid ${theme.artInk}55`,
              color: theme.artInk,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" fill={theme.artInk} />
            </svg>
            {formatDuration(card.duration)}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: fontData ? "Fraunces" : undefined,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: title.length > 26 ? 58 : 74,
              lineHeight: 1.05,
              color: theme.artInk,
              marginBottom: 36,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {/* Forme d'onde */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 150,
            }}
          >
            {card.peaks.slice(0, barCount).map((peak, i) => (
              <div
                key={i}
                style={{
                  width: 9,
                  height: Math.max(peak, 0.07) * 150,
                  borderRadius: 5,
                  background: `linear-gradient(180deg, ${theme.waveFrom}, ${theme.waveTo})`,
                }}
              />
            ))}
          </div>

          {/* Ligne du bas */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 42,
            }}
          >
            <div
              style={{
                display: "flex",
                color: theme.artInk,
                opacity: 0.9,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 4,
              }}
            >
              {metaLine || "UNE CARTE POSTALE SONORE"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 30px",
                borderRadius: 999,
                background: theme.paper,
                color: theme.ink,
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              <svg width="42" height="28" viewBox="0 0 48 32" fill="none">
                <rect
                  x="1.75"
                  y="1.75"
                  width="44.5"
                  height="28.5"
                  rx="14.25"
                  stroke={theme.ink}
                  strokeWidth="3.4"
                />
                <rect x="12" y="12.5" width="3.4" height="7" rx="1.7" fill={theme.ink} />
                <rect x="18.2" y="8.5" width="3.4" height="15" rx="1.7" fill={theme.ink} />
                <rect x="24.4" y="10.5" width="3.4" height="11" rx="1.7" fill={theme.ink} />
                <rect x="30.6" y="7" width="3.4" height="18" rx="1.7" fill={theme.ink} />
                <rect x="36.8" y="12.5" width="3.4" height="7" rx="1.7" fill={theme.ink} />
              </svg>
              CARTOUCHE
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
      ...(fontData
        ? {
            fonts: [
              {
                name: "Fraunces",
                data: fontData,
                style: "italic" as const,
                weight: 600 as const,
              },
            ],
          }
        : {}),
    }
  );
}
