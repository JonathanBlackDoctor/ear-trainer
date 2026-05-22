import type { RankTier, XpAward } from '../types';

// XP awarded per answer combines base difficulty, correctness (with partial
// credit at a discount), a speed bonus that decays linearly between 3s and
// 10s, and a combo multiplier that grows by 10% per consecutive correct
// answer (capped at 2.0× at combo 11+).
export interface AwardXpOpts {
  level: number;
  partialScore: number;     // 0..1
  correct: boolean;
  timeTakenMs: number;
  comboAfterAnswer: number; // 0 if this answer was wrong
}

export function awardXp(opts: AwardXpOpts): XpAward {
  const { level, partialScore, correct, timeTakenMs, comboAfterAnswer } = opts;
  const base = 8 + Math.max(1, level) * 4;             // Lv1=12 … Lv10=48
  const correctness = correct ? 1 : Math.max(0, Math.min(1, partialScore)) * 0.6;
  const t = Math.max(0, timeTakenMs) / 1000;
  const speedMult = Math.max(0, Math.min(1, (10 - t) / 7));
  const speed = base * 0.3 * speedMult * correctness;
  const comboSteps = Math.max(0, comboAfterAnswer - 1);
  const comboMult = 1 + Math.min(1, comboSteps * 0.1);
  const total = Math.round((base * correctness + speed) * comboMult);
  return { base, correctness, speed, combo: comboMult, total };
}

// ─── Rank Tiers ────────────────────────────────────────────────────────────
export interface RankInfo {
  id: RankTier;
  name: string;
  emoji: string;
  min: number;
}

export const RANK_TIERS: RankInfo[] = [
  { id: 'bronze1',  name: '브론즈 I',   emoji: '🥉', min: 0 },
  { id: 'bronze2',  name: '브론즈 II',  emoji: '🥉', min: 200 },
  { id: 'bronze3',  name: '브론즈 III', emoji: '🥉', min: 500 },
  { id: 'silver',   name: '실버',       emoji: '🥈', min: 1200 },
  { id: 'gold',     name: '골드',       emoji: '🥇', min: 3000 },
  { id: 'platinum', name: '플래티넘',   emoji: '💠', min: 8000 },
  { id: 'diamond',  name: '다이아',     emoji: '💎', min: 20000 },
  { id: 'master',   name: '마스터',     emoji: '👑', min: 50000 },
];

export interface RankProgress {
  tier: RankInfo;
  next: RankInfo | null;
  // Progress within the current tier toward the next (0..1).
  // 1.0 when at master (the final tier).
  progress: number;
  // XP remaining to reach the next tier (0 at master).
  xpToNext: number;
}

export function rankFor(totalXp: number): RankProgress {
  const xp = Math.max(0, totalXp);
  let idx = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (xp >= RANK_TIERS[i].min) idx = i;
  }
  const tier = RANK_TIERS[idx];
  const next = idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null;
  if (!next) {
    return { tier, next: null, progress: 1, xpToNext: 0 };
  }
  const span = next.min - tier.min;
  const progress = span > 0 ? Math.min(1, (xp - tier.min) / span) : 1;
  const xpToNext = Math.max(0, next.min - xp);
  return { tier, next, progress, xpToNext };
}
