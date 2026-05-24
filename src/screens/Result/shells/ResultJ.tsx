import React from 'react';
import { J } from '../../../theme/decorations/palette';
import { JReel, JStripes, JSticker } from '../../../theme/decorations/cassette';
import type { ResultData } from '../useResultData';

export function ResultJ({ data }: { data: ResultData }) {
  const {
    pct, correct, wrong, mins, secs, bestCombo,
    xpEarned, xpDisplayed, currRank, prevRank, rankedUp, unlocked, weakSummary, again,
  } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
  const time = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: J.ink, paddingBottom: 24 }}>
      <JStripes h={10} c1={J.pink} c2={J.yellow} />

      {rankedUp && (
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ background: J.pink, border: `2.5px solid ${J.ink}`, padding: '12px 14px', boxShadow: `4px 4px 0 ${J.ink}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 28 }}>🎊</div>
            <div style={{ flex: 1, color: '#fff' }}>
              <div style={{ ...tnum, fontSize: 10, fontWeight: 900, letterSpacing: 2, color: J.yellow }}>★ SIDE B UNLOCKED ★</div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', marginTop: 2 }}>{prevRank.tier.name} → {currRank.tier.name} {currRank.tier.emoji}</div>
            </div>
          </div>
        </div>
      )}

      {/* big score */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.yellow, border: `2.5px solid ${J.ink}`, padding: '20px 16px', boxShadow: `6px 6px 0 ${J.ink}`, textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, left: 12 }}><JReel size={28} /></div>
          <div style={{ position: 'absolute', top: 12, right: 12 }}><JReel size={28} hubColor={J.teal} /></div>
          <div style={{ fontSize: 46, lineHeight: 1 }}>{pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : '💪'}</div>
          <div style={{ ...tnum, marginTop: 4, fontSize: 96, fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.9 }}>
            {pct}<span style={{ fontSize: 30, color: J.pinkDeep }}>%</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900 }}>{pct >= 90 ? '완벽한 한 곡!' : '다시 감기 한 번!'}</div>
        </div>
      </div>

      {/* stats */}
      <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
        {([['✓', `${correct}`, J.teal], ['✗', `${wrong}`, J.pink], ['🔥', `${bestCombo}`, J.pink], ['⏱', time, J.teal]] as const).map(
          ([l, v, c], i) => (
            <div key={i} style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `2px 2px 0 ${J.ink}`, padding: '8px 4px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16 }}>{l}</div>
              <div style={{ ...tnum, fontSize: 18, fontWeight: 900, color: c, letterSpacing: '-0.02em', marginTop: 2 }}>{v}</div>
            </div>
          ),
        )}
      </div>

      {/* xp */}
      {xpEarned > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: J.teal, border: `2.5px solid ${J.ink}`, padding: '12px 14px', boxShadow: `4px 4px 0 ${J.ink}` }}>
            <div style={{ ...tnum, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>+ XP BONUS</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>+{xpDisplayed}</div>
            </div>
            <div style={{ marginTop: 10, height: 12, background: J.card, border: `2px solid ${J.ink}` }}>
              <div style={{ width: `${Math.round(currRank.progress * 100)}%`, height: '100%', background: J.yellow, borderRight: `2px solid ${J.ink}` }} />
            </div>
          </div>
        </div>
      )}

      {/* badges */}
      {unlocked.map((a) => (
        <div key={a.id} style={{ padding: '14px 20px 0' }}>
          <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: J.pink, border: `2px solid ${J.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{a.emoji}</div>
            <div style={{ flex: 1 }}>
              <JSticker bg={J.yellow} rot={-2}>NEW</JSticker>
              <div style={{ fontSize: 14, fontWeight: 900, marginTop: 4 }}>{a.name}</div>
            </div>
          </div>
        </div>
      ))}

      {weakSummary && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <JSticker bg={J.yellow} rot={-2}>⚡ 약점</JSticker>
            <div style={{ ...tnum, fontSize: 13, fontWeight: 900 }}>{weakSummary.practiced}개 연습 · {weakSummary.improved}개 향상</div>
          </div>
        </div>
      )}

      <div style={{ padding: '18px 20px 24px' }}>
        <button onClick={again} style={{ width: '100%', padding: '14px 0', border: `2.5px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 14, fontWeight: 900, boxShadow: `4px 4px 0 ${J.ink}` }}>◁◁ REW · 한 번 더</button>
      </div>
    </div>
  );
}
