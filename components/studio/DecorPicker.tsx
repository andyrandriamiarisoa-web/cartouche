"use client";

import { Check } from "lucide-react";
import { THEMES, themesByFamily, type ThemeId } from "@/lib/themes";
import { decorGlyphs } from "@/components/postcard/decors";

interface DecorPickerProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
  /** Une photo est active : le décor ne sert plus que de papeterie. */
  mutedByPhoto?: boolean;
}

/** Grille des décors, groupés par famille et rendus avec leur vraie illustration. */
export function DecorPicker({ value, onChange, mutedByPhoto = false }: DecorPickerProps) {
  return (
    <div className="decor-scroll" role="group" aria-label="Choix du décor">
      {themesByFamily().map(({ family, themes }) => (
        <div key={family}>
          <p className="decor-family">{family}</p>
          <div className="decor-grid">
            {themes.map((theme) => {
              const selected = value === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className="decor-tile"
                  aria-pressed={selected}
                  title={`${theme.name} — ${theme.tagline}`}
                  onClick={() => onChange(theme.id)}
                >
                  <span
                    className="decor-swatch"
                    style={{
                      background: theme.artGradient,
                      opacity: mutedByPhoto && !selected ? 0.55 : 1,
                    }}
                  >
                    <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
                      {decorGlyphs(theme)}
                    </svg>
                  </span>
                  {selected && (
                    <span className="decor-check" aria-hidden>
                      <Check className="h-3 w-3" strokeWidth={3.4} />
                    </span>
                  )}
                  <span className="decor-name">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function themeName(id: ThemeId): string {
  return THEMES[id].name;
}
