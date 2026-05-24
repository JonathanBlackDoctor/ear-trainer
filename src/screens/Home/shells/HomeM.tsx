import React from 'react';
import { M, M_MODE_GRADIENTS } from '../../../theme/decorations/palette';
import { MCard, MText, MOrb } from '../../../theme/decorations/aurora';
import type { HomeData } from '../useHomeData';

const WEAK_COLORS = [M.pink, M.violet, M.amber];

// Direction M — 오로라 / 홀로그래픽 Home.
export function HomeM({ data }: { data: HomeData }) {
  const {
    rank, totalXp, overallPct, totalSessions, totalQuestions,
    modes, weakItems, startMode, startWeakSession, goStats, goSettings, goBadges,
  } = data;
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: M.ink, position: 'relative', overflow: 'hidden', paddingBottom: 24 }}>
      <MOrb size={180} style={{ position: 'absolute', top: -60, right: -40, filter: 'blur(30px)', opacity: 0.6 }} />
      <MOrb size={140} style={{ position: 'absolute', top: 280, left: -40, filter: 'blur(28px)', opacity: 0.5 }} />

      {/* masthead */}
      <div style={{ padding: '22px 20px 16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: M.violet, fontWeight: 800, letterSpacing: 3 }}>✦ EAR · TRAINING</div>
          <button onClick={goSettings} aria-label="설정" style={{ width: 38, height: 38, borderRadius: 14, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: 18, border: '1px solid rgba(255,255,255,0.9)' }}>⚙</button>
        </div>
        <div style={{ marginTop: 14, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          오늘도 <MText size={30}>다섯 분</MText>
        </div>
      </div>

      {/* iridescent rank card */}
      {totalXp > 0 && (
        <div style={{ padding: '0 20px', position: 'relative' }}>
          <MCard gloss style={{ padding: 0, cursor: 'pointer' }} onClick={goBadges} role="button" aria-label="업적 열기">
            <div style={{ background: M.iridescent, padding: 16, color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, opacity: 0.92 }}>현재 등급</div>
                <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.92 }}>{rank.tier.emoji} {rank.tier.name}</div>
              </div>
              <div style={{ ...tnum, marginTop: 4, fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 1px 4px rgba(26,31,58,0.15)' }}>
                {totalXp.toLocaleString()} XP
              </div>
              <div style={{ marginTop: 14, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(rank.progress * 100)}%`, height: '100%', background: '#fff', borderRadius: 3 }} />
              </div>
              {rank.next && (
                <div style={{ ...tnum, marginTop: 6, fontSize: 11, opacity: 0.95, fontWeight: 700 }}>
                  {rank.next.emoji} {rank.next.name}까지 {rank.xpToNext.toLocaleString()} XP
                </div>
              )}
            </div>
          </MCard>
        </div>
      )}

      {/* summary 3-col */}
      {totalSessions > 0 && (
        <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, position: 'relative' }}>
          {([['정답률', `${overallPct}`, '%', M.cyan], ['세션', `${totalSessions}`, '', M.violet], ['문제', `${totalQuestions}`, '', M.mint]] as const).map(
            ([l, v, u, c]) => (
              <MCard key={l} style={{ padding: '12px 10px 14px' }}>
                <div style={{ fontSize: 10, color: M.inkMute, fontWeight: 700, letterSpacing: 0.5 }}>{l}</div>
                <div style={{ ...tnum, fontSize: 24, fontWeight: 800, color: c, letterSpacing: '-0.03em', marginTop: 4, lineHeight: 1 }}>
                  {v}
                  <span style={{ fontSize: 12, color: M.inkSoft }}>{u}</span>
                </div>
              </MCard>
            ),
          )}
        </div>
      )}

      {/* weakness */}
      {weakItems.length > 0 && (
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 14 }} aria-hidden>✦</div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>오늘의 약점</div>
              <div style={{ flex: 1 }} />
              <button onClick={goStats} style={{ fontSize: 11, color: M.pink, fontWeight: 700, background: 'none', border: 'none' }}>전체 →</button>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weakItems.map((w, i) => {
                const c = WEAK_COLORS[i % WEAK_COLORS.length];
                return (
                  <button key={w.key + w.mode} onClick={() => startWeakSession(w.mode)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', textAlign: 'left', padding: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}99` }} />
                    <div style={{ width: 36, fontSize: 10, color: M.inkMute, fontWeight: 700 }}>{w.modeName}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{w.key}</div>
                    <div style={{ ...tnum, fontSize: 13, fontWeight: 800, color: c }}>{Math.round(w.score * 100)}%</div>
                  </button>
                );
              })}
            </div>
          </MCard>
        </div>
      )}

      {/* mode grid */}
      <div style={{ padding: '16px 20px 0', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>훈련 모드</div>
          <div style={{ fontSize: 11, color: M.inkMute, fontWeight: 700 }}>{modes.length} 모드</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {modes.map((m, i) => {
            const grad = M_MODE_GRADIENTS[i % M_MODE_GRADIENTS.length];
            return (
              <MCard key={m.key} style={{ padding: 14, cursor: 'pointer' }} onClick={() => startMode(m.key)} role="button" aria-label={`${m.name} 시작`}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(168,85,247,0.25)' }} aria-hidden>
                  {m.emoji}
                </div>
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>{m.name}</div>
                <div style={{ fontSize: 10.5, color: M.inkMute, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: M.hairSoft, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.pct ?? 0}%`, background: grad, borderRadius: 2 }} />
                  </div>
                  <div style={{ ...tnum, fontSize: 10, color: M.inkSoft, fontWeight: 800 }}>{m.pct !== null ? `${m.pct}%` : '–'}</div>
                </div>
              </MCard>
            );
          })}
        </div>
      </div>

      {/* tab bar */}
      <div style={{ padding: '20px 20px 24px', position: 'relative' }}>
        <MCard style={{ padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          {([['🏠', '홈', undefined, true], ['📊', '통계', goStats, false], ['🏆', '업적', goBadges, false]] as const).map(
            ([icon, label, onClick, active]) => (
              <button
                key={label}
                onClick={onClick}
                style={{ padding: '10px 0', borderRadius: 16, border: 'none', background: active ? M.iridescent : 'transparent', color: active ? '#fff' : M.inkSoft, fontSize: 11, fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, boxShadow: active ? '0 6px 16px rgba(168,85,247,0.35)' : 'none' }}
              >
                <span style={{ fontSize: 18 }} aria-hidden>{icon}</span>
                <span>{label}</span>
              </button>
            ),
          )}
        </MCard>
      </div>
    </div>
  );
}
