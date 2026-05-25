import React, { useState } from 'react';
import { MAX_LEVEL, getLevelLabel } from '../../../modes/levels';
import { G } from '../../../theme/decorations/palette';
import { GBlock, NeoSticker } from '../../../theme/decorations/neo';
import type { TrainSetupProps } from '../index';

export function SetupG({
  modeKey, modeInfo, isWeakSession, totalQuestions, questionOptions, setTotalQuestions, level, setLevel,
  isProgression, progressionSource, setProgressionSource,
  loading, onStart, onBack,
}: TrainSetupProps) {
  const maxLevel = modeInfo.maxLevel ?? MAX_LEVEL;
  const [showTheory, setShowTheory] = useState(false);
  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: G.ink, paddingBottom: 28 }}>
      <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <GBlock bg={G.card} sh="3px 3px 0 #0a0a0a" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }} onClick={onBack} role="button" aria-label="뒤로">←</GBlock>
        <NeoSticker bg={G.mustard} rot={0} style={{ letterSpacing: 2 }}>SETUP</NeoSticker>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <GBlock bg={G.mint} sh={G.shadowL} style={{ padding: '20px 18px' }}>
          <div style={{ fontSize: 56, lineHeight: 1 }} aria-hidden>{modeInfo.emoji}</div>
          <div style={{ marginTop: 8, fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95 }}>{modeInfo.name}</div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700 }}>{modeInfo.description}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            {isWeakSession && <div style={{ background: G.ink, color: G.mustard, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>⚡ 약점 집중</div>}
            <div style={{ background: G.card, border: `2px solid ${G.ink}`, padding: '4px 10px', fontSize: 11, fontWeight: 900 }}>{totalQuestions} 문항</div>
          </div>
        </GBlock>
      </div>

      {modeInfo.howTo && (
        <div style={{ padding: '22px 20px 0' }}>
          <GBlock bg={G.card} sh={G.shadowS} style={{ padding: 14 }}>
            <NeoSticker bg={G.lavender} rot={0} style={{ border: `2px solid ${G.ink}`, padding: '2px 8px', fontSize: 10, letterSpacing: 1 }}>사용법</NeoSticker>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>{modeInfo.howTo}</div>
          </GBlock>
        </div>
      )}

      {modeInfo.theory && (
        <div style={{ padding: '14px 20px 0' }}>
          <GBlock bg={G.card} sh={G.shadowS} style={{ padding: 14 }}>
            <button onClick={() => setShowTheory((v) => !v)} aria-expanded={showTheory} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <NeoSticker bg={G.sky} rot={0} style={{ border: `2px solid ${G.ink}`, padding: '2px 8px', fontSize: 10, letterSpacing: 1 }}>음악 개념</NeoSticker>
              <span style={{ fontSize: 16, fontWeight: 900, transform: showTheory ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} aria-hidden>▾</span>
            </button>
            {showTheory && <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>{modeInfo.theory}</div>}
          </GBlock>
        </div>
      )}

      <div style={{ padding: '20px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 900 }}>레벨</div>
            <div style={{ flex: 1 }} />
            <div style={{ background: G.pink, border: `2px solid ${G.ink}`, padding: '2px 8px', fontSize: 10, fontWeight: 900 }}>Lv {level} · {getLevelLabel(modeKey, level)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map((n) => {
              const active = n === level;
              const done = n < level;
              return (
                <button
                  key={n}
                  onClick={() => setLevel(n)}
                  aria-label={`레벨 ${n}`}
                  style={{ fontVariantNumeric: 'tabular-nums', height: 46, fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em', border: `2.5px solid ${G.ink}`, background: active ? G.ink : done ? G.mint : G.card, color: active ? G.mustard : G.ink, boxShadow: active ? '3px 3px 0 #ff5a8c' : 'none' }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </GBlock>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <GBlock bg={G.card} sh={G.shadowS} style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 900 }}>문항</div>
            <div style={{ flex: 1 }} />
            <div style={{ background: G.sky, border: `2px solid ${G.ink}`, padding: '2px 8px', fontSize: 10, fontWeight: 900 }}>{totalQuestions} 문항</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${questionOptions.length}, 1fr)`, gap: 6 }}>
            {questionOptions.map((n) => {
              const active = n === totalQuestions;
              return (
                <button
                  key={n}
                  onClick={() => setTotalQuestions(n)}
                  aria-label={`${n}문항`}
                  aria-pressed={active}
                  style={{ fontVariantNumeric: 'tabular-nums', height: 46, fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em', border: `2.5px solid ${G.ink}`, background: active ? G.ink : G.card, color: active ? G.mustard : G.ink, boxShadow: active ? '3px 3px 0 #ff5a8c' : 'none' }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </GBlock>
      </div>

      {isProgression && (
        <div style={{ padding: '14px 20px 0' }}>
          <GBlock bg={G.card} sh={G.shadowS} style={{ padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 10 }}>출제 소스</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([{ value: 'diatonic', label: '일반' }, { value: 'praise', label: '🙏 찬양' }] as const).map((opt) => (
                <button key={opt.value} onClick={() => setProgressionSource(opt.value)} style={{ flex: 1, padding: '10px 0', border: `2.5px solid ${G.ink}`, background: progressionSource === opt.value ? G.ink : G.card, color: progressionSource === opt.value ? G.mustard : G.ink, fontSize: 13, fontWeight: 900 }}>{opt.label}</button>
              ))}
            </div>
          </GBlock>
        </div>
      )}

      <div style={{ padding: '22px 20px 0' }}>
        <GBlock bg={G.pink} sh={G.shadowL} style={{ padding: '20px 0', textAlign: 'center', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }} onClick={loading ? undefined : onStart} role="button">
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{loading ? '🎵 소리 준비 중…' : `${modeInfo.emoji}  시작하기  →`}</div>
        </GBlock>
        <div style={{ marginTop: 10, fontSize: 11, color: G.inkMute, textAlign: 'center', fontWeight: 700 }}>첫 시작 시 피아노 샘플을 불러옵니다</div>
      </div>
    </div>
  );
}
