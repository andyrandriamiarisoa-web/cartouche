"use client";

import type { ThemeDef } from "@/lib/themes";

/** Petites illustrations dessinées dans la zone artistique du recto. */
export function ThemeDecor({ theme }: { theme: ThemeDef }) {
  return (
    <svg
      className="pc-art-decor"
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {theme.decor === "sun" && <SunDecor c1={theme.decorColor} c2={theme.decorColor2} />}
      {theme.decor === "dusk" && <DuskDecor c1={theme.decorColor} c2={theme.decorColor2} />}
      {theme.decor === "stars" && <StarsDecor c1={theme.decorColor} c2={theme.decorColor2} />}
      {theme.decor === "bunting" && (
        <BuntingDecor c1={theme.decorColor} c2={theme.decorColor2} />
      )}
    </svg>
  );
}

function SunDecor({ c1, c2 }: { c1: string; c2: string }) {
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
      {/* mouettes */}
      <path
        d="M44 62 q6 -7 12 0 q6 -7 12 0"
        fill="none"
        stroke={c1}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M78 44 q5 -6 10 0 q5 -6 10 0"
        fill="none"
        stroke={c1}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </g>
  );
}

function DuskDecor({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <circle cx="236" cy="70" r="34" fill={c1} opacity="0.9" />
      <rect x="192" y="58" width="88" height="5" rx="2.5" fill={c2} opacity="0.55" />
      <rect x="200" y="74" width="80" height="5" rx="2.5" fill={c2} opacity="0.45" />
      <rect x="210" y="90" width="70" height="4" rx="2" fill={c2} opacity="0.35" />
      {/* oiseaux du soir */}
      <path
        d="M52 52 q5 -6 10 0 q5 -6 10 0"
        fill="none"
        stroke={c1}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M34 70 q4 -5 8 0 q4 -5 8 0"
        fill="none"
        stroke={c1}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  );
}

const STARS: Array<[number, number, number]> = [
  [36, 38, 1.8],
  [72, 24, 1.3],
  [108, 52, 1.6],
  [140, 20, 1.2],
  [170, 44, 1.9],
  [60, 74, 1.2],
  [126, 84, 1.4],
  [22, 108, 1.5],
  [88, 118, 1.2],
  [158, 112, 1.6],
  [196, 92, 1.2],
  [262, 118, 1.5],
];

function StarsDecor({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      {/* croissant de lune */}
      <circle cx="228" cy="52" r="23" fill={c1} />
      <circle cx="237" cy="45" r="20" fill="#232E5C" />
      {/* grande étoile à quatre branches */}
      <path
        d="M186 30 l2.2 6.8 6.8 2.2 -6.8 2.2 -2.2 6.8 -2.2 -6.8 -6.8 -2.2 6.8 -2.2 z"
        fill={c2}
        opacity="0.95"
      />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c2} opacity={0.5 + (i % 3) * 0.2} />
      ))}
    </g>
  );
}

const FLAGS: Array<[number, number]> = [
  [26, 34],
  [62, 41],
  [98, 43],
  [134, 40],
  [170, 34],
  [206, 31],
  [242, 34],
  [274, 39],
];

function BuntingDecor({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path
        d="M-4 24 Q 74 48 150 34 T 304 22"
        fill="none"
        stroke={c1}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.9"
      />
      {FLAGS.map(([x, y], i) => (
        <path
          key={i}
          d={`M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + 15} Z`}
          fill={i % 2 === 0 ? c1 : c2}
          opacity={i % 2 === 0 ? 0.95 : 0.9}
        />
      ))}
      {/* confettis */}
      <circle cx="52" cy="84" r="2.4" fill={c1} opacity="0.5" />
      <circle cx="216" cy="72" r="2" fill={c1} opacity="0.4" />
      <circle cx="150" cy="66" r="1.8" fill={c1} opacity="0.45" />
    </g>
  );
}
