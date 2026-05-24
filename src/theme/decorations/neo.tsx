import React from 'react';
import { G } from './palette';

// Direction G — 네오 브루탈리즘 primitives. Palette lives in ./palette.
interface GBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  bg?: string;
  sh?: string;
}

// Hard-offset block — the workhorse surface for direction G.
export function GBlock({ bg = G.card, sh = G.shadow, style, children, ...rest }: GBlockProps) {
  return (
    <div style={{ background: bg, border: G.border, boxShadow: sh, ...style }} {...rest}>
      {children}
    </div>
  );
}

interface NeoStickerProps {
  children: React.ReactNode;
  bg?: string;
  rot?: number;
  style?: React.CSSProperties;
}

// Tilted label sticker (e.g. "EAR TRAINING ★").
export function NeoSticker({ children, bg = G.mustard, rot = -2, style }: NeoStickerProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        border: G.border,
        padding: '4px 10px',
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 2,
        color: G.ink,
        transform: `rotate(${rot}deg)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
