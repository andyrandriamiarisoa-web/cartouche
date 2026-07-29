"use client";

import { THEMES } from "@/lib/themes";
import { formatDuration, formatPostmarkDate } from "@/lib/format";
import { CartoucheGlyph } from "@/components/Logo";
import { safeImageUrl, type CardFace } from "@/components/postcard/shared";

/** Verso : message manuscrit, timbre, cachet de la poste et lignes d'adresse. */
export function PostcardBack({ card }: { card: CardFace }) {
  const theme = THEMES[card.theme];
  const photo = safeImageUrl(card.photoUrl);

  return (
    <div className="pc-back-inner">
      <div className="pc-back-head">
        <span className="pc-back-title">Carte postale sonore</span>
        <div className="pc-stamp" aria-hidden>
          <div className={`pc-stamp-art${photo ? " pc-stamp-art--photo" : ""}`}>
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pc-stamp-photo" src={photo} alt="" />
                <span className="pc-stamp-value pc-stamp-value--onphoto">
                  {formatDuration(card.duration)}
                </span>
              </>
            ) : (
              <>
                <CartoucheGlyph className="text-current" />
                <span className="pc-stamp-value">{formatDuration(card.duration)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pc-postmark" aria-hidden>
        <span className="pc-postmark-city">{card.location || "Quelque part"}</span>
        <span className="pc-postmark-date">{formatPostmarkDate(card.createdAt)}</span>
        <span className="pc-postmark-waves">
          <i style={{ width: "100%" }} />
          <i style={{ width: "72%", marginInline: "auto" }} />
          <i style={{ width: "44%", marginInline: "auto" }} />
        </span>
      </div>

      <div className="pc-back-cols">
        <p className="pc-message">
          {card.message || "Un instant à écouter, rien que pour vous."}
          {!(card.message ?? "").includes("♥") && (
            <span
              className="block pt-[1.5cqw] text-[4.2cqw]"
              style={{ color: theme.inkSoft }}
            >
              ♥
            </span>
          )}
        </p>
        <div className="pc-divider" aria-hidden />
        <div className="pc-address" aria-hidden>
          <p className="pc-address-to">Pour vous,</p>
          <span className="pc-address-line" />
          <span className="pc-address-line" />
          <span className="pc-address-line" style={{ width: "72%" }} />
        </div>
      </div>
    </div>
  );
}
