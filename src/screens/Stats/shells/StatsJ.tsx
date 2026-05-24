import React from 'react';
import { J } from '../../../theme/decorations/palette';
import { JStripes, JSticker } from '../../../theme/decorations/cassette';
import type { StatsData } from '../useStatsData';

const TRACK_COLORS = [J.teal, J.pink, J.yellow];

export function StatsJ({ data }: { data: StatsData }) {
  const { overallPct, totalSessions, totalQ, streakDays, trend, modeAccuracy, weakItems, goHome, startWeakFocus } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

  if (totalQ === 0) return <EmptyJ goHome={goHome} />;

  // VU histogram from the trend (scaled bars).
  const vu = trend.length > 0 ? trend : [0];
  const vuMax = Math.max(...vu, 1);

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: J.ink, paddingBottom: 24 }}>
      <JStripes h={8} />
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={goHome} aria-label="뒤로" style={{ width: 32, height: 32, border: `2px solid ${J.ink}`, background: J.card, fontSize: 14, boxShadow: `2px 2px 0 ${J.ink}` }}>◀</button>
        <JSticker bg={J.teal} rot={-2}>STATS · 통계</JSticker>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, padding: 14, boxShadow: `4px 4px 0 ${J.ink}` }}>
          <div style={{ ...tnum, fontSize: 11, fontWeight: 900, color: J.pinkDeep, letterSpacing: 2 }}>TOTAL ACC</div>
          <div style={{ ...tnum, fontSize: 80, fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.9, marginTop: 4 }}>{overallPct}<span style={{ fontSize: 26, color: J.pink }}>%</span></div>
          <div style={{ marginTop: 12, display: 'flex', gap: 3, height: 24, alignItems: 'flex-end' }}>
            {vu.map((v, i) => (
              <div key={i} style={{ flex: 1, height: `${Math.max(8, (v / vuMax) * 100)}%`, background: i >= vu.length - 5 ? J.pink : J.teal, border: `1px solid ${J.ink}` }} />
            ))}
          </div>
          <div style={{ ...tnum, marginTop: 6, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>SESSION ◁ {totalSessions} ▷ · 🔥 {streakDays}일</div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {([['N · 세션', `${totalSessions}`], ['Q · 문제', `${totalQ}`], ['🔥 연속', `${streakDays}`]] as const).map(([l, v]) => (
          <div key={l} style={{ background: J.card, border: `2px solid ${J.ink}`, padding: '8px 8px 10px', boxShadow: `2px 2px 0 ${J.ink}` }}>
            <div style={{ fontSize: 9, color: J.inkMute, fontWeight: 900 }}>{l}</div>
            <div style={{ ...tnum, fontSize: 18, fontWeight: 900, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {modeAccuracy.length > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: J.card, border: `2px solid ${J.ink}`, padding: '10px 12px', boxShadow: `3px 3px 0 ${J.ink}` }}>
            <div style={{ ...tnum, fontSize: 10, fontWeight: 900, marginBottom: 6, letterSpacing: 1.5 }}>TRACK PERFORMANCE</div>
            {modeAccuracy.map((m, i) => (
              <div key={m.modeKey} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ width: 84, fontSize: 11, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.emoji} {m.label}</div>
                <div style={{ flex: 1, height: 10, background: '#fff', border: `1.5px solid ${J.ink}` }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', background: TRACK_COLORS[i % TRACK_COLORS.length] }} />
                </div>
                <div style={{ ...tnum, width: 32, fontSize: 11, fontWeight: 900, textAlign: 'right' }}>{m.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {weakItems.length > 0 && (
        <div style={{ padding: '18px 20px 0' }}>
          <button onClick={startWeakFocus} style={{ width: '100%', padding: '14px 0', border: `2.5px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 14, fontWeight: 900, boxShadow: `4px 4px 0 ${J.ink}` }}>약점 집중 REC ●</button>
        </div>
      )}
    </div>
  );
}

function EmptyJ({ goHome }: { goHome: () => void }) {
  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: J.ink }}>
      <JStripes h={8} />
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ background: J.card, border: `2.5px solid ${J.ink}`, padding: '28px 18px', boxShadow: `4px 4px 0 ${J.ink}` }}>
          <div style={{ fontSize: 44 }}>📭</div>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 900 }}>아직 기록이 없어요</div>
          <button onClick={goHome} style={{ marginTop: 14, width: '100%', padding: '12px 0', border: `2.5px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 14, fontWeight: 900, boxShadow: `2px 2px 0 ${J.ink}` }}>▶ 훈련 시작</button>
        </div>
      </div>
    </div>
  );
}
