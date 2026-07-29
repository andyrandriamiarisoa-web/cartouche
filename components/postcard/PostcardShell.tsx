import type { ReactNode } from "react";
import { THEMES, type ThemeId } from "@/lib/themes";
import { themeVars } from "@/components/postcard/shared";

interface PostcardShellProps {
  theme: ThemeId;
  front: ReactNode;
  back?: ReactNode;
  flipped?: boolean;
  className?: string;
  /** Éléments flottants au-dessus de la carte (bouton verso, tampon…). */
  overlay?: ReactNode;
}

/** Scène 3D d'une carte : gère le thème et la rotation recto/verso. */
export function PostcardShell({
  theme,
  front,
  back,
  flipped = false,
  className,
  overlay,
}: PostcardShellProps) {
  return (
    <div
      className={`pc-scene ${className ?? ""}`}
      data-flipped={flipped ? "true" : "false"}
      style={themeVars(THEMES[theme])}
    >
      <div className="pc">
        <div className="pc-face">{front}</div>
        {back && <div className="pc-face pc-face--back">{back}</div>}
      </div>
      {overlay}
    </div>
  );
}
