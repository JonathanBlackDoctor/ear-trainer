// Lightweight SM-2 inspired scheduler. Items live in `state.srs[mode][itemKey]`.
// On each answer we update the card's `ease`/`interval`/`due`. The question
// factory picks items whose `due <= now` first, falling back to the existing
// weakness-weighted random pool when nothing is due — so first-time users still
// see varied questions, and seasoned users keep grinding what they forgot.

import type { ModeSrs, SrsCard, ModeStats } from '../types';
import { weaknessScore, pickWeighted } from './weakness';

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const INITIAL_INTERVAL_MIN = 1;        // 1 minute on first correct
const SECOND_INTERVAL_MIN = 10;        // 10 minutes on second correct
const LAPSE_INTERVAL_MIN = 1;          // reset to 1 min on lapse

/** Initialise a card. Higher weakness → lower initial ease (sees it sooner). */
export function makeCard(weakness = 0.5, now: number = Date.now()): SrsCard {
  // Map weakness [0..1] → ease [2.5..1.5]. Unknown items start at 2.0.
  const ease = clampEase(2.5 - weakness);
  return { ease, interval: INITIAL_INTERVAL_MIN, due: now, reps: 0 };
}

/** Grade the card and return the next one. grade: 0 = wrong, 1 = correct. */
export function updateCard(
  card: SrsCard,
  grade: 0 | 1,
  now: number = Date.now()
): SrsCard {
  if (grade === 0) {
    return {
      ease: clampEase(card.ease - 0.2),
      interval: LAPSE_INTERVAL_MIN,
      due: now + LAPSE_INTERVAL_MIN * 60_000,
      reps: 0,
    };
  }
  // Correct.
  let nextInterval: number;
  if (card.reps === 0) nextInterval = INITIAL_INTERVAL_MIN;
  else if (card.reps === 1) nextInterval = SECOND_INTERVAL_MIN;
  else nextInterval = Math.round(card.interval * card.ease);
  // Cap at 30 days so even mastered items resurface occasionally.
  nextInterval = Math.min(nextInterval, 30 * 24 * 60);
  return {
    ease: clampEase(card.ease + 0.05),
    interval: nextInterval,
    due: now + nextInterval * 60_000,
    reps: card.reps + 1,
  };
}

function clampEase(e: number): number {
  if (!Number.isFinite(e)) return 2.0;
  return Math.max(MIN_EASE, Math.min(MAX_EASE, e));
}

/**
 * Pick the next item to ask. Strategy:
 *  1. If any candidate item is due (`due <= now`), pick the most overdue.
 *  2. If any candidate has never been seen, pick one of those (weighted by weakness).
 *  3. Fall back to weakness-weighted random over all candidates.
 *
 * `lastKey` is filtered out so we don't ask the same item twice in a row.
 */
export function pickDue(
  srs: ModeSrs,
  stats: ModeStats,
  itemKeys: string[],
  now: number = Date.now(),
  lastKey?: string
): string {
  if (itemKeys.length === 0) return '';
  const candidates = itemKeys.filter((k) => k !== lastKey);
  const pool = candidates.length > 0 ? candidates : itemKeys;

  // 1. Due cards — pick the most overdue.
  const due = pool
    .map((k) => ({ key: k, card: srs[k] }))
    .filter((x) => x.card && x.card.due <= now)
    .sort((a, b) => a.card!.due - b.card!.due);
  if (due.length > 0) return due[0].key;

  // 2. Unseen cards — weighted by their (unknown → 0.5) weakness.
  const unseen = pool.filter((k) => !srs[k]);
  if (unseen.length > 0) {
    return pickWeighted(stats, unseen, lastKey);
  }

  // 3. Nothing due, everything seen — weakness-weighted random.
  return pickWeighted(stats, pool, lastKey);
}

/** Find items considered "weak": low ease, frequent lapses, or unseen. */
export function dueItems(
  srs: ModeSrs,
  itemKeys: string[],
  now: number = Date.now()
): string[] {
  return itemKeys.filter((k) => {
    const card = srs[k];
    return !card || card.due <= now;
  });
}

/** Initialise SRS for an item using existing stats weakness score. */
export function ensureCard(
  srs: ModeSrs,
  stats: ModeStats,
  itemKey: string,
  now: number = Date.now()
): SrsCard {
  if (srs[itemKey]) return srs[itemKey];
  const item = stats[itemKey];
  const weakness = item ? weaknessScore(item) : 0.5;
  return makeCard(weakness, now);
}
