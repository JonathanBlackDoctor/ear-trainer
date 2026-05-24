import React from 'react';
import { M } from '../../../theme/decorations/palette';
import { MCard, MText, MChip, MOrb } from '../../../theme/decorations/aurora';
import type { ResultData } from '../useResultData';

export function ResultM({ data }: { data: ResultData }) {
  const {
    pct, comment, correct, wrong, mins, secs, bestCombo,
    xpEarned, xpDisplayed, currRank, prevRank, rankedUp, unlocked, again,
  } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
  const time = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: M.ink, position: 'relative', overflow: 'hidden', paddingBottom: 28 }}>
      <MOrb size={300} style={{ position: 'absolute', top: -100, right: -90, filter: 'blur(40px)' }} />
      <MOrb size={240} style={{ position: 'absolute', top: 260, left: -90, filter: 'blur(36px)' }} />
      <MOrb size={200} style={{ position: 'absolute', top: 500, right: -80, filter: 'blur(34px)' }} />

      {rankedUp && (
        <div style={{ padding: '22px 20px 0', position: 'relative' }}>
          <MCard gloss style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, background: M.iridescent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 20px rgba(168,85,247,0.45)' }}>🎊</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: M.violet, fontWeight: 800, letterSpacing: 2 }}>★ RANK UP</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2, letterSpacing: '-0.02em' }}>{prevRank.tier.name} → <MText size={17}>{currRank.tier.name}</MText> {currRank.tier.emoji}</div>
            </div>
          </MCard>
        </div>
      )}

      {/* score hero */}
      <div style={{ padding: '14px 20px 0', position: 'relative' }}>
        <MCard gloss style={{ padding: '22px 18px 18px', textAlign: 'center' }}>
          <MOrb size={200} style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', filter: 'blur(28px)', opacity: 0.5 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 50, lineHeight: 1 }}>{pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : '💪'}</div>
            <div style={{ ...tnum, marginTop: 6, fontSize: 110, fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 1, background: M.iridescent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 4px 12px rgba(168,85,247,0.3))' }}>
              {pct}<span style={{ fontSize: 40 }}>%</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800 }}>{comment}</div>
            <div style={{ marginTop: 14, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              <MChip color={M.mint}>✓ {correct} 정답</MChip>
              <MChip>✗ {wrong}</MChip>
              <MChip color={M.cyan}>{time}</MChip>
              {bestCombo >= 3 && <MChip color={M.pink}>🔥 {bestCombo}</MChip>}
            </div>
          </div>
        </MCard>
      </div>

      {/* xp */}
      {xpEarned > 0 && (
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: M.inkSoft, fontWeight: 700, letterSpacing: 1 }}>이번 세션 + XP</div>
              <div style={{ ...tnum, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', background: M.iridescent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>+{xpDisplayed}</div>
            </div>
            <div style={{ marginTop: 10, height: 8, borderRadius: 4, background: M.hairSoft, overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(currRank.progress * 100)}%`, height: '100%', background: M.iridescent, borderRadius: 4 }} />
            </div>
            {currRank.next && (
              <div style={{ ...tnum, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: M.inkMute, fontWeight: 700 }}>
                <span>{currRank.tier.emoji} {currRank.tier.name} {data.totalXp.toLocaleString()}</span>
                <span>{currRank.next.name} {currRank.next.min.toLocaleString()}</span>
              </div>
            )}
          </MCard>
        </div>
      )}

      {/* badges */}
      {unlocked.map((a) => (
        <div key={a.id} style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #f59e0b, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 6px 16px rgba(236,72,153,0.4)' }}>{a.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: M.pink, fontWeight: 800, letterSpacing: 1.5 }}>NEW · 업적</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{a.name}</div>
            </div>
          </MCard>
        </div>
      ))}

      <div style={{ padding: '20px 20px 28px', position: 'relative' }}>
        <button onClick={again} style={{ width: '100%', padding: '16px 0', borderRadius: 18, border: 'none', background: M.iridescent, color: '#fff', fontSize: 15, fontWeight: 800, boxShadow: '0 14px 30px rgba(168,85,247,0.5)' }}>한 번 더</button>
      </div>
    </div>
  );
}
