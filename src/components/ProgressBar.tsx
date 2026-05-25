import React from 'react';
import { useDesign } from '../theme/useDesign';
import { G, I, J, M } from '../theme/decorations/palette';

interface ProgressBarProps {
  current: number;
  total: number;
  correct: number;
}

export function ProgressBar({ current, total, correct }: ProgressBarProps) {
  const design = useDesign();

  if (design === 'g' || design === 'i' || design === 'j') {
    return <SegmentedBar design={design} current={current} total={total} correct={correct} />;
  }
  if (design === 'm') {
    return <GradientBar current={current} total={total} correct={correct} />;
  }
  return <DefaultBar current={current} total={total} correct={correct} />;
}

function DefaultBar({ current, total, correct }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">{current}/{total}</span>
      <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">✓ {correct}</span>
    </div>
  );
}

// G/I/J share a 10-ish segmented tick bar; colors/border come from the palette.
function SegmentedBar({ design, current, total, correct }: ProgressBarProps & { design: 'g' | 'i' | 'j' }) {
  const cfg = {
    g: { ink: G.ink, done: G.green, cur: G.mustard, empty: G.card, border: `2px solid ${G.ink}`, h: 14, gap: 3, mono: '#3a3a3a' },
    i: { ink: I.ink, done: I.lime, cur: I.limeBright, empty: I.inset, border: `1px solid ${I.hairDark}`, h: 10, gap: 0, mono: I.inkMute },
    j: { ink: J.ink, done: J.pink, cur: J.yellow, empty: '#fff', border: `1.5px solid ${J.ink}`, h: 12, gap: 3, mono: J.inkSoft },
  }[design];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: cfg.gap }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ height: cfg.h, border: cfg.border, background: i < current ? cfg.done : i === current ? cfg.cur : cfg.empty }} />
        ))}
      </div>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11, fontWeight: 900, color: cfg.mono, whiteSpace: 'nowrap' }}>{current}/{total}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11, fontWeight: 900, color: cfg.done, whiteSpace: 'nowrap' }}>✓{correct}</span>
    </div>
  );
}

function GradientBar({ current, total, correct }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: M.hairSoft, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: M.iridescent, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 800, color: M.inkSoft, whiteSpace: 'nowrap' }}>{current}/{total}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 800, color: M.mint, whiteSpace: 'nowrap' }}>✓ {correct}</span>
    </div>
  );
}
