import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCard, readCardMediaBytes } from "@/lib/server/store";
import { THEMES } from "@/lib/themes";
import { formatDateFr, formatDuration } from "@/lib/format";
import { PHOTO_ASPECT, type CardData } from "@/lib/types";
import { decorGlyphs } from "@/components/postcard/decors";
import { FALLBACK_TITLE } from "@/components/postcard/shared";
import {
  ART_SIZE,
  CONTENT_PAD,
  FOOTER_H,
  FOOTER_Y,
  FRAME_PAD,
  FRAME_SIZE,
  TITLE_BOTTOM,
} from "@/lib/video/layout";

export const runtime = "nodejs";

/**
 * Fond de la vidéo : la carte, sans sa forme d'onde. La bande que `WAVE_RECT`
 * réserve est laissée vide — c'est le navigateur qui l'anime, image par image.
 *
 * Le rendu passe par satori, comme l'image de partage : décors, photo et
 * typographie sont donc rigoureusement les mêmes qu'ailleurs, sans qu'aucun
 * catalogue ne soit dupliqué côté client.
 */

const CONTENT_X = FRAME_PAD + CONTENT_PAD;
const CONTENT_W = ART_SIZE - CONTENT_PAD * 2;

/**
 * Les décors sont dessinés dans un espace 300×200, pensé pour une carte
 * paysage. En format carré on les laisse à leurs proportions, calés en haut :
 * les recadrer les amputerait (le soleil est en haut à droite), et les étirer
 * serait pire. Le dégradé occupe le bas, là où viennent le titre et l'onde.
 */
const DECOR_W = 300;
const DECOR_H = 200;
const DECOR_RENDER_H = Math.round((ART_SIZE * DECOR_H) / DECOR_W);

/**
 * La photo est en 4:3, le cadre est carré : on la fait déborder sur les côtés
 * plutôt que de la poser entre deux bandes. Elle remplit, on ne voit qu'elle.
 */
const PHOTO_W = Math.round(ART_SIZE * PHOTO_ASPECT);
const PHOTO_LEFT = Math.round((ART_SIZE - PHOTO_W) / 2);

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

async function loadPhoto(card: CardData): Promise<string | null> {
  if (!card.photoUrl) return null;
  try {
    if (card.photoUrl.startsWith("/demo/")) {
      const data = await readFile(join(process.cwd(), "public", card.photoUrl));
      const type = card.photoUrl.endsWith(".png") ? "image/png" : "image/jpeg";
      return `data:${type};base64,${data.toString("base64")}`;
    }
    const bytes = await readCardMediaBytes(card.id, "photo");
    if (!bytes || bytes.byteLength > 6_000_000) return null;
    return `data:image/jpeg;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lookup = await getCard(id);
  if (lookup.status !== "found") {
    return new Response(null, { status: 404 });
  }

  const card = lookup.card;
  const theme = THEMES[card.theme];
  const title = card.title || FALLBACK_TITLE;

  const [fontData, photo] = await Promise.all([loadDisplayFont(), loadPhoto(card)]);

  const artInk = photo ? "#FFFFFF" : theme.artInk;
  const metaLine = [card.location, formatDateFr(card.createdAt)]
    .filter(Boolean)
    .join("  ·  ")
    .toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: FRAME_SIZE,
          height: FRAME_SIZE,
          display: "flex",
          background: theme.paper,
        }}
      >
        {/* Illustration */}
        <div
          style={{
            position: "absolute",
            top: FRAME_PAD,
            left: FRAME_PAD,
            width: ART_SIZE,
            height: ART_SIZE,
            display: "flex",
            borderRadius: 26,
            background: theme.artGradient,
            overflow: "hidden",
          }}
        >
          {photo ? (
            <>
              {/* satori ne connaît pas `next/image` : l'élément brut est la seule
                  option, comme dans l'image de partage. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                width={PHOTO_W}
                height={ART_SIZE}
                style={{ position: "absolute", top: 0, left: PHOTO_LEFT }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: ART_SIZE,
                  height: ART_SIZE,
                  background:
                    "linear-gradient(to top, rgba(10,8,6,0.78) 0%, rgba(10,8,6,0.44) 34%, rgba(10,8,6,0.06) 62%, rgba(10,8,6,0.3) 100%)",
                }}
              />
            </>
          ) : (
            <svg
              viewBox={`0 0 ${DECOR_W} ${DECOR_H}`}
              width={ART_SIZE}
              height={DECOR_RENDER_H}
              style={{ position: "absolute", left: 0, top: 0 }}
            >
              {decorGlyphs(theme)}
            </svg>
          )}
        </div>

        {/* Pastille durée */}
        <div
          style={{
            position: "absolute",
            top: CONTENT_X,
            right: CONTENT_X,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 999,
            background: photo ? "rgba(12,10,8,0.34)" : "rgba(255, 253, 245, 0.22)",
            border: `2px solid ${photo ? "rgba(255,255,255,0.42)" : `${theme.artInk}55`}`,
            color: artInk,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" fill={artInk} />
          </svg>
          {formatDuration(card.duration)}
        </div>

        {/* Titre, calé sur le haut de la bande d'onde */}
        <div
          style={{
            position: "absolute",
            left: CONTENT_X,
            bottom: TITLE_BOTTOM,
            width: CONTENT_W,
            display: "flex",
            fontFamily: fontData ? "Fraunces" : undefined,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: title.length > 26 ? 40 : 52,
            lineHeight: 1.08,
            color: artInk,
          }}
        >
          {title}
        </div>

        {/* La bande d'onde reste vide : c'est le navigateur qui la remplit. */}

        {/* Ligne du bas */}
        <div
          style={{
            position: "absolute",
            left: CONTENT_X,
            top: FOOTER_Y,
            width: CONTENT_W,
            height: FOOTER_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              color: artInk,
              opacity: 0.92,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2.5,
            }}
          >
            {metaLine || "UNE CARTE POSTALE SONORE"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 18px",
              borderRadius: 999,
              background: theme.paper,
              color: theme.ink,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 1.4,
            }}
          >
            <svg width="27" height="18" viewBox="0 0 48 32" fill="none">
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
    ),
    {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
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
