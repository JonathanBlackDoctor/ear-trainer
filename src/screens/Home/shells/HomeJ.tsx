import React from 'react';
import { J } from '../../../theme/decorations/palette';
import { JReel, JStripes, JSticker } from '../../../theme/decorations/cassette';
import type { HomeData } from '../useHomeData';

const TRACK_COLORS = [J.pink, J.teal, J.yellow];

// Direction J — 카세트 테이프 Home.
export function HomeJ({ data }: { data: HomeData }) {
  const {
    rank, totalXp, overallPct, totalSessions, totalQuestions,
    modes, startMode, goStats, goSettings, goBadges, goBattle,
  } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: J.ink }}>
      <JStripes h={10} />

      {/* masthead */}
      <div style={{ padding: '18px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <JSticker bg={J.teal} rot={-3}>★ MIXTAPE</JSticker>
          <JSticker bg={J.yellow} rot={2}>SIDE A</JSticker>
        </div>
        <div style={{ marginTop: 14, fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95 }}>
          음감 훈련<span style={{ color: J.pink }}>♪</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: J.inkSoft, fontWeight: 700 }}>듣고 · 맞히고 · 다시 감기</div>
      </div>

      {/* 1대1 대결 */}
      <div style={{ padding: '0 20px 16px' }}>
        <button
          onClick={goBattle}
          aria-label="온라인 1대1 대결 시작"
          style={{ ...tnum, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: J.pink, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}`, color: '#fff', textAlign: 'left' }}
        >
          <div style={{ width: 40, height: 40, background: J.yellow, border: `2px solid ${J.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }} aria-hidden>⚔️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.01em' }}>친구와 1대1 대결</div>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginTop: 2 }}>같은 문제로 실시간 청음 대결</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900 }} aria-hidden>►►</div>
        </button>
      </div>

      {/* cassette body rank card */}
      {totalXp > 0 && (
        <div style={{ padding: '0 20px' }}>
          <div onClick={goBadges} role="button" aria-label="업적 열기" style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, padding: 14, boxShadow: `4px 4px 0 ${J.ink}`, position: 'relative', cursor: 'pointer' }}>
            {[[6, 6], [6, 'auto'], ['auto', 6], ['auto', 'auto']].map((p, i) => (
              <div key={i} style={{ position: 'absolute', top: p[0] === 'auto' ? 'auto' : p[0], bottom: p[0] === 'auto' ? 6 : 'auto', left: p[1] === 'auto' ? 'auto' : p[1], right: p[1] === 'auto' ? 6 : 'auto', width: 6, height: 6, borderRadius: '50%', background: J.ink }} />
            ))}
            <div style={{ background: '#2a1c2f', border: `2px solid ${J.ink}`, borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <JReel hubColor={J.pink} />
              <div style={{ flex: 1, height: 3, background: J.pink, margin: '0 10px' }} />
              <JReel hubColor={J.teal} />
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 11, color: J.pinkDeep, fontWeight: 900, letterSpacing: 1.5 }}>NOW PLAYING ►</div>
              <div style={{ flex: 1 }} />
              <div style={{ ...tnum, fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' }}>{rank.tier.emoji} {totalXp.toLocaleString()} XP</div>
            </div>
            <div style={{ marginTop: 6, height: 10, background: '#fff', border: `2px solid ${J.ink}`, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round(rank.progress * 100)}%`, background: J.pink, borderRight: `2px solid ${J.ink}` }} />
            </div>
          </div>
        </div>
      )}

      {/* VU-style stats */}
      {totalSessions > 0 && (
        <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {([['ACC', `${overallPct}`, '%', J.pink], ['REC', `${totalSessions}`, '', J.teal], ['QTY', `${totalQuestions}`, '', J.yellow]] as const).map(
            ([l, v, u, c]) => (
              <div key={l} style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `2px 2px 0 ${J.ink}`, padding: '8px 10px 10px' }}>
                <div style={{ ...tnum, fontSize: 9, color: J.inkMute, fontWeight: 900, letterSpacing: 1 }}>{l}</div>
                <div style={{ ...tnum, fontSize: 24, fontWeight: 900, color: c, letterSpacing: '-0.03em', marginTop: 2 }}>
                  {v}
                  <span style={{ fontSize: 12, color: J.ink }}>{u}</span>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* track list (modes) */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ background: J.ink, color: J.yellow, padding: '3px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>TRACK LIST</div>
          <div style={{ flex: 1, height: 2, background: J.ink }} />
        </div>
        <div style={{ background: J.card, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}` }}>
          {modes.map((m, i) => (
            <button
              key={m.key}
              onClick={() => startMode(m.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: i < modes.length - 1 ? `1.5px solid ${J.ink}` : 'none', background: i % 2 === 0 ? J.card : '#fff8eb', borderLeft: 'none', borderRight: 'none', borderTop: 'none', textAlign: 'left' }}
            >
              <div style={{ ...tnum, fontSize: 10, color: J.inkMute, fontWeight: 900, width: 24 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: 20 }} aria-hidden>{m.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.01em' }}>{m.name}</div>
                <div style={{ fontSize: 10, color: J.inkMute, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</div>
              </div>
              <div style={{ width: 44, height: 4, background: '#fff', border: `1.5px solid ${J.ink}` }}>
                <div style={{ width: `${m.pct ?? 0}%`, height: '100%', background: TRACK_COLORS[i % TRACK_COLORS.length] }} />
              </div>
              <div style={{ ...tnum, width: 28, fontSize: 11, fontWeight: 900, textAlign: 'right' }}>{m.pct ?? '–'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* transport buttons */}
      <div style={{ padding: '18px 20px 24px' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}`, padding: 10, display: 'flex', gap: 6 }}>
          {([['◀◀', 'STATS', goStats], ['▶', 'PLAY', () => startMode(modes[0].key)], ['◾', 'STOP', undefined], ['⚙', 'CONFIG', goSettings]] as const).map(
            ([sym, l, onClick], idx) => (
              <button
                key={l}
                onClick={onClick}
                disabled={!onClick}
                style={{ ...tnum, flex: 1, padding: '10px 0', border: `2px solid ${J.ink}`, background: idx === 1 ? J.pink : J.card, color: idx === 1 ? '#fff' : J.ink, fontSize: 11, fontWeight: 900, letterSpacing: 1, opacity: onClick ? 1 : 0.45 }}
              >
                <div style={{ fontSize: 14 }}>{sym}</div>
                {l}
              </button>
            ),
          )}
        </div>
      </div>
      <JStripes h={10} c1={J.teal} c2={J.pink} />
    </div>
  );
}
