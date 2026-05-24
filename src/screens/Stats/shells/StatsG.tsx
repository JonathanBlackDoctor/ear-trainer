import React from 'react';
import { G } from '../../../theme/decorations/palette';
import { GBlock, NeoSticker } from '../../../theme/decorations/neo';
import { MiniSpark } from '../../../theme/decorations/spark';
import type { StatsData } from '../useStatsData';

const barColor = (p: number) => (p >= 80 ? G.green : p >= 60 ? G.sky : p >= 40 ? G.orange : G.red);

export function StatsG({ data }: { data: StatsData }) {
  const { overallPct, totalSessions, totalQ, streakDays, trend, modeAccuracy, weakItems, goHome, startWeakFocus } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

  if (totalQ === 0) return <EmptyG goHome={goHome} />;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: G.ink, paddingBottom: 24 }}>
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }} onClick={goHome} role="button" aria-label="뒤로">←</GBlock>
        <NeoSticker bg={G.mustard} rot={0} style={{ letterSpacing: 2 }}>STATS</NeoSticker>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <GBlock bg={G.sky} sh={G.shadow} style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>전체 정답률</div>
          <div style={{ ...tnum, fontSize: 100, fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.85, marginTop: 4 }}>
            {overallPct}
            <span style={{ fontSize: 32, background: G.mustard, padding: '0 6px', border: G.border, marginLeft: 4 }}>%</span>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            <div style={tnum}><b style={{ fontSize: 14, fontWeight: 900 }}>{totalSessions}</b> <span style={{ fontSize: 10, fontWeight: 700 }}>세션</span></div>
            <div style={tnum}><b style={{ fontSize: 14, fontWeight: 900 }}>{totalQ}</b> <span style={{ fontSize: 10, fontWeight: 700 }}>문제</span></div>
            <div style={tnum}><b style={{ fontSize: 14, fontWeight: 900 }}>{streakDays}일</b> <span style={{ fontSize: 10, fontWeight: 700 }}>연속</span></div>
          </div>
        </GBlock>
      </div>

      {trend.length > 1 && (
        <div style={{ padding: '16px 20px 0' }}>
          <GBlock bg={G.card} sh={G.shadowS} style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>세션별 정답률</div>
              <div style={{ fontSize: 10, color: G.inkMute, fontWeight: 700 }}>최근 {trend.length}회</div>
            </div>
            <div style={{ background: G.mint, border: `2.5px solid ${G.ink}`, padding: 6 }}>
              <MiniSpark points={trend} w={324} h={82} stroke={G.ink} strokeWidth={3} />
            </div>
          </GBlock>
        </div>
      )}

      {modeAccuracy.length > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <GBlock bg={G.card} sh={G.shadowS} style={{ padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>모드별 정답률</div>
            {modeAccuracy.map((m) => (
              <div key={m.modeKey} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <div style={{ width: 84, fontSize: 12, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.emoji} {m.label}</div>
                <div style={{ flex: 1, height: 14, border: `2px solid ${G.ink}`, background: G.card }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: barColor(m.pct), borderRight: `2px solid ${G.ink}` }} />
                </div>
                <div style={{ ...tnum, width: 36, fontSize: 13, fontWeight: 900, textAlign: 'right' }}>{m.pct}</div>
              </div>
            ))}
          </GBlock>
        </div>
      )}

      {weakItems.length > 0 && (
        <div style={{ padding: '18px 20px 0' }}>
          <GBlock bg={G.red} sh={G.shadow} style={{ padding: '14px 0', textAlign: 'center', cursor: 'pointer' }} onClick={startWeakFocus} role="button">
            <div style={{ fontSize: 14, fontWeight: 900, color: G.card, letterSpacing: '-0.01em' }}>약점 집중 복습 →</div>
          </GBlock>
        </div>
      )}
    </div>
  );
}

function EmptyG({ goHome }: { goHome: () => void }) {
  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: G.ink, padding: '60px 20px', textAlign: 'center' }}>
      <GBlock bg={G.mustard} sh={G.shadow} style={{ padding: '28px 18px' }}>
        <div style={{ fontSize: 44 }}>📭</div>
        <div style={{ marginTop: 8, fontSize: 16, fontWeight: 900 }}>아직 기록이 없어요</div>
        <button onClick={goHome} style={{ marginTop: 14, width: '100%', padding: '14px 0', border: G.border, background: G.pink, color: G.ink, fontSize: 15, fontWeight: 900, boxShadow: G.shadowS }}>훈련 시작</button>
      </GBlock>
    </div>
  );
}
