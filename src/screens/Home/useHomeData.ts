import { useNavigate } from 'react-router-dom';
import { MODE_REGISTRY, resolveModeOrder } from '../../modes/registry';
import type { ModeInfo } from '../../modes/registry';
import type { ModeKey, ModeStats } from '../../types';
import { useStore } from '../../store/useStore';
import { topWeakItems } from '../../engine/weakness';
import { rankFor } from '../../engine/xp';
import { ACHIEVEMENTS_BY_ID } from '../../engine/achievements';

export interface ModeWithStats extends ModeInfo {
  pct: number | null;
}

export interface WeakItemView {
  key: string;
  mode: ModeKey;
  modeName: string;
  score: number;
}

export interface RecentAchievementView {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export interface HomeData {
  rank: ReturnType<typeof rankFor>;
  totalXp: number;
  overallPct: number;
  totalSessions: number;
  totalQuestions: number;
  modes: ModeWithStats[];
  weakItems: WeakItemView[];
  recentAchievements: RecentAchievementView[];
  startMode: (key: ModeKey) => void;
  startWeakSession: (mode: string) => void;
  goStats: () => void;
  goSettings: () => void;
  goBadges: () => void;
}

// All data + navigation handlers the Home screen needs, independent of which
// visual direction renders it. Each themed shell consumes this hook.
export function useHomeData(): HomeData {
  const navigate = useNavigate();
  const { settings, stats, sessions, gamification } = useStore();

  const modes: ModeWithStats[] = resolveModeOrder(settings.modeOrder).map((k) => {
    const info = MODE_REGISTRY[k];
    const modeStats = stats[k];
    const items = modeStats ? Object.values(modeStats) : [];
    const attempts = items.reduce((s, i) => s + i.attempts, 0);
    const correct = items.reduce((s, i) => s + i.correct, 0);
    const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
    return { ...info, pct };
  });

  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((s, ss) => s + ss.total, 0);
  const totalCorrect = sessions.reduce((s, ss) => s + ss.correct, 0);
  const overallPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const rank = rankFor(gamification.totalXp);

  const recentAchievements: RecentAchievementView[] = Object.entries(gamification.achievements)
    .map(([id, info]) => ({ id, ...info, def: ACHIEVEMENTS_BY_ID[id] }))
    .filter((a) => a.def)
    .sort((a, b) => b.unlockedAt - a.unlockedAt)
    .slice(0, 3)
    .map((a) => ({ id: a.id, emoji: a.def.emoji, name: a.def.name, description: a.def.description }));

  const weakItems: WeakItemView[] = (Object.entries(stats) as [ModeKey, ModeStats][])
    .filter(([mode]) => mode in MODE_REGISTRY)
    .flatMap(([mode, modeStats]) =>
      topWeakItems(modeStats, 2)
        .filter((w) => (modeStats[w.key]?.attempts ?? 0) > 0)
        .map((w) => ({ key: w.key, mode, modeName: MODE_REGISTRY[mode]?.name ?? mode, score: w.score })),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    rank,
    totalXp: gamification.totalXp,
    overallPct,
    totalSessions,
    totalQuestions,
    modes,
    weakItems,
    recentAchievements,
    startMode: (key) => navigate(`/train/${key}`),
    startWeakSession: (mode) => navigate(`/train/${mode}?focus=weak`),
    goStats: () => navigate('/stats'),
    goSettings: () => navigate('/settings'),
    goBadges: () => navigate('/badges'),
  };
}
