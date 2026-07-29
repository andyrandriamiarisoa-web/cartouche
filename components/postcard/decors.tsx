import type { ReactNode } from "react";
import type { ThemeDef } from "@/lib/themes";

/**
 * Illustrations des décors, dessinées dans un repère 300×200.
 *
 * Ce module est volontairement sans état ni hook : il est rendu à la fois
 * dans le navigateur (carte, sélecteur du studio) et côté serveur par
 * `next/og` pour l'image de partage. On s'y limite donc aux primitives SVG
 * les plus universelles (path, circle, rect, ellipse) sans dégradé ni masque.
 */

const W = 300;

/** Positions pseudo-aléatoires mais déterministes (mêmes valeurs au serveur et au client). */
function scatter(count: number, seed: number): Array<{ x: number; y: number; t: number }> {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const b = Math.sin((i + 1) * 78.233 * seed) * 43758.5453;
    const c = Math.sin((i + 1) * 39.425 * seed) * 43758.5453;
    return {
      x: a - Math.floor(a),
      y: b - Math.floor(b),
      t: c - Math.floor(c),
    };
  });
}

function heartPath(cx: number, cy: number, s: number): string {
  return `M${cx} ${cy + s * 0.72}C${cx - s * 1.25} ${cy - s * 0.1} ${cx - s * 0.62} ${cy - s} ${cx} ${cy - s * 0.4}C${cx + s * 0.62} ${cy - s} ${cx + s * 1.25} ${cy - s * 0.1} ${cx} ${cy + s * 0.72}Z`;
}

function starPath(cx: number, cy: number, s: number): string {
  return `M${cx} ${cy - s}L${cx + s * 0.28} ${cy - s * 0.28}L${cx + s} ${cy}L${cx + s * 0.28} ${cy + s * 0.28}L${cx} ${cy + s}L${cx - s * 0.28} ${cy + s * 0.28}L${cx - s} ${cy}L${cx - s * 0.28} ${cy - s * 0.28}Z`;
}

/* -------------------------------------------------------------------------- */
/*                                  Décors                                    */
/* -------------------------------------------------------------------------- */

function sunDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <circle cx="231" cy="54" r="25" fill={c1} opacity="0.95" />
      <circle
        cx="231"
        cy="54"
        r="37"
        fill="none"
        stroke={c2}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="0.5 9.5"
        opacity="0.9"
      />
      <path d="M44 62 q6 -7 12 0 q6 -7 12 0" fill="none" stroke={c1} strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
      <path d="M78 44 q5 -6 10 0 q5 -6 10 0" fill="none" stroke={c1} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
    </g>
  );
}

function wavesDecor({ c1, c2 }: Colors) {
  const rows = [40, 66, 92, 118, 144];
  return (
    <g fill="none" strokeLinecap="round">
      {rows.map((y, i) => (
        <path
          key={y}
          d={`M-10 ${y} q 25 -11 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0`}
          stroke={i % 2 === 0 ? c1 : c2}
          strokeWidth={2.6 - i * 0.25}
          opacity={0.62 - i * 0.08}
        />
      ))}
      <circle cx="248" cy="34" r="16" fill={c1} opacity="0.5" />
    </g>
  );
}

function lighthouseDecor({ c1, c2 }: Colors) {
  return (
    <g>
      {/* faisceaux */}
      <path d="M232 58 L110 30 L110 86 Z" fill={c1} opacity="0.34" />
      <path d="M232 58 L120 52 L120 74 Z" fill={c1} opacity="0.26" />
      {/* tour */}
      <path d="M224 62 L240 62 L246 150 L218 150 Z" fill={c1} opacity="0.95" />
      <path d="M226 82 L238 82 L240 100 L224 100 Z" fill={c2} opacity="0.9" />
      <path d="M229 116 L235 116 L236 134 L228 134 Z" fill={c2} opacity="0.9" />
      <rect x="220" y="52" width="24" height="9" rx="3" fill={c1} />
      <circle cx="232" cy="44" r="6" fill={c2} opacity="0.95" />
      {/* mer */}
      <path d="M-10 156 q 30 -8 60 0 t 60 0 t 60 0 t 60 0 t 60 0" fill="none" stroke={c1} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
    </g>
  );
}

function dunesDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <circle cx="72" cy="46" r="21" fill={c1} opacity="0.9" />
      <path d="M-10 128 q 60 -34 120 -6 t 120 -14 l 80 0 0 100 -330 0 Z" fill={c1} opacity="0.34" />
      <path d="M-10 156 q 70 -28 150 -4 t 170 -12 l 0 80 -330 0 Z" fill={c2} opacity="0.2" />
      {/* touffes d'oyats */}
      {[38, 52, 250, 264].map((x, i) => (
        <path
          key={x}
          d={`M${x} 150 q -5 -14 -9 -20 M${x} 150 q 1 -16 0 -22 M${x} 150 q 6 -13 11 -19`}
          fill="none"
          stroke={c2}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={i % 2 === 0 ? 0.55 : 0.4}
        />
      ))}
    </g>
  );
}

function duskDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <circle cx="236" cy="70" r="34" fill={c1} opacity="0.9" />
      <rect x="192" y="58" width="88" height="5" rx="2.5" fill={c2} opacity="0.55" />
      <rect x="200" y="74" width="80" height="5" rx="2.5" fill={c2} opacity="0.45" />
      <rect x="210" y="90" width="70" height="4" rx="2" fill={c2} opacity="0.35" />
      <path d="M52 52 q5 -6 10 0 q5 -6 10 0" fill="none" stroke={c1} strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
      <path d="M34 70 q4 -5 8 0 q4 -5 8 0" fill="none" stroke={c1} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

const STARS: Array<[number, number, number]> = [
  [36, 38, 1.8], [72, 24, 1.3], [108, 52, 1.6], [140, 20, 1.2], [170, 44, 1.9],
  [60, 74, 1.2], [126, 84, 1.4], [22, 108, 1.5], [88, 118, 1.2], [158, 112, 1.6],
  [196, 92, 1.2], [262, 118, 1.5],
];

function starsDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <circle cx="228" cy="52" r="23" fill={c1} />
      <circle cx="237" cy="45" r="20" fill="#232E5C" />
      <path d={starPath(186, 38, 8)} fill={c2} opacity="0.95" />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c2} opacity={0.5 + (i % 3) * 0.2} />
      ))}
    </g>
  );
}

function cloud(
  key: string,
  { x, y, s, fill, opacity }: { x: number; y: number; s: number; fill: string; opacity: number }
) {
  return (
    <g key={key} fill={fill} opacity={opacity}>
      <circle cx={x} cy={y} r={13 * s} />
      <circle cx={x + 15 * s} cy={y - 7 * s} r={17 * s} />
      <circle cx={x + 34 * s} cy={y} r={12 * s} />
      <rect x={x - 13 * s} y={y} width={47 * s} height={13 * s} rx={6 * s} />
    </g>
  );
}

function cloudsDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <circle cx="252" cy="38" r="18" fill={c2} opacity="0.85" />
      {cloud("c40", { x: 40, y: 54, s: 1.15, fill: c1, opacity: 0.92 })}
      {cloud("c168", { x: 168, y: 38, s: 0.85, fill: c1, opacity: 0.75 })}
      {cloud("c96", { x: 96, y: 112, s: 0.7, fill: c1, opacity: 0.55 })}
      {cloud("c224", { x: 224, y: 104, s: 0.6, fill: c1, opacity: 0.45 })}
    </g>
  );
}

function auroraDecor({ c1, c2 }: Colors) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M-10 96 q 60 -70 120 -22 t 130 -34 l 70 0" stroke={c1} strokeWidth="16" opacity="0.3" />
      <path d="M-10 116 q 70 -66 140 -18 t 120 -30 l 60 0" stroke={c2} strokeWidth="11" opacity="0.28" />
      <path d="M-10 78 q 55 -54 110 -14 t 140 -26 l 70 0" stroke={c1} strokeWidth="7" opacity="0.4" />
      {scatter(14, 3.1).map((p, i) => (
        <circle
          key={i}
          cx={p.x * W}
          cy={20 + p.y * 60}
          r={0.9 + p.t * 1.2}
          fill="#FFFFFF"
          stroke="none"
          opacity={0.35 + p.t * 0.45}
        />
      ))}
    </g>
  );
}

const RAINBOW_BANDS = ["#E4552F", "#F0A33C", "#F2D45C", "#63B36A", "#4C9BD6", "#8A6BC0"];

function rainbowDecor({ c1, c2 }: Colors) {
  return (
    <g fill="none">
      {RAINBOW_BANDS.map((color, i) => (
        <path
          key={color}
          d={`M-6 ${186} a ${112 - i * 11} ${112 - i * 11} 0 0 1 ${(112 - i * 11) * 2} 0`}
          stroke={color}
          strokeWidth="9"
          opacity="0.65"
        />
      ))}
      {cloud("c210", { x: 210, y: 62, s: 0.85, fill: "#FFFFFF", opacity: 0.8 })}
      <circle cx="272" cy="40" r="13" fill={c1} stroke="none" opacity="0.5" />
      <circle cx="60" cy="34" r="4" fill={c2} stroke="none" opacity="0.4" />
    </g>
  );
}

function rainDecor({ c1, c2 }: Colors) {
  const drops = scatter(30, 5.7);
  return (
    <g strokeLinecap="round">
      {drops.map((p, i) => {
        const x = p.x * (W + 40) - 20;
        const y = p.y * 150;
        const len = 9 + p.t * 12;
        return (
          <path
            key={i}
            d={`M${x} ${y} l -5 ${len}`}
            stroke={i % 3 === 0 ? c1 : c2}
            strokeWidth={1.5 + p.t}
            opacity={0.3 + p.t * 0.45}
            fill="none"
          />
        );
      })}
      {[46, 130, 216].map((x, i) => (
        <ellipse
          key={x}
          cx={x}
          cy={172 - i * 4}
          rx={16 + i * 4}
          ry="3.4"
          fill="none"
          stroke={c1}
          strokeWidth="1.6"
          opacity="0.4"
        />
      ))}
    </g>
  );
}

function pinesDecor({ c1, c2 }: Colors) {
  const trees = [
    [18, 150, 1.15], [46, 150, 0.85], [72, 150, 1.35], [104, 150, 0.95],
    [132, 150, 1.2], [162, 150, 0.8], [188, 150, 1.1], [218, 150, 0.9],
    [248, 150, 1.25], [278, 150, 0.95],
  ] as const;
  return (
    <g>
      <circle cx="228" cy="42" r="17" fill={c2} opacity="0.85" />
      {trees.map(([x, base, s], i) => {
        const h = 60 * s;
        const w = 15 * s;
        return (
          <path
            key={i}
            d={`M${x} ${base - h} L${x + w} ${base} L${x - w} ${base} Z M${x} ${base - h * 1.3} L${x + w * 0.72} ${base - h * 0.44} L${x - w * 0.72} ${base - h * 0.44} Z`}
            fill={c1}
            opacity={0.55 + (i % 3) * 0.15}
          />
        );
      })}
    </g>
  );
}

function peaksDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <circle cx="66" cy="44" r="15" fill={c1} opacity="0.7" />
      <path d="M-10 168 L70 74 L124 138 L168 92 L250 168 Z" fill={c2} opacity="0.45" />
      <path d="M70 74 L96 105 L84 111 L70 104 L56 111 L44 105 Z" fill={c1} opacity="0.95" />
      <path d="M168 92 L188 116 L178 121 L168 115 L157 121 L148 116 Z" fill={c1} opacity="0.9" />
      <path d="M120 176 L206 96 L300 176 Z" fill={c2} opacity="0.3" />
    </g>
  );
}

function lavenderDecor({ c1, c2 }: Colors) {
  const rows = [0, 1, 2, 3];
  return (
    <g>
      <circle cx="246" cy="40" r="16" fill={c2} opacity="0.8" />
      {rows.map((r) => {
        const y = 96 + r * 22;
        const count = 12 + r * 2;
        const size = 3.4 + r * 0.9;
        return (
          <g key={r} opacity={0.35 + r * 0.16}>
            {Array.from({ length: count }, (_, i) => {
              const x = (i + 0.5) * (W / count);
              return (
                <g key={i}>
                  <path d={`M${x} ${y + size * 3} L${x} ${y}`} stroke={c1} strokeWidth={size * 0.34} strokeLinecap="round" fill="none" />
                  <ellipse cx={x} cy={y - size * 0.6} rx={size * 0.62} ry={size * 1.5} fill={c1} />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

function meadowDecor({ c1, c2 }: Colors) {
  const blades = scatter(34, 7.3);
  return (
    <g>
      <circle cx="240" cy="40" r="18" fill={c2} opacity="0.75" />
      {blades.map((p, i) => {
        const x = p.x * W;
        const h = 22 + p.t * 40;
        const bend = (p.y - 0.5) * 16;
        return (
          <path
            key={i}
            d={`M${x} 180 q ${bend} ${-h * 0.6} ${bend * 1.6} ${-h}`}
            stroke={c1}
            strokeWidth={1.6 + p.t}
            strokeLinecap="round"
            fill="none"
            opacity={0.35 + p.t * 0.4}
          />
        );
      })}
      {[[54, 120], [128, 134], [196, 118], [268, 138]].map(([x, y], i) => (
        <g key={i} opacity="0.85">
          {[0, 72, 144, 216, 288].map((a) => {
            const rad = (a * Math.PI) / 180;
            return <circle key={a} cx={x + Math.cos(rad) * 4.4} cy={y + Math.sin(rad) * 4.4} r="2.7" fill={c2} />;
          })}
          <circle cx={x} cy={y} r="2.2" fill={c1} />
        </g>
      ))}
    </g>
  );
}

function leavesDecor({ c1, c2 }: Colors) {
  const leaves = scatter(16, 9.1);
  return (
    <g>
      {leaves.map((p, i) => {
        const x = p.x * W;
        const y = 14 + p.y * 150;
        const s = 5 + p.t * 6;
        const rot = Math.round(p.t * 360);
        return (
          <g key={i} transform={`rotate(${rot} ${x} ${y})`} opacity={0.45 + p.t * 0.45}>
            <path
              d={`M${x} ${y - s} q ${s} ${s * 0.7} 0 ${s * 2} q ${-s} ${-s * 0.7} 0 ${-s * 2} Z`}
              fill={i % 3 === 0 ? c2 : c1}
            />
            <path d={`M${x} ${y - s} L${x} ${y + s}`} stroke={c2} strokeWidth="0.6" opacity="0.5" fill="none" />
          </g>
        );
      })}
    </g>
  );
}

function snowflake(
  key: number,
  { x, y, s, color, opacity }: { x: number; y: number; s: number; color: string; opacity: number }
) {
  return (
    <g key={key} stroke={color} strokeWidth={s * 0.2} strokeLinecap="round" opacity={opacity} fill="none">
      <path d={`M${x} ${y - s} L${x} ${y + s}`} />
      <path d={`M${x - s * 0.87} ${y - s * 0.5} L${x + s * 0.87} ${y + s * 0.5}`} />
      <path d={`M${x - s * 0.87} ${y + s * 0.5} L${x + s * 0.87} ${y - s * 0.5}`} />
    </g>
  );
}

function snowDecor({ c1, c2 }: Colors) {
  const flakes = scatter(22, 11.4);
  return (
    <g>
      {flakes.map((p, i) => (
        snowflake(i, {
          x: p.x * W,
          y: 10 + p.y * 160,
          s: 3 + p.t * 6,
          color: i % 4 === 0 ? c2 : c1,
          opacity: 0.45 + p.t * 0.5,
        })
      ))}
      <path d="M-10 178 q 60 -22 130 -6 t 190 -10 l 0 60 -330 0 Z" fill={c1} opacity="0.75" />
    </g>
  );
}

function blossomDecor({ c1, c2 }: Colors) {
  const petals = scatter(18, 13.7);
  return (
    <g>
      {/* branche */}
      <path d="M-6 44 q 70 26 128 12 t 120 -18" fill="none" stroke={c2} strokeWidth="3.2" strokeLinecap="round" opacity="0.75" />
      <path d="M96 52 q 18 22 22 44" fill="none" stroke={c2} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
      {[[38, 48], [78, 58], [122, 58], [166, 50], [210, 40], [118, 96], [252, 66]].map(([x, y], i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a) => {
            const rad = (a * Math.PI) / 180;
            return <ellipse key={a} cx={x + Math.cos(rad) * 5.2} cy={y + Math.sin(rad) * 5.2} rx="4.2" ry="3.2" fill={c1} opacity="0.95" />;
          })}
          <circle cx={x} cy={y} r="2.4" fill={c2} opacity="0.8" />
        </g>
      ))}
      {petals.map((p, i) => (
        <ellipse
          key={i}
          cx={p.x * W}
          cy={70 + p.y * 110}
          rx={3 + p.t * 2}
          ry={2 + p.t * 1.4}
          fill={c1}
          opacity={0.35 + p.t * 0.4}
        />
      ))}
    </g>
  );
}

function foliageDecor({ c1, c2 }: Colors) {
  const leaf = (key: string, x: number, y: number, s: number, rot: number, fill: string, opacity: number) => (
    <g key={key} transform={`rotate(${rot} ${x} ${y})`} opacity={opacity}>
      <path d={`M${x} ${y} q ${s * 0.9} ${-s * 0.9} ${s * 1.9} 0 q ${-s * 0.9} ${s * 0.9} ${-s * 1.9} 0 Z`} fill={fill} />
      <path d={`M${x} ${y} L${x + s * 1.9} ${y}`} stroke={c2} strokeWidth={s * 0.06} opacity="0.5" fill="none" />
    </g>
  );
  return (
    <g>
      {/* tiges */}
      <path d="M-6 40 q 54 26 78 74" fill="none" stroke={c1} strokeWidth="2.4" opacity="0.4" />
      <path d="M304 34 q -58 30 -84 78" fill="none" stroke={c1} strokeWidth="2.4" opacity="0.35" />
      <path d="M150 190 q 6 -44 -8 -70" fill="none" stroke={c1} strokeWidth="2" opacity="0.3" />
      {leaf("a", -8, 44, 26, 16, c1, 0.55)}
      {leaf("b", 14, 78, 22, 48, c2, 0.4)}
      {leaf("c", 46, 118, 19, 22, c1, 0.34)}
      {leaf("d", 236, 40, 25, -24, c1, 0.5)}
      {leaf("e", 258, 76, 21, 8, c2, 0.38)}
      {leaf("f", 222, 116, 18, -40, c1, 0.32)}
      {leaf("g", 108, 62, 20, 62, c2, 0.3)}
      {leaf("h", 142, 128, 22, -18, c1, 0.3)}
      {leaf("i", 176, 84, 17, 34, c2, 0.28)}
    </g>
  );
}

const FLAGS: Array<[number, number]> = [
  [26, 34], [62, 41], [98, 43], [134, 40], [170, 34], [206, 31], [242, 34], [274, 39],
];

function buntingDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <path d="M-4 24 Q 74 48 150 34 T 304 22" fill="none" stroke={c1} strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
      {FLAGS.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + 15} Z`}
          fill={i % 2 === 0 ? c1 : c2}
          opacity={i % 2 === 0 ? 0.95 : 0.9}
        />
      ))}
      <circle cx="52" cy="84" r="2.4" fill={c1} opacity="0.5" />
      <circle cx="216" cy="72" r="2" fill={c1} opacity="0.4" />
      <circle cx="150" cy="66" r="1.8" fill={c1} opacity="0.45" />
    </g>
  );
}

function balloonsDecor({ c1, c2 }: Colors) {
  const set = [
    [48, 52, 1.1, c1], [92, 34, 0.85, c2], [214, 44, 1, c2], [258, 62, 0.8, c1],
  ] as const;
  return (
    <g>
      {set.map(([x, y, s, color], i) => (
        <g key={i} opacity={0.9}>
          <ellipse cx={x} cy={y} rx={15 * s} ry={18 * s} fill={color as string} />
          <path d={`M${x} ${y + 18 * s} l -3 4 6 0 Z`} fill={color as string} />
          <path
            d={`M${x} ${y + 22 * s} q ${i % 2 === 0 ? 10 : -10} ${22 * s} 0 ${44 * s}`}
            fill="none"
            stroke={color as string}
            strokeWidth="1.3"
            opacity="0.6"
          />
        </g>
      ))}
      {scatter(10, 17.2).map((p, i) => (
        <circle key={i} cx={p.x * W} cy={100 + p.y * 70} r={1.4 + p.t * 1.8} fill={i % 2 ? c1 : c2} opacity={0.35 + p.t * 0.3} />
      ))}
    </g>
  );
}

function confettiDecor({ c1, c2 }: Colors) {
  const bits = scatter(38, 19.4);
  const palette = [c1, c2, "#F2C744", "#63B36A"];
  return (
    <g>
      {bits.map((p, i) => {
        const x = p.x * W;
        const y = 6 + p.y * 165;
        const color = palette[i % palette.length];
        if (i % 3 === 0) {
          return <circle key={i} cx={x} cy={y} r={1.8 + p.t * 2} fill={color} opacity={0.4 + p.t * 0.5} />;
        }
        const w = 4 + p.t * 5;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={w * 0.5}
            rx="1"
            fill={color}
            opacity={0.4 + p.t * 0.5}
            transform={`rotate(${Math.round(p.t * 180)} ${x} ${y})`}
          />
        );
      })}
      <path d="M-6 20 q 26 22 54 4" fill="none" stroke={c1} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
      <path d="M300 30 q -28 20 -56 2" fill="none" stroke={c2} strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
    </g>
  );
}

function heartsDecor({ c1, c2 }: Colors) {
  const items = scatter(16, 23.6);
  return (
    <g>
      {items.map((p, i) => (
        <path
          key={i}
          d={heartPath(p.x * W, 12 + p.y * 150, 5 + p.t * 8)}
          fill={i % 3 === 0 ? c2 : c1}
          opacity={0.4 + p.t * 0.5}
        />
      ))}
    </g>
  );
}

function mobileDecor({ c1, c2 }: Colors) {
  const hang: Array<[number, number, "star" | "heart" | "moon"]> = [
    [58, 84, "star"], [112, 100, "heart"], [166, 82, "moon"], [222, 98, "star"],
  ];
  return (
    <g>
      <path d="M34 46 q 116 24 232 -4" fill="none" stroke={c1} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
      {hang.map(([x, y, kind], i) => (
        <g key={i} opacity="0.9">
          <path d={`M${x} ${y - 26} L${x} ${y - 10}`} stroke={c1} strokeWidth="1.2" opacity="0.6" fill="none" />
          {kind === "star" && <path d={starPath(x, y, 9)} fill={c1} />}
          {kind === "heart" && <path d={heartPath(x, y, 8)} fill={c2} />}
          {kind === "moon" && (
            <g>
              <circle cx={x} cy={y} r="10" fill={c1} />
              <circle cx={x + 5} cy={y - 4} r="8.4" fill="#E6EDF9" />
            </g>
          )}
        </g>
      ))}
      {cloud("c218", { x: 218, y: 128, s: 0.7, fill: c1, opacity: 0.5 })}
      {cloud("c38", { x: 38, y: 140, s: 0.55, fill: c1, opacity: 0.4 })}
    </g>
  );
}

function steamDecor({ c1, c2 }: Colors) {
  return (
    <g>
      {[110, 150, 190].map((x, i) => (
        <path
          key={x}
          d={`M${x} 104 q -14 -18 0 -34 q 14 -16 0 -34`}
          fill="none"
          stroke={c1}
          strokeWidth={3 - i * 0.4}
          strokeLinecap="round"
          opacity={0.5 - i * 0.1}
        />
      ))}
      <path d="M86 116 l 132 0 -12 52 -108 0 Z" fill={c1} opacity="0.9" />
      <path d="M218 126 q 26 4 22 20 t -26 16" fill="none" stroke={c1} strokeWidth="5" opacity="0.85" />
      <ellipse cx="152" cy="116" rx="66" ry="8" fill={c2} opacity="0.9" />
      <path d="M62 176 l 180 0" stroke={c1} strokeWidth="3" strokeLinecap="round" opacity="0.4" fill="none" />
    </g>
  );
}

function kraftDecor({ c1, c2 }: Colors) {
  return (
    <g fill="none" strokeLinecap="round">
      <circle cx="232" cy="66" r="26" stroke={c1} strokeWidth="2.2" opacity="0.5" />
      <circle cx="232" cy="66" r="13" stroke={c2} strokeWidth="1.6" opacity="0.4" />
      <path d="M26 52 L88 52 M26 70 L70 70 M26 88 L80 88 M26 106 L58 106" stroke={c1} strokeWidth="2.2" opacity="0.35" />
      <path d="M-6 150 q 60 -22 120 -2 t 190 -12" stroke={c1} strokeWidth="1.8" opacity="0.3" />
      <path d="M-6 168 q 70 -18 140 0 t 170 -8" stroke={c2} strokeWidth="1.6" opacity="0.22" />
      <path d="M120 132 l 22 -22 22 22 -22 22 Z" stroke={c2} strokeWidth="1.8" opacity="0.3" />
      {[46, 84, 122, 160, 198, 236].map((x, i) => (
        <circle key={x} cx={x} cy={122 + (i % 2) * 12} r={2 + (i % 3)} fill={c2} stroke="none" opacity="0.32" />
      ))}
    </g>
  );
}

function skylineDecor({ c1, c2 }: Colors) {
  const blocks = [
    [-8, 108, 40], [34, 84, 30], [66, 120, 26], [94, 68, 34], [130, 100, 28],
    [160, 78, 32], [194, 112, 26], [222, 88, 30], [254, 116, 30], [286, 96, 26],
  ] as const;
  return (
    <g>
      <circle cx="60" cy="42" r="15" fill={c2} opacity="0.8" />
      {blocks.map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={190 - y} fill={c1} opacity={0.82} />
          {Array.from({ length: Math.floor((190 - y) / 18) }, (_, r) =>
            [0, 1].map((cIdx) => (
              <rect
                key={`${r}-${cIdx}`}
                x={x + 6 + cIdx * (w / 2)}
                y={y + 9 + r * 18}
                width={w / 4}
                height="6"
                rx="1"
                fill={c2}
                opacity={(r + cIdx + i) % 3 === 0 ? 0.85 : 0.28}
              />
            ))
          )}
        </g>
      ))}
    </g>
  );
}

function raysDecor({ c1, c2 }: Colors) {
  const count = 14;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a0 = (i / count) * Math.PI * 2;
        const a1 = a0 + Math.PI / count;
        const R = 260;
        const cx = 236;
        const cy = 40;
        return (
          <path
            key={i}
            d={`M${cx} ${cy} L${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R} L${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R} Z`}
            fill={c1}
            opacity="0.22"
          />
        );
      })}
      <circle cx="236" cy="40" r="26" fill={c1} opacity="0.85" />
      <circle cx="236" cy="40" r="34" fill="none" stroke={c2} strokeWidth="2" opacity="0.5" />
    </g>
  );
}

function vinylDecor({ c1, c2 }: Colors) {
  return (
    <g>
      <circle cx="232" cy="66" r="54" fill={c1} opacity="0.18" />
      {[46, 38, 30, 22].map((r, i) => (
        <circle key={r} cx="232" cy="66" r={r} fill="none" stroke={c1} strokeWidth="1.4" opacity={0.3 + i * 0.06} />
      ))}
      <circle cx="232" cy="66" r="12" fill={c2} opacity="0.9" />
      <circle cx="232" cy="66" r="3" fill={c1} opacity="0.9" />
      {/* notes */}
      {[[48, 60], [90, 96], [30, 118]].map(([x, y], i) => (
        <g key={i} opacity={0.55 - i * 0.1}>
          <ellipse cx={x} cy={y} rx="6.4" ry="4.8" fill={c2} transform={`rotate(-18 ${x} ${y})`} />
          <path d={`M${x + 6} ${y - 2} L${x + 6} ${y - 26} q 10 3 12 10`} fill="none" stroke={c2} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

interface Colors {
  c1: string;
  c2: string;
}

/** Contenu SVG du décor, sans l'élément `<svg>` englobant. */
export function decorGlyphs(theme: ThemeDef): ReactNode {
  const c: Colors = { c1: theme.decorColor, c2: theme.decorColor2 };
  switch (theme.decor) {
    case "sun": return sunDecor(c);
    case "waves": return wavesDecor(c);
    case "lighthouse": return lighthouseDecor(c);
    case "dunes": return dunesDecor(c);
    case "dusk": return duskDecor(c);
    case "stars": return starsDecor(c);
    case "clouds": return cloudsDecor(c);
    case "aurora": return auroraDecor(c);
    case "rainbow": return rainbowDecor(c);
    case "rain": return rainDecor(c);
    case "pines": return pinesDecor(c);
    case "peaks": return peaksDecor(c);
    case "lavender": return lavenderDecor(c);
    case "meadow": return meadowDecor(c);
    case "leaves": return leavesDecor(c);
    case "snow": return snowDecor(c);
    case "blossom": return blossomDecor(c);
    case "foliage": return foliageDecor(c);
    case "bunting": return buntingDecor(c);
    case "balloons": return balloonsDecor(c);
    case "confetti": return confettiDecor(c);
    case "hearts": return heartsDecor(c);
    case "mobile": return mobileDecor(c);
    case "steam": return steamDecor(c);
    case "kraft": return kraftDecor(c);
    case "skyline": return skylineDecor(c);
    case "rays": return raysDecor(c);
    case "vinyl": return vinylDecor(c);
  }
}

/** Décor complet, dimensionné pour remplir la zone illustrée de la carte. */
export function ThemeDecor({ theme }: { theme: ThemeDef }) {
  return (
    <svg
      className="pc-art-decor"
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {decorGlyphs(theme)}
    </svg>
  );
}
