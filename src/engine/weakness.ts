import type { StatsItem, ModeKey, ModeStats } from '../types';
import { intervalItemKeys } from '../theory/intervals';
import { chordItemKeys } from '../theory/chords';
import { solfegeItemKeys } from '../theory/solfege';

const RECENT_WINDOW = 8;
const MIN_WEIGHT = 0.05;

/** Compute weakness score for an item */
export function weaknessScore(item: StatsItem): number {
  const { attempts, correct, recent, lastSeen } = item;
  if (attempts === 0) return 0.5; // unknown: medium weight

  const accuracy = correct / attempts;
  const recentWrong =
    recent.length === 0
      ? 1 - accuracy
      : recent.filter((r) => r === 0).length / recent.length;

  // Time-since bonus (up to 0.1 for unseen items)
  const ageMs = Date.now() - lastSeen;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const ageFactor = Math.min(ageDays / 7, 1.0) * 0.1;

  return (1 - accuracy) * 0.6 + recentWrong * 0.3 + ageFactor;
}

/** Build weighted pool from mode stats for a set of item keys */
export function weightedPool(
  stats: ModeStats,
  itemKeys: string[]
): string[] {
  if (itemKeys.length === 0) return [];

  const weights = itemKeys.map((key) => {
    const item = stats[key];
    return item ? Math.max(weaknessScore(item), MIN_WEIGHT) : 0.5;
  });

  // Normalize
  const total = weights.reduce((a, b) => a + b, 0);
  const pool: string[] = [];
  itemKeys.forEach((key, i) => {
    const count = Math.max(1, Math.round((weights[i] / total) * 100));
    for (let j = 0; j < count; j++) pool.push(key);
  });
  return pool;
}

/** Pick a weighted-random item key */
export function pickWeighted(
  stats: ModeStats,
  itemKeys: string[],
  lastKey?: string
): string {
  const pool = weightedPool(stats, itemKeys);
  if (pool.length === 0) return itemKeys[0] ?? '';

  // Avoid immediate repetition
  const filtered = lastKey ? pool.filter((k) => k !== lastKey) : pool;
  const src = filtered.length > 0 ? filtered : pool;
  return src[Math.floor(Math.random() * src.length)];
}

/** Return top-N weakest items across a mode */
export function topWeakItems(
  stats: ModeStats,
  n = 5
): Array<{ key: string; score: number }> {
  return Object.entries(stats)
    .map(([key, item]) => ({ key, score: weaknessScore(item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

// Modes whose per-level item pools we can enumerate, so a weak-focus session
// can run at a level that actually contains the user's weak items. Other modes
// either encode the level in the item key (handled below) or can't focus.
const ITEM_KEYS_FOR_LEVEL: Partial<Record<ModeKey, (level: number) => string[]>> = {
  interval: intervalItemKeys,
  chord: chordItemKeys,
  solfege: solfegeItemKeys,
};

/**
 * Pick the level a weak-focus session should run at for a mode.
 *
 * The factory only builds questions from the current level's item pool, so a
 * weak session is only meaningful at a level that actually contains the user's
 * weak items. Defaulting to level 1 makes the candidate filter match nothing
 * and silently fall back to a normal session.
 *
 * Returns the lowest level whose pool covers the most weak items. For modes
 * that encode the level in the item key (e.g. transpose: `transpose_lv3`) the
 * level is parsed from the weakest item. Falls back to `fallback` when there's
 * nothing to focus on.
 */
export function weakFocusLevel(
  modeKey: ModeKey,
  stats: ModeStats,
  maxLevel: number,
  fallback = 1
): number {
  const weakKeys = topWeakItems(stats, 8)
    .filter((w) => (stats[w.key]?.attempts ?? 0) > 0)
    .map((w) => w.key);
  if (weakKeys.length === 0) return fallback;

  // Level encoded in the item key (e.g. transpose `transpose_lv3`): drill the
  // weakest such level directly.
  const lvMatch = weakKeys[0].match(/_lv(\d+)$/);
  if (lvMatch) {
    const lv = Number(lvMatch[1]);
    return lv >= 1 && lv <= maxLevel ? lv : fallback;
  }

  const itemKeysFor = ITEM_KEYS_FOR_LEVEL[modeKey];
  if (!itemKeysFor) return fallback;

  const weakSet = new Set(weakKeys);
  let bestLevel = fallback;
  let bestCoverage = -1;
  for (let lv = 1; lv <= maxLevel; lv++) {
    const coverage = itemKeysFor(lv).filter((k) => weakSet.has(k)).length;
    if (coverage > bestCoverage) {
      bestCoverage = coverage;
      bestLevel = lv;
    }
  }
  return bestCoverage > 0 ? bestLevel : fallback;
}

/** Adaptive level suggestion: returns recommended level based on recent accuracy */
export function suggestLevel(
  stats: ModeStats,
  currentLevel: number,
  maxLevel: number
): number {
  const items = Object.values(stats);
  if (items.length < 5) return currentLevel;

  const recent = items.flatMap((i) => i.recent).slice(-20);
  if (recent.length < 5) return currentLevel;

  const accuracy = recent.filter((r) => r === 1).length / recent.length;
  if (accuracy >= 0.85 && currentLevel < maxLevel) return currentLevel + 1;
  if (accuracy < 0.60 && currentLevel > 1) return currentLevel - 1;
  return currentLevel;
}
