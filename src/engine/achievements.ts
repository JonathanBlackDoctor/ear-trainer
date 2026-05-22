import type {
  GamificationState, ModeKey, ModeStats, SessionResult,
} from '../types';

export type AchievementCategory =
  | 'volume' | 'streak' | 'mastery' | 'completion' | 'speed' | 'weakness';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  check: (ctx: AchievementCheckCtx) => boolean;
}

export interface AchievementCheckCtx {
  state: GamificationState;
  stats: Record<ModeKey, ModeStats>;
  // Most-recent answer (for per-answer triggers). May be undefined when we're
  // evaluating at session-end with no last answer in hand.
  lastResult?: SessionResult;
  // Combo length immediately after the most recent answer. 0 if reset/skip.
  comboAtAnswer?: number;
  // All results for the current session (for session-end achievements).
  sessionResults?: SessionResult[];
}

// ─── Catalog ───────────────────────────────────────────────────────────────
const MASTERY_MODES: { mode: ModeKey; label: string; emoji: string }[] = [
  { mode: 'interval',    label: '음정',      emoji: '🎵' },
  { mode: 'chord',       label: '코드',      emoji: '🎹' },
  { mode: 'solfege',     label: '계이름',    emoji: '🎼' },
  { mode: 'progression', label: '코드 진행', emoji: '🎸' },
  { mode: 'melody',      label: '멜로디',    emoji: '🎶' },
];

function masteryCheck(mode: ModeKey) {
  return (ctx: AchievementCheckCtx): boolean => {
    const modeStats = ctx.stats[mode] ?? {};
    let attempts = 0;
    let correct = 0;
    for (const item of Object.values(modeStats)) {
      attempts += item.attempts;
      correct += item.correct;
    }
    if (attempts < 50) return false;
    return correct / attempts >= 0.9;
  };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Volume ──────────────────────────────────────────────────────────────
  {
    id: 'first_correct', name: '첫 정답', emoji: '🌱',
    description: '첫 번째 정답을 맞췄어요',
    category: 'volume',
    check: (ctx) => ctx.state.lifetimeCorrect >= 1,
  },
  {
    id: 'correct_10', name: '10문제 정복', emoji: '🪴',
    description: '누적 10문제 정답',
    category: 'volume',
    check: (ctx) => ctx.state.lifetimeCorrect >= 10,
  },
  {
    id: 'correct_100', name: '100문제 정복', emoji: '🌳',
    description: '누적 100문제 정답',
    category: 'volume',
    check: (ctx) => ctx.state.lifetimeCorrect >= 100,
  },
  {
    id: 'correct_500', name: '500문제 정복', emoji: '🏛️',
    description: '누적 500문제 정답',
    category: 'volume',
    check: (ctx) => ctx.state.lifetimeCorrect >= 500,
  },
  {
    id: 'correct_1000', name: '천 문제의 귀', emoji: '🏔️',
    description: '누적 1000문제 정답',
    category: 'volume',
    check: (ctx) => ctx.state.lifetimeCorrect >= 1000,
  },

  // ── Streak (in-session combo) ───────────────────────────────────────────
  {
    id: 'combo_3', name: '3연속!', emoji: '🔥',
    description: '한 세션에서 3연속 정답',
    category: 'streak',
    check: (ctx) => (ctx.comboAtAnswer ?? 0) >= 3,
  },
  {
    id: 'combo_5', name: '5연속!', emoji: '⚡',
    description: '한 세션에서 5연속 정답',
    category: 'streak',
    check: (ctx) => (ctx.comboAtAnswer ?? 0) >= 5,
  },
  {
    id: 'combo_10', name: '10연속!', emoji: '💎',
    description: '한 세션에서 10연속 정답',
    category: 'streak',
    check: (ctx) => (ctx.comboAtAnswer ?? 0) >= 10,
  },
  {
    id: 'combo_20', name: '20연속!', emoji: '👑',
    description: '한 세션에서 20연속 정답',
    category: 'streak',
    check: (ctx) => (ctx.comboAtAnswer ?? 0) >= 20,
  },

  // ── Mastery (per mode) ──────────────────────────────────────────────────
  ...MASTERY_MODES.map((m) => ({
    id: `master_${m.mode}`,
    name: `${m.label} 마스터`,
    description: `${m.label} 50문제 이상 풀고 정답률 90%+`,
    emoji: m.emoji,
    category: 'mastery' as AchievementCategory,
    check: masteryCheck(m.mode),
  })),

  // ── Completion ──────────────────────────────────────────────────────────
  {
    id: 'try_all_modes', name: '모든 모드 체험', emoji: '🎪',
    description: '모든 훈련 모드를 한 번씩 시도',
    category: 'completion',
    check: (ctx) => {
      const required: ModeKey[] = [
        'interval','chord','solfege','progression','melody',
        'transpose','rhythm','tempo','bpm',
      ];
      return required.every((m) => ctx.state.modesEverTried[m] === true);
    },
  },
  {
    id: 'perfect_session', name: '완벽한 세션', emoji: '✨',
    description: '한 세션에서 만점 달성',
    category: 'completion',
    check: (ctx) => ctx.state.perfectSessionCount >= 1,
  },
  {
    id: 'perfect_session_10', name: '완벽주의자', emoji: '🌟',
    description: '만점 세션 10회 달성',
    category: 'completion',
    check: (ctx) => ctx.state.perfectSessionCount >= 10,
  },

  // ── Speed ───────────────────────────────────────────────────────────────
  {
    id: 'quick_draw', name: '신속한 귀', emoji: '⚡',
    description: '한 세션 평균 응답 3초 이하',
    category: 'speed',
    check: (ctx) => {
      const r = ctx.sessionResults;
      if (!r || r.length < 5) return false;
      const answered = r.filter((x) => !x.skipped);
      if (answered.length < 5) return false;
      const avg = answered.reduce((s, x) => s + x.timeTaken, 0) / answered.length;
      return avg <= 3000;
    },
  },
  {
    id: 'lightning', name: '번개 같은 반응', emoji: '⚡',
    description: '1초 이내 정답 5회 누적',
    category: 'speed',
    check: (ctx) => ctx.state.lightningCount >= 5,
  },

  // ── Weakness ────────────────────────────────────────────────────────────
  {
    id: 'weakness_conquered', name: '약점 정복', emoji: '🛡️',
    description: '약점 항목 하나를 정답률 90%+로 끌어올림',
    category: 'weakness',
    check: (ctx) => {
      // weaknessConqueredSnapshot stores best-ever accuracy. We unlock when any
      // tracked item has reached >= 0.9 (the store updates this snapshot only
      // for items that were once <0.5, so this implicitly enforces the "from
      // weak to strong" requirement).
      return Object.values(ctx.state.weaknessConqueredSnapshot).some((v) => v >= 0.9);
    },
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> =
  Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

// Returns IDs of newly-unlocked achievements (those whose check now passes
// but were not already in `state.achievements`).
export function evaluateAchievements(ctx: AchievementCheckCtx): string[] {
  const unlocked: string[] = [];
  for (const def of ACHIEVEMENTS) {
    if (ctx.state.achievements[def.id]) continue;
    try {
      if (def.check(ctx)) unlocked.push(def.id);
    } catch {
      // Defensive: a buggy check shouldn't break the answer flow.
    }
  }
  return unlocked;
}
