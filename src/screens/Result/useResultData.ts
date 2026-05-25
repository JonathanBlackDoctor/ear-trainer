import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ModeKey, SessionResult } from '../../types';
import { rankFor } from '../../engine/xp';
import type { RankProgress } from '../../engine/xp';
import { useStore } from '../../store/useStore';
import { ACHIEVEMENTS_BY_ID } from '../../engine/achievements';

export interface WeakProgressItem {
  itemKey: string;
  practiced: number;       // how many times this item appeared this session
  beforePct: number | null; // accuracy before the session (null = no prior data)
  afterPct: number | null;  // accuracy now (including this session)
}

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
  weakFocus?: WeakProgressItem[];
}

export interface UnlockedAchievementView {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export interface WrongItemView {
  itemKey: string;
  skipped: boolean;
  partialScore: number;
}

export interface ResultData {
  mode: ModeKey;
  total: number;
  correct: number;
  wrong: number;
  pct: number;
  mins: number;
  secs: number;
  emoji: string;
  comment: string;
  bestCombo: number;
  xpEarned: number;
  xpDisplayed: number;
  totalXp: number;
  prevRank: RankProgress;
  currRank: RankProgress;
  rankedUp: boolean;
  unlocked: UnlockedAchievementView[];
  wrongItems: WrongItemView[];
  weakProgress: WeakProgressItem[];
  weakSummary: { practiced: number; improved: number } | null;
  again: () => void;
  goBadges: () => void;
  goStats: () => void;
  goHome: () => void;
}

// Tween a number from 0 to `target`. Makes the +XP feel earned.
function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - (1 - p) * (1 - p);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return target > 0 ? value : 0;
}

// Reads the session result handed over via router state and derives everything
// a themed Result shell needs. Returns null when navigated to directly (no
// state) so the caller can redirect home. All hooks run unconditionally.
export function useResultData(): ResultData | null {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;
  const totalXp = useStore((s) => s.gamification.totalXp);

  const xpDisplayed = useCountUp(state?.xpEarned ?? 0, 900);

  if (!state) return null;

  const {
    mode, total, correct, results, durationSec,
    xpEarned = 0, bestCombo = 0, previousTotalXp = 0, sessionUnlockedIds = [],
    weakFocus = [],
  } = state;

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚';
  const comment = pct >= 90 ? '완벽합니다!' : pct >= 70 ? '잘 하셨어요!' : pct >= 50 ? '계속 연습해보세요!' : '약점을 집중 훈련해봐요!';

  const prevRank = rankFor(previousTotalXp);
  const currRank = rankFor(totalXp);

  return {
    mode,
    total,
    correct,
    wrong: total - correct,
    pct,
    mins: Math.floor(durationSec / 60),
    secs: durationSec % 60,
    emoji,
    comment,
    bestCombo,
    xpEarned,
    xpDisplayed,
    totalXp,
    prevRank,
    currRank,
    rankedUp: prevRank.tier.id !== currRank.tier.id,
    unlocked: sessionUnlockedIds
      .map((id) => ACHIEVEMENTS_BY_ID[id])
      .filter(Boolean)
      .map((a) => ({ id: a.id, emoji: a.emoji, name: a.name, description: a.description })),
    wrongItems: results.filter((r) => !r.correct).map((r) => ({ itemKey: r.itemKey, skipped: r.skipped, partialScore: r.partialScore })),
    weakProgress: weakFocus,
    weakSummary: weakFocus.length > 0
      ? {
          practiced: weakFocus.length,
          improved: weakFocus.filter((w) => w.beforePct != null && w.afterPct != null && w.afterPct > w.beforePct).length,
        }
      : null,
    again: () => navigate(`/train/${mode}`),
    goBadges: () => navigate('/badges'),
    goStats: () => navigate('/stats'),
    goHome: () => navigate('/'),
  };
}
