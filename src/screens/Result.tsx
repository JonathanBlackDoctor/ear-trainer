import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { ModeKey, SessionResult } from '../types';
import { rankFor } from '../engine/xp';
import { useStore } from '../store/useStore';
import { ACHIEVEMENTS_BY_ID } from '../engine/achievements';

interface ResultState {
  mode: ModeKey;
  total: number;
  correct: number;
  results: SessionResult[];
  durationSec: number;
  xpEarned: number;
  bestCombo: number;
  previousTotalXp: number;
  sessionUnlockedIds: string[];
}

// Tween a number from 0 to `target` over `durationMs`. Returns the current
// displayed value. Used to make the +XP feel earned ("+47 XP" counts up).
function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - (1 - p) * (1 - p); // ease-out quad
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return target > 0 ? value : 0;
}

export function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;
  const { gamification } = useStore();

  // Hooks must be called unconditionally — pull the XP for the count-up
  // tween before any potential early return.
  const xpDisplayed = useCountUp(state?.xpEarned ?? 0, 900);

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const {
    mode, total, correct, results, durationSec,
    xpEarned = 0, bestCombo = 0,
    previousTotalXp = 0, sessionUnlockedIds = [],
  } = state;

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;

  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚';
  const comment = pct >= 90 ? '완벽합니다!' : pct >= 70 ? '잘 하셨어요!' : pct >= 50 ? '계속 연습해보세요!' : '약점을 집중 훈련해봐요!';

  // Rank-up detection — compare previous total to current. If they cross a
  // tier boundary, we show a celebratory callout.
  const prevRank = rankFor(previousTotalXp);
  const currRank = rankFor(gamification.totalXp);
  const rankedUp = prevRank.tier.id !== currRank.tier.id;

  const unlockedDefs = sessionUnlockedIds
    .map((id) => ACHIEVEMENTS_BY_ID[id])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <h1 className="max-w-lg mx-auto font-semibold text-slate-700">세션 결과</h1>
      </div>

      <div className="flex-1 max-w-lg mx-auto px-4 py-6 space-y-5 w-full">
        {/* Rank-up callout — shows above the XP card when the tier crossed */}
        {rankedUp && (
          <div className="bg-gradient-to-br from-accent-100 to-accent-200 border-2 border-accent-400 rounded-2xl p-4 text-center animate-bounce-in motion-reduce:animate-none">
            <div className="text-3xl">🎊</div>
            <div className="text-xs uppercase tracking-wider text-accent-700 font-semibold mt-1">랭크 업!</div>
            <div className="font-display text-2xl font-bold text-accent-900 mt-0.5">
              {currRank.tier.emoji} {currRank.tier.name}
            </div>
            <div className="text-xs text-accent-800 mt-1">
              {prevRank.tier.name} → {currRank.tier.name}
            </div>
          </div>
        )}

        {/* XP card — count-up animation */}
        {xpEarned > 0 && (
          <div className="card-hero text-center">
            <div className="text-[10px] uppercase tracking-wider text-accent-700 font-semibold">획득 XP</div>
            <div className="font-display text-display-sm font-bold text-accent-700 tabular-nums mt-1">
              +{xpDisplayed}
            </div>
            <div className="mt-3 text-xs text-slate-500">
              누적 <span className="font-semibold tabular-nums text-primary-700">{gamification.totalXp.toLocaleString()}</span> XP
              {' · '}
              <span className="font-semibold">{currRank.tier.emoji} {currRank.tier.name}</span>
            </div>
            {currRank.next && (
              <div className="mt-2 h-1.5 bg-canvas-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                  style={{ width: `${currRank.progress * 100}%` }}
                />
              </div>
            )}
            {currRank.next && (
              <div className="mt-1 text-[10px] text-slate-400 tabular-nums">
                다음 {currRank.next.name}까지 {currRank.xpToNext} XP
              </div>
            )}
          </div>
        )}

        {/* Score card */}
        <div className="card text-center py-8">
          <div className="text-6xl mb-3">{emoji}</div>
          <div className="text-5xl font-bold text-primary-600">{pct}%</div>
          <div className="text-slate-500 mt-1">{comment}</div>
          <div className="flex justify-center gap-8 mt-6 text-center">
            <div>
              <div className="text-xl font-bold text-emerald-600">{correct}</div>
              <div className="text-xs text-slate-400">정답</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-500">{total - correct}</div>
              <div className="text-xs text-slate-400">오답</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-600">
                {mins > 0 ? `${mins}분 ` : ''}{secs}초
              </div>
              <div className="text-xs text-slate-400">소요 시간</div>
            </div>
          </div>
          {bestCombo >= 3 && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full px-3 py-1">
              🔥 최고 콤보 {bestCombo}연속
            </div>
          )}
        </div>

        {/* Newly-unlocked achievements */}
        {unlockedDefs.length > 0 && (
          <div className="card border-accent-200 bg-accent-50">
            <div className="text-xs uppercase tracking-wider text-accent-700 font-semibold mb-2">
              새로 획득한 업적 · {unlockedDefs.length}개
            </div>
            <div className="space-y-2">
              {unlockedDefs.map((a) => (
                <div key={a.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-accent-200">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800">{a.name}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wrong items */}
        {results.filter((r) => !r.correct).length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">틀린 문항 항목</h3>
            <div className="space-y-1">
              {results
                .filter((r) => !r.correct)
                .map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span className="text-slate-600">{r.itemKey}</span>
                    <span className="text-red-500 text-xs">
                      {r.skipped ? '건너뜀' : r.partialScore > 0 ? `${Math.round(r.partialScore * 100)}%` : '오답'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            className="w-full btn-primary"
            onClick={() => navigate(`/train/${mode}`)}
          >
            한 번 더
          </button>
          <button
            className="w-full btn-secondary"
            onClick={() => navigate('/badges')}
          >
            🏆 업적 보기
          </button>
          <button
            className="w-full btn-secondary"
            onClick={() => navigate('/stats')}
          >
            📊 통계 보기
          </button>
          <button
            className="w-full btn-ghost text-slate-500"
            onClick={() => navigate('/')}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
