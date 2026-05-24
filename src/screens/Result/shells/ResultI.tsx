import React from 'react';
import { I } from '../../../theme/decorations/palette';
import { ICorners, IField } from '../../../theme/decorations/grid';
import type { ResultData } from '../useResultData';

export function ResultI({ data }: { data: ResultData }) {
  const {
    pct, correct, wrong, total, mins, secs, bestCombo,
    xpEarned, totalXp, currRank, prevRank, rankedUp, unlocked,
    again, goBadges, goStats, goHome,
  } = data;
  const mono: React.CSSProperties = { fontVariantNumeric: 'tabular-nums slashed-zero' };
  const time = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: I.ink, paddingBottom: 24 }}>
      {rankedUp && (
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ background: I.lime, border: `1.5px solid ${I.ink}`, padding: '10px 12px' }}>
            <div style={{ ...mono, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, background: I.ink, color: I.lime, padding: '2px 8px' }}>RANK · UP</div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>{prevRank.tier.name} → {currRank.tier.name} {currRank.tier.emoji}</div>
            </div>
          </div>
        </div>
      )}

      {/* score plaque */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '16px 14px', position: 'relative' }}>
          <ICorners color={I.lime} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <div style={{ ...mono, fontSize: 96, fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 0.85 }}>
              {pct}<span style={{ fontSize: 28, color: I.lime }}>%</span>
            </div>
            <div style={{ paddingBottom: 8, flex: 1 }}>
              <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 800, letterSpacing: 1.5 }}>SCORE / RESULT</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{pct >= 90 ? '완벽합니다! 🏆' : '계속 진행 ✓'}</div>
              <div style={{ ...mono, fontSize: 10, color: I.inkSoft, marginTop: 2 }}>{total} → {correct} ✓ / {wrong} ✗</div>
            </div>
          </div>
        </div>
      </div>

      {/* stat row */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ ...mono, background: I.card, border: `1px solid ${I.hairDark}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {([['+XP', `+${xpEarned}`, I.lime], ['COMBO', `${bestCombo}`, I.signal], ['TIME', time, I.cyan]] as const).map(
            ([l, v, c], i) => (
              <div key={l} style={{ padding: '10px 8px 12px', borderRight: i < 2 ? `1px solid ${I.hair}` : 'none', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c }} />
                <IField label={l} value={v} size="md" />
              </div>
            ),
          )}
        </div>
      </div>

      {/* xp progress */}
      {currRank.next && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '10px 12px' }}>
            <div style={{ ...mono, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: I.inkMute, letterSpacing: 1.5 }}>RANK PROG · {currRank.next.name.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>{totalXp.toLocaleString()} <span style={{ color: I.inkMute }}>/ {currRank.next.min.toLocaleString()}</span></div>
            </div>
            <div style={{ marginTop: 8, height: 6, background: I.inset, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round(currRank.progress * 100)}%`, background: I.lime }} />
              {[20, 40, 60, 80].map((p) => (
                <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -1, bottom: -1, width: 1, background: I.hairDark }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* badges */}
      {unlocked.map((a) => (
        <div key={a.id} style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.lime}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, border: `1.5px solid ${I.ink}`, background: I.limeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{a.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...mono, fontSize: 9, fontWeight: 800, color: I.lime, letterSpacing: 1.5 }}>BADGE · UNLOCKED</div>
              <div style={{ fontSize: 13, fontWeight: 800, marginTop: 1 }}>{a.name}</div>
            </div>
          </div>
        </div>
      ))}

      {/* actions */}
      <div style={{ padding: '16px 20px 0' }}>
        <button onClick={again} style={{ ...mono, width: '100%', padding: '14px 0', border: `1.5px solid ${I.ink}`, background: I.ink, color: I.lime, fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>▶ RETRY · 한 번 더</button>
        <div style={{ ...mono, marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {([['🏆 BADGES', goBadges], ['📊 STATS', goStats], ['🏠 HOME', goHome]] as const).map(([l, on]) => (
            <button key={l} onClick={on} style={{ padding: '10px 0', border: `1px solid ${I.hairDark}`, background: I.card, color: I.ink, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
