import React, { useState } from 'react';
import { MAX_LEVEL, getLevelLabel } from '../../../modes/levels';
import { J } from '../../../theme/decorations/palette';
import { JReel, JStripes, JSticker } from '../../../theme/decorations/cassette';
import type { TrainSetupProps } from '../index';

export function SetupJ({
  modeKey, modeInfo, isWeakSession, totalQuestions, questionOptions, setTotalQuestions, level, setLevel,
  isProgression, progressionSource, setProgressionSource,
  loading, onStart, onBack,
}: TrainSetupProps) {
  const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
  const maxLevel = modeInfo.maxLevel ?? MAX_LEVEL;
  const [showTheory, setShowTheory] = useState(false);

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: J.ink, paddingBottom: 24 }}>
      <JStripes h={8} />
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} aria-label="뒤로" style={{ width: 36, height: 36, border: `2px solid ${J.ink}`, background: J.card, fontSize: 16, boxShadow: `2px 2px 0 ${J.ink}` }}>◀</button>
        <JSticker bg={J.teal} rot={-2}>SETUP</JSticker>
      </div>

      {/* cassette-label hero */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ background: J.yellow, border: `2.5px solid ${J.ink}`, boxShadow: `5px 5px 0 ${J.ink}`, padding: 16, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, right: 12 }}><JReel size={36} hubColor={J.pink} /></div>
          <div style={{ ...tnum, fontSize: 10, color: J.pinkDeep, fontWeight: 900, letterSpacing: 2 }}>TRACK · {modeKey.toUpperCase()}</div>
          <div style={{ marginTop: 4, fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{modeInfo.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{modeInfo.description}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            {isWeakSession && <JSticker bg={J.pink} rot={-2}>⚡ FOCUS</JSticker>}
            <JSticker bg={J.card} rot={1}>{totalQuestions} 곡</JSticker>
          </div>
        </div>
      </div>

      {modeInfo.howTo && (
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: '12px 14px' }}>
            <div style={{ ...tnum, fontSize: 9, color: J.pinkDeep, fontWeight: 900, letterSpacing: 2 }}>// LINER NOTES</div>
            <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.55, fontWeight: 700 }}>{modeInfo.howTo}</div>
          </div>
        </div>
      )}

      {modeInfo.theory && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: '12px 14px' }}>
            <button onClick={() => setShowTheory((v) => !v)} aria-expanded={showTheory} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <span style={{ ...tnum, fontSize: 9, color: J.tealDeep, fontWeight: 900, letterSpacing: 2 }}>// 음악 개념</span>
              <span style={{ fontSize: 14, fontWeight: 900, transform: showTheory ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} aria-hidden>▾</span>
            </button>
            {showTheory && <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.55, fontWeight: 700 }}>{modeInfo.theory}</div>}
          </div>
        </div>
      )}

      {/* level dial */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}`, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ background: J.ink, color: J.yellow, padding: '3px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>LEVEL</div>
            <div style={{ flex: 1 }} />
            <div style={{ ...tnum, fontSize: 12, fontWeight: 900, color: J.pinkDeep }}>Lv {String(level).padStart(2, '0')} · {getLevelLabel(modeKey, level)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map((n) => {
              const active = n === level;
              const done = n < level;
              return (
                <button key={n} onClick={() => setLevel(n)} aria-label={`레벨 ${n}`} style={{ ...tnum, height: 44, border: `2px solid ${J.ink}`, fontSize: 14, fontWeight: 900, background: active ? J.pink : done ? '#ffe1f1' : J.card, color: active ? '#fff' : J.ink, boxShadow: active ? `2px 2px 0 ${J.ink}` : 'none' }}>{n}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}`, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ background: J.ink, color: J.yellow, padding: '3px 8px', fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>곡 수</div>
            <div style={{ flex: 1 }} />
            <div style={{ ...tnum, fontSize: 12, fontWeight: 900, color: J.pinkDeep }}>{totalQuestions} 곡</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${questionOptions.length}, 1fr)`, gap: 6 }}>
            {questionOptions.map((n) => {
              const active = n === totalQuestions;
              return (
                <button key={n} onClick={() => setTotalQuestions(n)} aria-label={`${n}문항`} aria-pressed={active} style={{ ...tnum, height: 44, border: `2px solid ${J.ink}`, fontSize: 14, fontWeight: 900, background: active ? J.pink : J.card, color: active ? '#fff' : J.ink, boxShadow: active ? `2px 2px 0 ${J.ink}` : 'none' }}>{n}</button>
              );
            })}
          </div>
        </div>
      </div>

      {isProgression && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: J.card, border: `2px solid ${J.ink}`, boxShadow: `3px 3px 0 ${J.ink}`, padding: 12 }}>
            <div style={{ ...tnum, fontSize: 10, fontWeight: 900, letterSpacing: 1.5, marginBottom: 8 }}>SOURCE</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([{ value: 'diatonic', label: '일반' }, { value: 'praise', label: '🙏 찬양' }] as const).map((opt) => (
                <button key={opt.value} onClick={() => setProgressionSource(opt.value)} style={{ flex: 1, padding: '10px 0', border: `2px solid ${J.ink}`, background: progressionSource === opt.value ? J.pink : J.card, color: progressionSource === opt.value ? '#fff' : J.ink, fontSize: 13, fontWeight: 900 }}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 20px 24px' }}>
        <button onClick={onStart} disabled={loading} style={{ width: '100%', padding: '18px 0', border: `2.5px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 17, fontWeight: 900, letterSpacing: '-0.01em', boxShadow: `5px 5px 0 ${J.ink}`, opacity: loading ? 0.7 : 1 }}>{loading ? '⏳ 소리 준비 중…' : '▶  PLAY / 시작하기'}</button>
      </div>
    </div>
  );
}
