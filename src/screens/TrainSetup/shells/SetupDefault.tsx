import React, { useState } from 'react';
import { MAX_LEVEL, getLevelLabel } from '../../../modes/levels';
import type { TrainSetupProps } from '../index';

// Classic (default) setup layout — unchanged from the original Train setup block.
export function SetupDefault({
  modeKey, modeInfo, isWeakSession, totalQuestions, questionOptions, setTotalQuestions, level, setLevel,
  showAbsoluteToggle, absoluteMode, setAbsoluteMode,
  isProgression, progressionSource, setProgressionSource,
  loading, onStart, onBack,
}: TrainSetupProps) {
  const [showTheory, setShowTheory] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button className="btn-ghost" onClick={onBack}>← 뒤로</button>
          <span className="font-semibold text-slate-700">{modeInfo.emoji} {modeInfo.name}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-3 pb-8 gap-3">
        <div className="text-4xl" aria-hidden>{modeInfo.emoji}</div>
        <h1 className="text-lg font-bold text-slate-800">{modeInfo.name}</h1>
        {isWeakSession && (
          <div className="badge-accent text-xs">⚡ 약점 집중 세션 · {totalQuestions}문항</div>
        )}

        {modeInfo.howTo && (
          <div className="card w-full max-w-sm">
            <div className="text-sm font-semibold text-slate-600 mb-2">사용법</div>
            <p className="text-sm text-slate-600 leading-relaxed">{modeInfo.howTo}</p>
          </div>
        )}

        {modeInfo.theory && (
          <div className="card w-full max-w-sm">
            <button className="w-full flex items-center justify-between gap-2 text-left" onClick={() => setShowTheory((v) => !v)} aria-expanded={showTheory}>
              <span className="text-sm font-semibold text-slate-600">음악 개념</span>
              <span className={`text-slate-400 transition-transform ${showTheory ? 'rotate-180' : ''}`} aria-hidden>▾</span>
            </button>
            {showTheory && <p className="mt-2 text-sm text-slate-600 leading-relaxed">{modeInfo.theory}</p>}
          </div>
        )}

        <div className="card w-full max-w-sm">
          <div className="text-sm font-semibold text-slate-600 mb-3">레벨 선택</div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: modeInfo.maxLevel ?? MAX_LEVEL }, (_, i) => i + 1).map((lv) => (
              <button
                key={lv}
                className={`py-2 rounded-lg font-semibold text-sm transition-colors ${level === lv ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 active:bg-slate-200'}`}
                onClick={() => setLevel(lv)}
                aria-label={`레벨 ${lv}`}
              >
                {lv}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[1.25rem] leading-snug">Lv{level} · {getLevelLabel(modeKey, level)}</div>
        </div>

        <div className="card w-full max-w-sm">
          <div className="text-sm font-semibold text-slate-600 mb-3">문항 수</div>
          <div className="grid grid-cols-6 gap-2">
            {questionOptions.map((n) => (
              <button
                key={n}
                className={`py-2 rounded-lg font-semibold text-sm transition-colors ${totalQuestions === n ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 active:bg-slate-200'}`}
                onClick={() => setTotalQuestions(n)}
                aria-label={`${n}문항`}
                aria-pressed={totalQuestions === n}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {showAbsoluteToggle && (
          <div className="card w-full max-w-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-700">🎯 절대음감 모드</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">기준음 없이 음이름만 듣고 맞히기</div>
              </div>
              <button
                role="switch"
                aria-checked={absoluteMode}
                onClick={() => setAbsoluteMode(!absoluteMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${absoluteMode ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${absoluteMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        )}

        {isProgression && (
          <div className="card w-full max-w-sm">
            <div className="text-sm font-semibold text-slate-600 mb-3">출제 소스</div>
            <div className="flex gap-2">
              {([{ value: 'diatonic', label: '일반 다이어토닉' }, { value: 'praise', label: '🙏 찬양 패턴' }] as const).map((opt) => (
                <button
                  key={opt.value}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${progressionSource === opt.value ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  onClick={() => setProgressionSource(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn-primary w-full max-w-sm py-4 text-lg" onClick={onStart} disabled={loading}>
          {loading ? '🎵 소리 준비 중...' : '🎵 시작하기'}
        </button>
        <p className="text-xs text-slate-400">첫 시작 시 피아노 샘플을 불러옵니다</p>
      </div>
    </div>
  );
}
