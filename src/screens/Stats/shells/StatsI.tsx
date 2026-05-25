import React from 'react';
import { I } from '../../../theme/decorations/palette';
import { ICorners, IField } from '../../../theme/decorations/grid';
import { MiniSpark } from '../../../theme/decorations/spark';
import type { StatsData } from '../useStatsData';

const barColor = (p: number) => (p >= 80 ? I.lime : p >= 60 ? I.cyan : p >= 40 ? I.amber : I.signal);

export function StatsI({ data }: { data: StatsData }) {
  const { overallPct, totalSessions, totalQ, streakDays, trend, modeAccuracy, weakItems, goHome, startWeakFocus } = data;
  const mono: React.CSSProperties = { fontVariantNumeric: 'tabular-nums slashed-zero' };

  if (totalQ === 0) return <EmptyI goHome={goHome} />;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: I.ink, paddingBottom: 24 }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${I.hair}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goHome} aria-label="뒤로" style={{ width: 28, height: 28, border: `1px solid ${I.hairDark}`, background: I.card, fontSize: 14 }}>←</button>
        <div style={{ ...mono, fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>STATS · DASHBOARD</div>
      </div>

      {/* KPI block */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: 14, position: 'relative' }}>
          <ICorners />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <div style={{ ...mono, fontSize: 64, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.85 }}>{overallPct}<span style={{ fontSize: 22, color: I.lime }}>%</span></div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 800, letterSpacing: 1 }}>OVERALL ACCURACY</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-col mini stats */}
      <div style={{ padding: '8px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {([['N · 세션', `${totalSessions}`], ['Q · 문제', `${totalQ}`], ['STREAK', `${streakDays} 일`]] as const).map(([l, v]) => (
          <div key={l} style={{ background: I.card, border: `1px solid ${I.hair}`, padding: '8px 10px' }}>
            <IField label={l} value={v} size="sm" />
          </div>
        ))}
      </div>

      {/* trend */}
      {trend.length > 1 && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '10px 12px 6px', position: 'relative' }}>
            <ICorners />
            <div style={{ ...mono, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: I.lime, letterSpacing: 1.5 }}>TREND · ACC × SESSION</div>
              <div style={{ fontSize: 10, color: I.inkMute, fontWeight: 700 }}>n={trend.length}</div>
            </div>
            <div style={{ marginTop: 8, background: `linear-gradient(${I.hair} 1px, transparent 1px) 0 0 / 100% 25%, linear-gradient(90deg, ${I.hair} 1px, transparent 1px) 0 0 / 10% 100%` }}>
              <MiniSpark points={trend} w={324} h={92} stroke={I.lime} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      )}

      {/* mode bars */}
      {modeAccuracy.length > 0 && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: 12 }}>
            <div style={{ ...mono, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>BY MODE</div>
            {modeAccuracy.map((m, i) => (
              <div key={m.modeKey} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 36px', gap: 8, padding: '5px 0', alignItems: 'center', borderTop: i > 0 ? `1px dashed ${I.hair}` : 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.emoji} {m.label}</div>
                <div style={{ height: 8, background: I.inset, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${m.pct}%`, background: barColor(m.pct) }} />
                  {[25, 50, 75].map((p) => (
                    <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -1, bottom: -1, width: 1, background: I.hairDark }} />
                  ))}
                </div>
                <div style={{ ...mono, fontSize: 12, fontWeight: 800, textAlign: 'right' }}>{m.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {weakItems.length > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <button onClick={startWeakFocus} style={{ ...mono, width: '100%', padding: '14px 0', border: `1.5px solid ${I.ink}`, background: I.signal, color: I.card, fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>▶ FOCUS WEAK · 약점 집중 복습</button>
        </div>
      )}
    </div>
  );
}

function EmptyI({ goHome }: { goHome: () => void }) {
  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: I.ink, padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '28px 18px', position: 'relative' }}>
        <ICorners />
        <div style={{ fontSize: 44 }}>📭</div>
        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800 }}>아직 기록이 없어요</div>
        <button onClick={goHome} style={{ marginTop: 14, width: '100%', padding: '12px 0', border: `1.5px solid ${I.ink}`, background: I.ink, color: I.lime, fontSize: 13, fontWeight: 800, letterSpacing: 1, fontVariantNumeric: 'tabular-nums slashed-zero' }}>▶ 훈련 시작</button>
      </div>
    </div>
  );
}
