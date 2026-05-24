import React from 'react';
import { M } from './palette';

// Direction M — 오로라 / 홀로그래픽 primitives. Palette + M_MODE_GRADIENTS live
// in ./palette.
interface MCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gloss?: boolean;
}

// Frosted glass card. The blur + transparency fallbacks for
// prefers-reduced-transparency / low-end devices live in index.css.
export function MCard({ gloss = false, style, children, ...rest }: MCardProps) {
  return (
    <div
      className="m-glass"
      style={{
        background: 'rgba(255,255,255,0.7)',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow:
          '0 8px 24px rgba(26,31,58,0.06), 0 1px 3px rgba(26,31,58,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {gloss && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
          }}
        />
      )}
      {children}
    </div>
  );
}

interface MTextProps {
  children: React.ReactNode;
  size?: number;
  weight?: number;
  style?: React.CSSProperties;
}

// Iridescent gradient text.
export function MText({ children, size, weight = 700, style }: MTextProps) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: weight,
        letterSpacing: '-0.02em',
        background: M.iridescent,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Blurred aurora orb. Decorative only; never animated (static composition).
export function MOrb({ size = 80, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      className="m-orb"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: M.iridescent,
        filter: 'blur(2px)',
        opacity: 0.7,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
