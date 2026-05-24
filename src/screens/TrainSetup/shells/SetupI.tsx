import React, { useState } from 'react';
import { MAX_LEVEL, getLevelLabel } from '../../../modes/levels';
import { I } from '../../../theme/decorations/palette';
import { ICorners, IChip } from '../../../theme/decorations/grid';
import type { TrainSetupProps } from '../index';

export function SetupI({
  modeKey, modeInfo, isWeakSession, totalQuestions, level, setLevel,
  showAbsoluteToggle, absoluteMode, setAbsoluteMode,
  isProgression, progressionSource, setProgressionSource,
  loading, onStart, onBack,
}: TrainSetupProps) {
  const mono: React.CSSProperties = { fontVariantNumeric: 'tabular-nums slashed-zero' };
  const maxLevel = modeInfo.maxLevel ?? MAX_LEVEL;
  const [showTheory, setShowTheory] = useState(false);

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: I.ink, paddingBottom: 24 }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${I.hair}` }}>
        <button onClick={onBack} aria-label="뒤로" style={{ width: 28, height: 28, border: `1px solid ${I.hairDark}`, background: I.card, fontSize: 14 }}>←</button>
        <div style={{ ...mono, fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>SETUP · {modeKey}</div>
      </div>

      {/* hero spec card */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '16px 14px', position: 'relative' }}>
          <ICorners />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 80, height: 80, border: `1.5px solid ${I.lime}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, background: I.limeSoft }} aria-hidden>{modeInfo.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...mono, fontSize: 10, color: I.lime, fontWeight: 800, letterSpacing: 1.5 }}>MODE · {modeKey}</div>
              <div style={{ marginTop: 2, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{modeInfo.name}</div>
              <div style={{ fontSize: 11, color: I.inkSoft, marginTop: 2 }}>{modeInfo.description}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {isWeakSession && <IChip color={I.signal}>⚡ FOCUS · 약점</IChip>}
            <IChip color={I.cyan}>N={totalQuestions}</IChip>
          </div>
        </div>
      </div>

      {modeInfo.howTo && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px dashed ${I.hairDark}`, padding: '10px 12px' }}>
            <div style={{ ...mono, fontSize: 9, fontWeight: 800, color: I.inkMute, letterSpacing: 1.5 }}>// HOWTO</div>
            <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.55 }}>{modeInfo.howTo}</div>
          </div>
        </div>
      )}

      {modeInfo.theory && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ background: I.card, border: `1px dashed ${I.hairDark}`, padding: '10px 12px' }}>
            <button onClick={() => setShowTheory((v) => !v)} aria-expanded={showTheory} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <span style={{ ...mono, fontSize: 9, fontWeight: 800, color: I.inkMute, letterSpacing: 1.5 }}>// THEORY · 음악 개념</span>
              <span style={{ fontSize: 12, color: I.inkMute, transform: showTheory ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} aria-hidden>▾</span>
            </button>
            {showTheory && <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.55 }}>{modeInfo.theory}</div>}
          </div>
        </div>
      )}

      {/* level grid with axis */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: 12, position: 'relative' }}>
          <ICorners />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ ...mono, fontSize: 10, color: I.inkMute, fontWeight: 800, letterSpacing: 1.5 }}>LEVEL · 1—{maxLevel}</div>
            <div style={{ ...mono, fontSize: 11, fontWeight: 800, color: I.lime }}>Lv {String(level).padStart(2, '0')} · {getLevelLabel(modeKey, level)}</div>
          </div>
          <div style={{ ...mono, display: 'grid', gridTemplateColumns: `repeat(${maxLevel}, 1fr)`, fontSize: 9, color: I.inkMute, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map((n) => <div key={n}>{n}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxLevel}, 1fr)`, border: `1px solid ${I.hairDark}` }}>
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map((n, i) => {
              const active = n === level;
              const done = n < level;
              return (
                <button key={n} onClick={() => setLevel(n)} aria-label={`레벨 ${n}`} style={{ height: 28, border: 'none', borderRight: i < maxLevel - 1 ? `1px solid ${I.hair}` : 'none', background: active ? I.lime : done ? I.limeSoft : I.card }} />
              );
            })}
          </div>
        </div>
      </div>

      {/* options */}
      {(showAbsoluteToggle || isProgression) && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: I.card, border: `1px solid ${I.hairDark}` }}>
            {showAbsoluteToggle && (
              <div style={{ padding: '10px 12px', borderBottom: isProgression ? `1px solid ${I.hair}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>절대음감 모드</div>
                  <div style={{ ...mono, fontSize: 10, color: I.inkMute, marginTop: 1 }}>NO_REF</div>
                </div>
                <button onClick={() => setAbsoluteMode(!absoluteMode)} role="switch" aria-checked={absoluteMode} style={{ ...mono, fontSize: 10, fontWeight: 800, padding: '3px 8px', border: `1px solid ${I.hairDark}`, background: absoluteMode ? I.lime : I.card, color: absoluteMode ? I.card : I.inkMute }}>{absoluteMode ? 'ON' : 'OFF'}</button>
              </div>
            )}
            {isProgression && (
              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>출제 소스</div>
                  <div style={{ ...mono, fontSize: 10, color: I.inkMute, marginTop: 1 }}>SOURCE</div>
                </div>
                <div style={{ display: 'flex', border: `1px solid ${I.hairDark}` }}>
                  {([{ value: 'diatonic', label: 'DIA' }, { value: 'praise', label: '찬양' }] as const).map((opt, idx) => (
                    <button key={opt.value} onClick={() => setProgressionSource(opt.value)} style={{ ...mono, padding: '4px 10px', fontSize: 11, fontWeight: 800, background: progressionSource === opt.value ? I.ink : I.card, color: progressionSource === opt.value ? I.card : I.inkSoft, border: 'none', borderLeft: idx > 0 ? `1px solid ${I.hairDark}` : 'none', letterSpacing: 0.5 }}>{opt.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: '20px 20px 24px' }}>
        <button onClick={onStart} disabled={loading} style={{ ...mono, width: '100%', padding: '16px 0', border: `1.5px solid ${I.ink}`, background: I.lime, color: I.ink, fontSize: 15, fontWeight: 800, letterSpacing: 1, opacity: loading ? 0.7 : 1 }}>{loading ? '⏳ LOADING SAMPLES' : '▶  START · SESSION'}</button>
        <div style={{ ...mono, marginTop: 8, fontSize: 10, color: I.inkMute, textAlign: 'center', fontWeight: 600 }}>// 첫 시작 시 piano sample 로딩</div>
      </div>
    </div>
  );
}
