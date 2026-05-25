import React from 'react';
import { G } from '../../../theme/decorations/palette';
import { GBlock, NeoSticker } from '../../../theme/decorations/neo';
import type { HomeData } from '../useHomeData';

const CANDY = [G.mint, G.sky, G.lavender, G.pink, G.mustard, G.orange];

// Direction G — 네오 브루탈리즘 Home.
export function HomeG({ data }: { data: HomeData }) {
  const {
    rank, totalXp, overallPct, totalSessions, totalQuestions,
    modes, weakItems, startMode, startWeakSession, goStats, goSettings, goBadges,
  } = data;
  const hasData = totalSessions > 0;

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: G.ink, paddingBottom: 28 }}>
      {/* masthead */}
      <div style={{ padding: '22px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NeoSticker bg={G.mustard} rot={-2}>EAR TRAINING ★</NeoSticker>
          <button
            onClick={goSettings}
            aria-label="설정"
            style={{ width: 36, height: 36, background: G.pink, border: G.border, boxShadow: G.shadowS, fontSize: 16 }}
          >
            ⚙
          </button>
        </div>
        <div style={{ marginTop: 16, fontSize: 52, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9 }}>
          음감<br />훈련{' '}
          <span style={{ display: 'inline-block', fontSize: 32, padding: '0 8px', background: G.lavender, border: G.border, transform: 'rotate(3deg)' }}>
            !
          </span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: G.inkSoft, fontWeight: 700 }}>매일 5분, 듣고 맞히고 약점 깨부수기.</div>
      </div>

      {/* rank */}
      {totalXp > 0 && (
        <div style={{ padding: '0 20px' }}>
          <GBlock bg={G.pink} sh={G.shadow} style={{ padding: 14, cursor: 'pointer' }} onClick={goBadges} role="button" aria-label="업적 열기">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 48, height: 48, background: G.mustard, border: G.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {rank.tier.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>현재 등급</div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>{rank.tier.name}</div>
              </div>
              <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>
                {totalXp.toLocaleString()} XP
              </div>
            </div>
            <div style={{ marginTop: 12, height: 16, background: G.card, border: G.border, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round(rank.progress * 100)}%`, background: G.mint, borderRight: G.border }} />
            </div>
          </GBlock>
        </div>
      )}

      {/* stats */}
      {hasData ? (
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {([['정답률', `${overallPct}`, '%', G.mint], ['세션', `${totalSessions}`, '', G.sky], ['문제', `${totalQuestions}`, '', G.lavender]] as const).map(
            ([l, v, u, c]) => (
              <GBlock key={l} bg={c} sh={G.shadowS} style={{ padding: '10px 10px 12px' }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>{l}</div>
                <div className="tabular-nums" style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', marginTop: 2, lineHeight: 1 }}>
                  {v}
                  <span style={{ fontSize: 12 }}>{u}</span>
                </div>
              </GBlock>
            ),
          )}
        </div>
      ) : (
        <div style={{ padding: '20px 20px 0' }}>
          <GBlock bg={G.mint} sh={G.shadowS} style={{ padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 34 }}>🎼</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900 }}>훈련을 시작해보세요</div>
          </GBlock>
        </div>
      )}

      {/* weakness */}
      {weakItems.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <GBlock bg={G.orange} style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: G.ink, color: G.mustard, padding: '4px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>⚡ 약점</div>
              <div style={{ flex: 1 }} />
              <button onClick={goStats} style={{ fontSize: 11, fontWeight: 900, color: G.ink, background: 'none', border: 'none' }}>전체 →</button>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {weakItems.map((w) => (
                <button
                  key={w.key + w.mode}
                  onClick={() => startWeakSession(w.mode)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: G.card, border: `2px solid ${G.ink}`, padding: '6px 10px', textAlign: 'left' }}
                >
                  <div style={{ fontSize: 9, fontWeight: 900, color: G.inkMute, width: 36 }}>{w.modeName}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 900 }}>{w.key}</div>
                  <div className="tabular-nums" style={{ fontSize: 14, fontWeight: 900, color: G.red }}>{Math.round(w.score * 100)}</div>
                </button>
              ))}
            </div>
          </GBlock>
        </div>
      )}

      {/* mode grid */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>훈련 모드</div>
          <div className="tabular-nums" style={{ background: G.mint, border: `2px solid ${G.ink}`, padding: '2px 6px', fontSize: 10, fontWeight: 900 }}>{modes.length}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {modes.map((m, i) => (
            <GBlock key={m.key} bg={CANDY[i % CANDY.length]} sh={G.shadowS} style={{ padding: 12, textAlign: 'left', cursor: 'pointer' }} onClick={() => startMode(m.key)} role="button" aria-label={`${m.name} 시작`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 26 }} aria-hidden>{m.emoji}</div>
                <div className="tabular-nums" style={{ fontSize: 11, fontWeight: 900, background: G.card, border: `2px solid ${G.ink}`, padding: '1px 6px' }}>
                  {m.pct !== null ? `${m.pct}%` : 'NEW'}
                </div>
              </div>
              <div style={{ marginTop: 6, fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' }}>{m.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>{m.description}</div>
            </GBlock>
          ))}
        </div>
      </div>

      {/* footer actions */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 10 }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ flex: 1, padding: '14px 0', textAlign: 'center', cursor: 'pointer' }} onClick={goStats} role="button">
          <div style={{ fontSize: 14, fontWeight: 900 }}>📊 통계</div>
        </GBlock>
        <GBlock bg={G.ink} sh="6px 6px 0 #ff5a8c" style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderColor: G.ink, cursor: 'pointer' }} onClick={goSettings} role="button">
          <div style={{ fontSize: 14, fontWeight: 900, color: G.mustard }}>⚙ 설정</div>
        </GBlock>
      </div>
    </div>
  );
}
