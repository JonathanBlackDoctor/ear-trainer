import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { weaknessScore } from '../../engine/weakness';
import { MODE_REGISTRY } from '../../modes/registry';
import type { ModeKey } from '../../types';

export interface ModeAccuracy {
  modeKey: ModeKey;
  label: string;
  emoji: string;
  pct: number;
  attempts: number;
}

export interface WeakRow {
  key: string;
  modeKey: ModeKey;
  modeLabel: string;
  score: number;
  attempts: number;
  pct: number;
}

export interface StatsData {
  overallPct: number;
  totalSessions: number;
  totalQ: number;
  streakDays: number;
  trend: number[];
  modeAccuracy: ModeAccuracy[];
  weakItems: WeakRow[];
  goHome: () => void;
  startWeakFocus: () => void;
}

// Consecutive-day streak ending today (or yesterday), counted from session dates.
function computeStreak(dates: number[]): number {
  if (dates.length === 0) return 0;
  const dayMs = 86_400_000;
  const days = new Set(dates.map((d) => Math.floor(d / dayMs)));
  const today = Math.floor(Date.now() / dayMs);
  let cursor = days.has(today) ? today : today - 1;
  if (!days.has(cursor)) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

export function useStatsData(): StatsData {
  const navigate = useNavigate();
  const { stats, sessions } = useStore();

  const totalSessions = sessions.length;
  const totalQ = sessions.reduce((s, ss) => s + ss.total, 0);
  const totalC = sessions.reduce((s, ss) => s + ss.correct, 0);
  const overallPct = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

  const trend = sessions
    .slice(0, 20)
    .reverse()
    .map((s) => (s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0));

  const modeAccuracy: ModeAccuracy[] = (Object.entries(stats) as [ModeKey, (typeof stats)[ModeKey]][])
    .map(([mode, ms]) => {
      const items = Object.values(ms);
      const att = items.reduce((s, i) => s + i.attempts, 0);
      const cor = items.reduce((s, i) => s + i.correct, 0);
      const info = MODE_REGISTRY[mode];
      return {
        modeKey: mode,
        label: info?.name ?? mode,
        emoji: info?.emoji ?? '🎵',
        pct: att > 0 ? Math.round((cor / att) * 100) : 0,
        attempts: att,
      };
    })
    .filter((m) => m.attempts > 0)
    .sort((a, b) => b.pct - a.pct);

  const weakItems: WeakRow[] = (Object.entries(stats) as [ModeKey, (typeof stats)[ModeKey]][])
    .flatMap(([mode, ms]) =>
      Object.entries(ms).map(([key, item]) => ({
        key,
        modeKey: mode,
        modeLabel: MODE_REGISTRY[mode]?.name ?? mode,
        score: weaknessScore(item),
        attempts: item.attempts,
        pct: item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0,
      })),
    )
    .filter((w) => w.attempts > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return {
    overallPct,
    totalSessions,
    totalQ,
    streakDays: computeStreak(sessions.map((s) => s.date)),
    trend,
    modeAccuracy,
    weakItems,
    goHome: () => navigate('/'),
    startWeakFocus: () => navigate(`/train/${weakItems[0]?.modeKey ?? 'interval'}?focus=weak`),
  };
}
