import React from 'react';

interface MiniSparkProps {
  points: number[];
  w?: number;
  h?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}

// Inline sparkline matching the design handoff's MiniSpark helper. Used by the
// themed Stats shells (default keeps Recharts).
export function MiniSpark({ points, w = 280, h = 70, stroke = '#000', fill, strokeWidth = 2 }: MiniSparkProps) {
  if (points.length === 0) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const dx = w / Math.max(1, points.length - 1);
  const d = points
    .map((v, i) => {
      const x = i * dx;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden style={{ display: 'block' }}>
      {fill && <path d={area} fill={fill} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
