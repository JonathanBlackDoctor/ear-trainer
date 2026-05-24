import React from 'react';
import { J } from './palette';

// Direction J — 카세트 테이프 primitives. Palette lives in ./palette.
interface JReelProps {
  size?: number;
  color?: string;
  hubColor?: string;
  spinning?: boolean;
}

// Tape reel — concentric chrome circles with 6 spokes. `spinning` rotates it
// (callers gate this on prefers-reduced-motion).
export function JReel({ size = 44, color = J.ink, hubColor = J.pink, spinning = false }: JReelProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      aria-hidden
      style={{ display: 'block', transformOrigin: 'center', animation: spinning ? 'j-reel-spin 4s linear infinite' : undefined }}
    >
      <circle cx="22" cy="22" r="20" fill="url(#j-reel-chrome)" stroke={color} strokeWidth="1.5" />
      <defs>
        <linearGradient id="j-reel-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f7" />
          <stop offset="50%" stopColor="#d5d8de" />
          <stop offset="100%" stopColor="#f5f5f7" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="14" fill="none" stroke={color} strokeWidth="0.8" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={22 + Math.cos(rad) * 7}
            y1={22 + Math.sin(rad) * 7}
            x2={22 + Math.cos(rad) * 13}
            y2={22 + Math.sin(rad) * 13}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="22" cy="22" r="6.5" fill={hubColor} stroke={color} strokeWidth="1.5" />
      <circle cx="22" cy="22" r="2" fill={color} />
    </svg>
  );
}

// 45° caution-tape band, used as a masthead / footer rule.
export function JStripes({ h = 12, c1 = J.pink, c2 = J.yellow }: { h?: number; c1?: string; c2?: string }) {
  return (
    <div
      aria-hidden
      style={{
        height: h,
        background: `repeating-linear-gradient(45deg, ${c1} 0 14px, ${c2} 14px 28px)`,
        borderTop: `2px solid ${J.ink}`,
        borderBottom: `2px solid ${J.ink}`,
      }}
    />
  );
}

interface JStickerProps {
  children: React.ReactNode;
  bg?: string;
  rot?: number;
}

export function JSticker({ children, bg = J.yellow, rot = -2 }: JStickerProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        background: bg,
        border: `2px solid ${J.ink}`,
        fontSize: 11,
        fontWeight: 900,
        color: J.ink,
        transform: `rotate(${rot}deg)`,
        boxShadow: `2px 2px 0 ${J.ink}`,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </span>
  );
}
