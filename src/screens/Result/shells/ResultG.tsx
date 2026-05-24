import React from 'react';
import { G } from '../../../theme/decorations/palette';
import { GBlock } from '../../../theme/decorations/neo';
import type { ResultData } from '../useResultData';

export function ResultG({ data }: { data: ResultData }) {
  const {
    pct, emoji, comment, correct, wrong, mins, secs, bestCombo,
    xpEarned, xpDisplayed, currRank, prevRank, rankedUp, unlocked,
    again, goBadges, goStats, goHome,
  } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
  const time = `${mins > 0 ? `${mins}:` : ''}${String(secs).padStart(mins > 0 ? 2 : 1, '0')}`;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: G.ink, paddingBottom: 24 }}>
      {rankedUp && (
        <div style={{ padding: '18px 20px 0' }}>
          <GBlock bg={G.mustard} sh={G.shadow} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 34 }}>🎊</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3 }}>★ RANK UP ★</div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{prevRank.tier.name} → {currRank.tier.name}</div>
            </div>
            <div style={{ fontSize: 34, transform: 'rotate(8deg)' }}>{currRank.tier.emoji}</div>
          </GBlock>
        </div>
      )}

      {/* score */}
      <div style={{ padding: '20px 20px 0' }}>
        <GBlock bg={G.mint} sh={G.shadowL} style={{ padding: '20px 18px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 50, lineHeight: 1 }}>{emoji}</div>
          <div style={{ ...tnum, marginTop: 6, fontSize: 120, fontWeight: 900, letterSpacing: '-0.07em', lineHeight: 0.85 }}>
            {pct}<span style={{ fontSize: 36 }}>%</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>{comment}</div>
        </GBlock>
      </div>

      {/* stats row */}
      <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {([['정답', `${correct}`, G.green], ['오답', `${wrong}`, G.red], ['콤보', `${bestCombo}`, G.pink], ['시간', time, G.sky]] as const).map(
          ([l, v, c]) => (
            <GBlock key={l} bg={c} sh="3px 3px 0 #0a0a0a" style={{ padding: '8px 6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>{l}</div>
              <div style={{ ...tnum, fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em', marginTop: 2 }}>{v}</div>
            </GBlock>
          ),
        )}
      </div>

      {/* xp */}
      {xpEarned > 0 && (
        <div style={{ padding: '16px 20px 0' }}>
          <GBlock bg={G.pink} sh={G.shadow} style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>+ XP EARNED</div>
              <div style={{ ...tnum, fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em' }}>+{xpDisplayed}</div>
            </div>
            <div style={{ marginTop: 10, height: 14, background: G.card, border: G.border, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round(currRank.progress * 100)}%`, background: G.mustard, borderRight: G.border }} />
            </div>
          </GBlock>
        </div>
      )}

      {/* unlocked badges */}
      {unlocked.map((a) => (
        <div key={a.id} style={{ padding: '14px 20px 0' }}>
          <GBlock bg={G.card} sh={G.shadowS} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, background: G.lavender, border: G.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{a.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ background: G.ink, color: G.mustard, padding: '2px 6px', fontSize: 9, fontWeight: 900, letterSpacing: 1.5, display: 'inline-block' }}>NEW</div>
              <div style={{ fontSize: 14, fontWeight: 900, marginTop: 4 }}>{a.name}</div>
            </div>
          </GBlock>
        </div>
      ))}

      {/* actions */}
      <div style={{ padding: '18px 20px 0' }}>
        <GBlock bg={G.ink} sh="6px 6px 0 #ff5a8c" style={{ padding: '16px 0', textAlign: 'center', borderColor: G.ink, cursor: 'pointer' }} onClick={again} role="button">
          <div style={{ fontSize: 17, fontWeight: 900, color: G.mustard, letterSpacing: '-0.01em' }}>한 번 더 →</div>
        </GBlock>
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          {([['🏆 업적', goBadges], ['📊 통계', goStats], ['홈으로', goHome]] as const).map(([l, on]) => (
            <GBlock key={l} bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer' }} onClick={on} role="button">
              <div style={{ fontSize: 12, fontWeight: 900 }}>{l}</div>
            </GBlock>
          ))}
        </div>
      </div>
    </div>
  );
}
