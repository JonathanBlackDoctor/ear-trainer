import React from 'react';
import { M } from '../../../theme/decorations/palette';
import { MCard, MOrb } from '../../../theme/decorations/aurora';
import { MiniSpark } from '../../../theme/decorations/spark';
import type { StatsData } from '../useStatsData';

const MODE_BAR_GRADIENTS = [
  'linear-gradient(90deg, #06b6d4, #10b981)',
  'linear-gradient(90deg, #a855f7, #ec4899)',
  'linear-gradient(90deg, #06b6d4, #a855f7)',
  'linear-gradient(90deg, #f59e0b, #ec4899)',
  'linear-gradient(90deg, #ec4899, #f59e0b)',
];

export function StatsM({ data }: { data: StatsData }) {
  const { overallPct, totalSessions, totalQ, streakDays, trend, modeAccuracy, weakItems, goHome, startWeakFocus } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

  if (totalQ === 0) return <EmptyM goHome={goHome} />;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: M.ink, position: 'relative', overflow: 'hidden', paddingBottom: 28 }}>
      <MOrb size={240} style={{ position: 'absolute', top: -80, left: -60, filter: 'blur(36px)' }} />
      <MOrb size={220} style={{ position: 'absolute', top: 240, right: -70, filter: 'blur(36px)' }} />

      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button onClick={goHome} aria-label="뒤로" style={{ width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: 16 }}>←</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 800 }}>📊 통계</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '16px 20px 0', position: 'relative' }}>
        <MCard gloss style={{ padding: '20px 18px' }}>
          <MOrb size={180} style={{ position: 'absolute', top: -40, right: -40, filter: 'blur(28px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, color: M.inkSoft, fontWeight: 700, letterSpacing: 1 }}>전체 정답률</div>
            <div style={{ ...tnum, marginTop: 4, fontSize: 76, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, background: M.iridescent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{overallPct}<span style={{ fontSize: 26 }}>%</span></div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <div><b style={{ fontSize: 14, fontWeight: 800 }}>{totalSessions}</b> <span style={{ fontSize: 10, color: M.inkMute }}>세션</span></div>
              <div><b style={{ fontSize: 14, fontWeight: 800 }}>{totalQ}</b> <span style={{ fontSize: 10, color: M.inkMute }}>문제</span></div>
              <div><b style={{ fontSize: 14, fontWeight: 800, color: M.pink }}>{streakDays}일</b> <span style={{ fontSize: 10, color: M.inkMute }}>연속</span></div>
            </div>
          </div>
        </MCard>
      </div>

      {trend.length > 1 && (
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>세션별 정답률</div>
              <div style={{ fontSize: 11, color: M.inkMute, fontWeight: 700 }}>최근 {trend.length}회</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="mTrendL" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={M.cyan} />
                    <stop offset="50%" stopColor={M.violet} />
                    <stop offset="100%" stopColor={M.pink} />
                  </linearGradient>
                  <linearGradient id="mTrendF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={M.violet} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={M.violet} stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <MiniSpark points={trend} w={336} h={86} stroke="url(#mTrendL)" strokeWidth={2.4} fill="url(#mTrendF)" />
            </div>
          </MCard>
        </div>
      )}

      {modeAccuracy.length > 0 && (
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>모드별 정답률</div>
            {modeAccuracy.map((m, i) => (
              <div key={m.modeKey} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ width: 84, fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.emoji} {m.label}</div>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: M.hairSoft, overflow: 'hidden' }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', background: MODE_BAR_GRADIENTS[i % MODE_BAR_GRADIENTS.length], borderRadius: 4 }} />
                </div>
                <div style={{ ...tnum, width: 36, fontSize: 12, fontWeight: 800, textAlign: 'right' }}>{m.pct}%</div>
              </div>
            ))}
          </MCard>
        </div>
      )}

      {weakItems.length > 0 && (
        <div style={{ padding: '20px 20px 0', position: 'relative' }}>
          <button onClick={startWeakFocus} style={{ width: '100%', padding: '16px 0', borderRadius: 18, border: 'none', background: 'linear-gradient(135deg, #ec4899, #f59e0b)', color: '#fff', fontSize: 14, fontWeight: 800, boxShadow: '0 14px 30px rgba(236,72,153,0.45)' }}>약점 집중 복습 →</button>
        </div>
      )}
    </div>
  );
}

function EmptyM({ goHome }: { goHome: () => void }) {
  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: M.ink, position: 'relative', overflow: 'hidden', padding: '60px 20px' }}>
      <MOrb size={240} style={{ position: 'absolute', top: -80, left: -60, filter: 'blur(36px)' }} />
      <MCard gloss style={{ padding: '28px 18px', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 44 }}>📭</div>
        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 800 }}>아직 기록이 없어요</div>
        <button onClick={goHome} style={{ marginTop: 14, width: '100%', padding: '14px 0', borderRadius: 18, border: 'none', background: M.iridescent, color: '#fff', fontSize: 14, fontWeight: 800, boxShadow: '0 14px 30px rgba(168,85,247,0.5)' }}>훈련 시작</button>
      </MCard>
    </div>
  );
}
