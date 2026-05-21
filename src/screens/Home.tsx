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
} from '../modes/progressionMode';
import type { ModeKey } from '../types';
import { useStore } from '../store/useStore';
import { topWeakItems } from '../engine/weakness';

const ALL_MODES = [
  SOLFEGE_MODE_INFO,
  INTERVAL_MODE_INFO,
  CHORD_MODE_INFO,
  PROGRESSION_MODE_INFO,
  MELODY_MODE_INFO,
  TRANSPOSE_MODE_INFO,
  RHYTHM_MODE_INFO,
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
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-800">🎵 음감 훈련</h1>
          <p className="text-sm text-slate-500 mt-1">교회 반주자를 위한 귀 훈련</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">
        {/* Summary stats */}
        {totalSessions > 0 && (
          <div className="card">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{overallPct}%</div>
                <div className="text-xs text-slate-500 mt-0.5">전체 정답률</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-700">{totalSessions}</div>
                <div className="text-xs text-slate-500 mt-0.5">세션 수</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-700">{totalQuestions}</div>
                <div className="text-xs text-slate-500 mt-0.5">총 문제</div>
              </div>
            </div>
          </div>
        )}

        {/* Weakness shortcut */}
        {weakItems.length > 0 && (
          <div className="card border-amber-200 bg-amber-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-amber-800 text-sm">⚠️ 약한 항목</h2>
              <button
                className="text-xs text-primary-600 font-medium"
                onClick={() => navigate('/stats')}
              >
                전체 보기
              </button>
            </div>
            {weakItems.map((w) => (
              <div key={w.key + w.mode} className="flex items-center justify-between text-sm py-1">
                <span className="text-slate-700">{w.key}</span>
                <span className="text-amber-700 font-medium">
                  약점 {Math.round(w.score * 100)}점
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Mode cards */}
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">훈련 선택</h2>
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
                  className="card text-left active:scale-95 transition-transform duration-100 cursor-pointer"
                  onClick={() => startMode(mode.key)}
                >
                  <div className="text-3xl mb-2">{mode.emoji}</div>
                  <div className="font-semibold text-slate-800 text-sm">{mode.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{mode.description}</div>
                  {pct !== null && (
                    <div className="mt-2 text-xs font-semibold text-primary-600">{pct}% 정답</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex gap-3">
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
