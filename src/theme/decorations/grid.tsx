import React from 'react';
import { I } from './palette';

// Direction I — 모눈 / 데이터 primitives. Palette lives in ./palette.

// Crosshair L-bracket marks at all four corners of a (position:relative) card.
export function ICorners({ pad = 6, color = I.hairDark }: { pad?: number; color?: string }) {
  const corners: React.CSSProperties[] = [
    { top: pad, left: pad, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` },
    { top: pad, right: pad, borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` },
    { bottom: pad, left: pad, borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` },
    { bottom: pad, right: pad, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` },
  ];
  return (
    <>
      {corners.map((s, i) => (
        <div key={i} aria-hidden style={{ position: 'absolute', width: 10, height: 10, pointerEvents: 'none', ...s }} />
      ))}
    </>
  );
}

interface IFieldProps {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Lab-sheet label/value pair with slashed-zero tabular numerals.
export function IField({ label, value, valueColor = I.ink, size = 'md' }: IFieldProps) {
  return (
    <div>
      <div style={{ fontSize: 9, color: I.inkMute, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: size === 'lg' ? 28 : size === 'sm' ? 14 : 20,
          fontWeight: 800,
          color: valueColor,
          letterSpacing: '-0.03em',
          marginTop: 2,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums slashed-zero',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// Oscilloscope waveform on a faint grid — the signature play-card motif.
export function Oscilloscope({ color = I.lime }: { color?: string }) {
  return (
    <svg
      width="100%"
      viewBox="0 0 340 70"
      preserveAspectRatio="none"
      aria-hidden
      style={{
        display: 'block',
        height: 70,
        background: `linear-gradient(${I.hair} 1px, transparent 1px) 0 0 / 100% 16.66%, linear-gradient(90deg, ${I.hair} 1px, transparent 1px) 0 0 / 14px 100%`,
      }}
    >
      <path
        d="M0,35 Q20,5 40,35 T80,35 Q100,55 120,35 T160,35 Q180,15 200,35 T240,35 Q260,55 280,35 T340,35"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}

export function IChip({ children, color = I.lime }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        fontSize: 10,
        fontWeight: 800,
        background: I.card,
        color,
        border: `1px solid ${color}`,
        letterSpacing: 0.5,
        fontVariantNumeric: 'tabular-nums slashed-zero',
      }}
    >
      {children}
    </span>
  );
}
