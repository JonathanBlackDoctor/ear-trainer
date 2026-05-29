import React from 'react';
import { I } from '../../../theme/decorations/palette';
import { ICorners, IField } from '../../../theme/decorations/grid';
import type { HomeData } from '../useHomeData';

// Direction I — 모눈 / 데이터 Home. Dashboard + lab-sheet table.
export function HomeI({ data }: { data: HomeData }) {
  const {
    rank, totalXp, overallPct, totalSessions, totalQuestions,
    modes, weakItems, startMode, startWeakSession, goStats, goSettings, goBattle,
  } = data;
  const mono: React.CSSProperties = { fontVariantNumeric: 'tabular-nums slashed-zero' };

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: I.ink, paddingBottom: 24 }}>
      {/* masthead */}
      <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${I.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 700, letterSpacing: 1.5 }}>
            SESS·{String(totalSessions).padStart(3, '0')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: I.lime }} />
            <div style={{ ...mono, fontSize: 10, color: I.lime, fontWeight: 800, letterSpacing: 1 }}>READY</div>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
          음감 훈련 <span style={{ ...mono, fontSize: 18, color: I.inkMute, fontWeight: 600 }}>/ v4.2</span>
        </div>
      </div>

      {/* 1대1 대결 */}
      <div style={{ padding: '14px 20px 0' }}>
        <button
          onClick={goBattle}
          aria-label="온라인 1대1 대결 시작"
          style={{ ...mono, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: I.ink, border: `1px solid ${I.ink}`, color: I.card, textAlign: 'left' }}
        >
          <div style={{ fontSize: 20 }} aria-hidden>⚔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>VERSUS · 1대1 대결</div>
            <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, marginTop: 2, letterSpacing: 0.5 }}>같은 문제로 실시간 청음 대결</div>
          </div>
          <div style={{ fontSize: 16, color: I.lime, fontWeight: 800 }} aria-hidden>→</div>
        </button>
      </div>

      {/* 2x2 KPI dashboard */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
          <ICorners />
          <div style={{ padding: 14, borderRight: `1px solid ${I.hair}`, borderBottom: `1px solid ${I.hair}` }}>
            <IField label="ACC · 정답률" value={`${overallPct}%`} valueColor={I.lime} size="lg" />
          </div>
          <div style={{ padding: 14, borderBottom: `1px solid ${I.hair}` }}>
            <IField label="XP · 누적" value={totalXp.toLocaleString()} size="lg" />
            <div style={{ ...mono, fontSize: 9, color: I.inkMute, fontWeight: 600, marginTop: 2 }}>
              RANK · {rank.tier.name.toUpperCase()}{rank.next ? ` · ${Math.round(rank.progress * 100)}%→${rank.next.name.toUpperCase()}` : ''}
            </div>
          </div>
          <div style={{ padding: 14, borderRight: `1px solid ${I.hair}` }}>
            <IField label="N · 세션" value={`${totalSessions}`} size="md" />
          </div>
          <div style={{ padding: 14 }}>
            <IField label="ΣQ · 문제 수" value={`${totalQuestions}`} size="md" />
          </div>
        </div>
        {/* rank bar with tick marks */}
        {rank.next && (
          <div style={{ marginTop: 8, background: I.card, border: `1px solid ${I.hair}`, padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 700, letterSpacing: 1, width: 40 }}>0</div>
              <div style={{ flex: 1, height: 4, background: I.inset, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.round(rank.progress * 100)}%`, background: I.lime }} />
                {[20, 40, 60, 80].map((p) => (
                  <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -2, bottom: -2, width: 1, background: I.hairDark }} />
                ))}
              </div>
              <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 700, width: 56, textAlign: 'right' }}>{rank.next.name}</div>
            </div>
          </div>
        )}
      </div>

      {/* mode table */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ ...mono, fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>TABLE · 훈련 모드</div>
          <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 700 }}>n={modes.length}</div>
        </div>
        <div style={{ background: I.card, border: `1px solid ${I.hairDark}` }}>
          <div style={{ ...mono, display: 'grid', gridTemplateColumns: '24px 1fr 60px', gap: 8, padding: '6px 12px', fontSize: 9, fontWeight: 800, color: I.inkMute, borderBottom: `1px solid ${I.hair}`, letterSpacing: 1, background: I.inset }}>
            <div>#</div>
            <div>MODE</div>
            <div style={{ textAlign: 'right' }}>ACC</div>
          </div>
          {modes.map((m, i) => (
            <button
              key={m.key}
              onClick={() => startMode(m.key)}
              style={{ width: '100%', display: 'grid', gridTemplateColumns: '24px 1fr 60px', gap: 8, padding: '9px 12px', alignItems: 'center', borderBottom: i < modes.length - 1 ? `1px solid ${I.hair}` : 'none', background: I.card, border: 'none', textAlign: 'left' }}
            >
              <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 16 }} aria-hidden>{m.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
              </div>
              <div style={{ ...mono, fontSize: 13, fontWeight: 800, textAlign: 'right', letterSpacing: '-0.02em', color: m.pct === null ? I.inkMute : m.pct >= 80 ? I.lime : m.pct >= 60 ? I.amber : I.signal }}>
                {m.pct !== null ? `${m.pct}%` : '—'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* weakness alert */}
      {weakItems.length > 0 && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.signal}`, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ ...mono, fontSize: 10, fontWeight: 800, color: I.signal, letterSpacing: 1.5, background: '#fee2e2', padding: '2px 6px' }}>ALERT · 약점</div>
              <div style={{ flex: 1 }} />
              <button onClick={goStats} style={{ fontSize: 10, color: I.signal, fontWeight: 700, background: 'none', border: 'none' }}>전체 →</button>
            </div>
            <div style={{ ...mono, marginTop: 8, display: 'grid', gridTemplateColumns: '54px 1fr 50px', gap: 6, fontSize: 12 }}>
              {weakItems.map((w) => (
                <React.Fragment key={w.key + w.mode}>
                  <button onClick={() => startWeakSession(w.mode)} style={{ fontSize: 10, color: I.inkMute, fontWeight: 700, paddingTop: 1, background: 'none', border: 'none', textAlign: 'left' }}>{w.modeName}</button>
                  <div style={{ fontWeight: 700 }}>{w.key}</div>
                  <div style={{ color: I.signal, fontWeight: 800, textAlign: 'right' }}>{Math.round(w.score * 100)}%</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* footer */}
      <div style={{ padding: '16px 20px 24px', display: 'flex', gap: 8 }}>
        <button onClick={goStats} style={{ ...mono, flex: 1, padding: '12px 0', border: `1px solid ${I.hairDark}`, background: I.card, color: I.ink, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>📊 STATS</button>
        <button onClick={goSettings} style={{ ...mono, flex: 1, padding: '12px 0', border: `1px solid ${I.ink}`, background: I.ink, color: I.card, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>⚙ CONFIG</button>
      </div>
    </div>
  );
}
