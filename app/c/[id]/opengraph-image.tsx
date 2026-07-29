import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCard } from "@/lib/server/store";
import { THEMES } from "@/lib/themes";
import { formatDateFr, formatDuration } from "@/lib/format";
import { PHOTO_ASPECT, type CardData } from "@/lib/types";
import { decorGlyphs } from "@/components/postcard/decors";
import { FALLBACK_TITLE } from "@/components/postcard/shared";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Carte postale sonore";

const PAD = 34;
const ART_W = size.width - PAD * 2;
const ART_H = size.height - PAD * 2;

/**
 * Satori écarte un SVG plus grand que la boîte de contenu de son parent : la
 * zone illustrée n'a donc aucun padding (il est porté par le calque de texte),
 * et le décor est découpé via le viewBox plutôt qu'agrandi. Le viewBox garde
 * exactement le ratio du cadre, ce qui évite toute déformation.
 */
const DECOR_VB_H = (300 * ART_H) / ART_W;
const DECOR_VB_Y = 26;
/** La photo est toujours ré-encodée en 4:3 : on la recadre en « cover ». */
const PHOTO_H = Math.round(ART_W / PHOTO_ASPECT);
const PHOTO_TOP = Math.round((ART_H - PHOTO_H) / 2);

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

/** La photo doit être embarquée en data URI : satori ne charge pas d'URL relative. */
async function loadPhoto(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    if (url.startsWith("/")) {
      const data = await readFile(join(process.cwd(), "public", url));
      const type = url.endsWith(".png") ? "image/png" : "image/jpeg";
      return `data:${type};base64,${data.toString("base64")}`;
    }
    if (!url.startsWith("https://")) return null;
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > 6_000_000) return null;
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
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

  const [fontData, photo] = await Promise.all([
    loadDisplayFont(),
    loadPhoto(card.photoUrl),
  ]);

  const artInk = photo ? "#FFFFFF" : theme.artInk;
  const waveFrom = photo ? "#FFFFFF" : theme.waveFrom;
  const waveTo = photo ? "#FFE9B3" : theme.waveTo;

  const metaLine = [card.location, formatDateFr(card.createdAt)]
    .filter(Boolean)
    .join("  ·  ")
    .toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: theme.paper,
          padding: PAD,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: ART_W,
            height: ART_H,
            borderRadius: 30,
            background: theme.artGradient,
            overflow: "hidden",
          }}
        >
          {photo ? (
            <>
              <img
                src={photo}
                alt=""
                width={ART_W}
                height={PHOTO_H}
                style={{ position: "absolute", top: PHOTO_TOP, left: 0 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: ART_W,
                  height: ART_H,
                  background:
                    "linear-gradient(to top, rgba(10,8,6,0.74) 0%, rgba(10,8,6,0.42) 28%, rgba(10,8,6,0.06) 58%, rgba(10,8,6,0.3) 100%)",
                }}
              />
            </>
          ) : (
            <svg
              viewBox={`0 ${DECOR_VB_Y} 300 ${DECOR_VB_H}`}
              width={ART_W}
              height={ART_H}
              style={{ position: "absolute", left: 0, top: 0 }}
            >
              {decorGlyphs(theme)}
            </svg>
          )}

          {/* Calque de texte : c'est lui qui porte les marges intérieures. */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              width: ART_W,
              height: ART_H,
              padding: "52px 56px",
            }}
          >
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
              background: photo ? "rgba(12,10,8,0.34)" : "rgba(255, 253, 245, 0.22)",
              border: `2.5px solid ${photo ? "rgba(255,255,255,0.42)" : `${theme.artInk}55`}`,
              color: artInk,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" fill={artInk} />
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
              color: artInk,
              marginBottom: 36,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {/* Forme d'onde */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, height: 150 }}>
            {card.peaks.slice(0, 72).map((peak, i) => (
              <div
                key={i}
                style={{
                  width: 9,
                  height: Math.max(peak, 0.07) * 150,
                  borderRadius: 5,
                  background: `linear-gradient(180deg, ${waveFrom}, ${waveTo})`,
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
                color: artInk,
                opacity: 0.92,
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
