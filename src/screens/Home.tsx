import React from 'react';
import { useNavigate } from 'react-router-dom';
import { INTERVAL_MODE_INFO } from '../modes/intervalMode';
import { CHORD_MODE_INFO } from '../modes/chordMode';
import { SOLFEGE_MODE_INFO } from '../modes/solfegeMode';
import {
  PROGRESSION_MODE_INFO,
  MELODY_MODE_INFO,
  TRANSPOSE_MODE_INFO,
  RHYTHM_MODE_INFO,
  TEMPO_MODE_INFO,
  BPM_MODE_INFO,
} from '../modes/progressionMode';
import type { ModeKey } from '../types';
import { useStore } from '../store/useStore';
import { topWeakItems } from '../engine/weakness';

// 모드별 색상 띠 클래스 (mode-card의 ::before에 사용)
const MODE_ACCENT_CLASS: Partial<Record<ModeKey, string>> = {
  solfege:     'accent-solfege',
  interval:    'accent-interval',
  chord:       'accent-chord',
  progression: 'accent-progression',
  melody:      'accent-melody',
  transpose:   'accent-transpose',
  rhythm:      'accent-rhythm',
  tempo:       'accent-tempo',
  bpm:         'accent-bpm',
};

const ALL_MODES = [
  SOLFEGE_MODE_INFO,
  INTERVAL_MODE_INFO,
  CHORD_MODE_INFO,
  PROGRESSION_MODE_INFO,
  MELODY_MODE_INFO,
  TRANSPOSE_MODE_INFO,
  RHYTHM_MODE_INFO,
  TEMPO_MODE_INFO,
  BPM_MODE_INFO,
];

export function Home() {
  const navigate = useNavigate();
  const { stats, sessions } = useStore();

  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((s, ss) => s + ss.total, 0);
  const totalCorrect = sessions.reduce((s, ss) => s + ss.correct, 0);
  const overallPct = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  function startMode(key: ModeKey) {
    navigate(`/train/${key}`);
  }

  // Get top weak items across all modes
  const weakItems = Object.entries(stats)
    .flatMap(([mode, modeStats]) =>
      topWeakItems(modeStats as any, 2).map((w) => ({ ...w, mode }))
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-canvas-50 pb-10">
      {/* Header — 더 강한 브랜드 표현 (인디고 그라데이션 + 골드 액센트) */}
      <header className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-10">
          <div className="flex items-center gap-2 text-accent-300 text-xs font-semibold tracking-widest uppercase mb-2">
            <span className="inline-block w-6 h-px bg-accent-300"></span>
            Ear Training
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            음감 훈련
          </h1>
          <p className="text-sm text-primary-200 mt-2">
            교회 반주자를 위한 귀 훈련
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 -mt-6 space-y-5">
        {/* Summary stats — hero number 스타일로 강조 */}
        {totalSessions > 0 && (
          <div className="card-hero animate-slide-up">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border-r border-canvas-200">
                <div className="hero-number text-display-sm">
                  {overallPct}<span className="text-2xl text-primary-400">%</span>
                </div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">전체 정답률</div>
              </div>
              <div className="border-r border-canvas-200">
                <div className="font-display text-display-sm font-bold text-slate-700 tabular-nums">{totalSessions}</div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">세션 수</div>
              </div>
              <div>
                <div className="font-display text-display-sm font-bold text-slate-700 tabular-nums">{totalQuestions}</div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">총 문제</div>
              </div>
            </div>
          </div>
        )}

        {/* 빈 상태 — 첫 사용자에게 환영 메시지 */}
        {totalSessions === 0 && (
          <div className="card-hero text-center animate-slide-up">
            <div className="text-4xl mb-2">🎼</div>
            <h2 className="font-display text-xl font-bold text-primary-900 mb-1">
              훈련을 시작해보세요
            </h2>
            <p className="text-sm text-slate-500">
              아래에서 원하는 훈련을 선택하면 됩니다
            </p>
          </div>
        )}

        {/* Weakness shortcut — 골드 액센트로 강조 */}
        {weakItems.length > 0 && (
          <div className="bg-accent-50 border border-accent-200 rounded-2xl shadow-soft p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-accent-800 text-sm flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-500 text-white text-xs">!</span>
                보강이 필요한 항목
              </h2>
              <button
                className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                onClick={() => navigate('/stats')}
              >
                전체 보기 →
              </button>
            </div>
            <div className="space-y-1.5">
              {weakItems.map((w) => (
                <div
                  key={w.key + w.mode}
                  className="flex items-center justify-between text-sm bg-white/60 rounded-lg px-3 py-2"
                >
                  <span className="text-slate-700 font-medium">{w.key}</span>
                  <span className="text-accent-700 font-semibold tabular-nums text-xs">
                    약점 {Math.round(w.score * 100)}점
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode cards — 색상 띠로 모드별 차별화 */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-3 px-1 uppercase tracking-wider">
            훈련 선택
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {ALL_MODES.map((mode) => {
              const modeStats = stats[mode.key];
              const items = modeStats ? Object.values(modeStats) : [];
              const attempts = items.reduce((s, i) => s + i.attempts, 0);
              const correct = items.reduce((s, i) => s + i.correct, 0);
              const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : null;

              return (
                <button
                  key={mode.key}
                  className={`mode-card ${MODE_ACCENT_CLASS[mode.key] ?? 'accent-interval'}`}
                  onClick={() => startMode(mode.key)}
                >
                  <div className="text-3xl mb-2 mt-1">{mode.emoji}</div>
                  <div className="font-semibold text-primary-900 text-sm leading-tight">{mode.name}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-snug">{mode.description}</div>
                  {pct !== null ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary-600 tabular-nums">{pct}%</span>
                      <div className="flex-1 h-1 bg-canvas-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-400 font-medium">아직 기록 없음</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
            onClick={() => navigate('/stats')}
          >
            <span>📊</span> 통계
          </button>
          <button
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
            onClick={() => navigate('/settings')}
          >
            <span>⚙️</span> 설정
          </button>
        </div>
      </div>
    </div>
  );
}
