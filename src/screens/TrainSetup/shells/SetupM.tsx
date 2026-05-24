import React, { useState } from 'react';
import { MAX_LEVEL, getLevelLabel } from '../../../modes/levels';
import { M } from '../../../theme/decorations/palette';
import { MCard, MText, MChip, MOrb } from '../../../theme/decorations/aurora';
import type { TrainSetupProps } from '../index';

export function SetupM({
  modeKey, modeInfo, isWeakSession, totalQuestions, level, setLevel,
  showAbsoluteToggle, absoluteMode, setAbsoluteMode,
  isProgression, progressionSource, setProgressionSource,
  loading, onStart, onBack,
}: TrainSetupProps) {
  const maxLevel = modeInfo.maxLevel ?? MAX_LEVEL;
  const [showTheory, setShowTheory] = useState(false);

  return (
    <div style={{ maxWidth: 512, margin: '0 auto', color: M.ink, position: 'relative', overflow: 'hidden', paddingBottom: 28 }}>
      <MOrb size={220} style={{ position: 'absolute', top: -80, right: -80, filter: 'blur(36px)' }} />
      <MOrb size={180} style={{ position: 'absolute', top: 280, left: -80, filter: 'blur(32px)' }} />

      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button onClick={onBack} aria-label="뒤로" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: 16, color: M.ink }}>←</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: M.violet, fontWeight: 800, letterSpacing: 2 }}>SETUP</div>
        <div style={{ width: 38 }} />
      </div>

      {/* hero iridescent emblem */}
      <div style={{ padding: '20px 20px 0', position: 'relative' }}>
        <MCard gloss style={{ padding: '26px 18px 22px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', width: 92, height: 92, borderRadius: 28, background: M.iridescent, alignItems: 'center', justifyContent: 'center', fontSize: 44, boxShadow: '0 12px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.4)' }} aria-hidden>{modeInfo.emoji}</div>
          <div style={{ marginTop: 14, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}><MText size={28}>{modeInfo.name}</MText></div>
          <div style={{ fontSize: 12, color: M.inkSoft, marginTop: 4 }}>{modeInfo.description}</div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {isWeakSession && <MChip color={M.pink}>⚡ 약점 집중</MChip>}
            <MChip color={M.cyan}>{totalQuestions} 문항</MChip>
          </div>
        </MCard>
      </div>

      {modeInfo.howTo && (
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: M.violet, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>사용법</div>
            <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.55 }}>{modeInfo.howTo}</div>
          </MCard>
        </div>
      )}

      {modeInfo.theory && (
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: '12px 16px' }}>
            <button onClick={() => setShowTheory((v) => !v)} aria-expanded={showTheory} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <span style={{ fontSize: 10, color: M.violet, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>음악 개념</span>
              <span style={{ fontSize: 13, color: M.inkMute, transform: showTheory ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} aria-hidden>▾</span>
            </button>
            {showTheory && <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.55 }}>{modeInfo.theory}</div>}
          </MCard>
        </div>
      )}

      {/* level */}
      <div style={{ padding: '12px 20px 0', position: 'relative' }}>
        <MCard style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>레벨</div>
            <div style={{ fontSize: 11, color: M.pink, fontWeight: 800 }}>Lv {level} · {getLevelLabel(modeKey, level)}</div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map((n) => {
              const active = n === level;
              const done = n < level;
              return (
                <button key={n} onClick={() => setLevel(n)} aria-label={`레벨 ${n}`} style={{ fontVariantNumeric: 'tabular-nums', height: 42, borderRadius: 14, border: 'none', background: active ? M.iridescent : done ? M.iridescentSoft : 'rgba(26,31,58,0.04)', color: active ? '#fff' : done ? M.violet : M.inkSoft, fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em', boxShadow: active ? '0 6px 14px rgba(168,85,247,0.45)' : 'none' }}>{n}</button>
              );
            })}
          </div>
        </MCard>
      </div>

      {showAbsoluteToggle && (
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>절대음감 모드</div>
              <div style={{ fontSize: 11, color: M.inkMute, marginTop: 2 }}>기준음 없이 음이름만 듣기</div>
            </div>
            <button onClick={() => setAbsoluteMode(!absoluteMode)} role="switch" aria-checked={absoluteMode} style={{ width: 44, height: 26, borderRadius: 999, border: 'none', background: absoluteMode ? M.iridescent : 'rgba(26,31,58,0.08)', position: 'relative', padding: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: absoluteMode ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
            </button>
          </MCard>
        </div>
      )}

      {isProgression && (
        <div style={{ padding: '12px 20px 0', position: 'relative' }}>
          <MCard style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>출제 소스</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([{ value: 'diatonic', label: '일반 다이어토닉' }, { value: 'praise', label: '🙏 찬양' }] as const).map((opt) => (
                <button key={opt.value} onClick={() => setProgressionSource(opt.value)} style={{ flex: 1, padding: '10px 0', borderRadius: 14, border: 'none', background: progressionSource === opt.value ? M.iridescent : 'rgba(26,31,58,0.04)', color: progressionSource === opt.value ? '#fff' : M.inkSoft, fontSize: 12.5, fontWeight: 800 }}>{opt.label}</button>
              ))}
            </div>
          </MCard>
        </div>
      )}

      <div style={{ padding: '20px 20px 28px', position: 'relative' }}>
        <button onClick={onStart} disabled={loading} style={{ width: '100%', padding: '18px 0', borderRadius: 18, border: 'none', background: M.iridescent, color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', boxShadow: '0 16px 32px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.4)', opacity: loading ? 0.75 : 1 }}>{loading ? '🎵 소리 준비 중…' : '🎵  시작하기'}</button>
      </div>
    </div>
  );
}
