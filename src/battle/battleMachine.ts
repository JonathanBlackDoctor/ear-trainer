import type { PlayerDone, PlayerInfo, BattleResults } from './types';

// Pure, framework-free battle logic. Kept separate from the React store and the
// transport so it can be unit-tested in isolation (see battleMachine.test.ts).

/**
 * Points for a single answer. Correct answers earn a 100-point base plus a
 * speed bonus (up to 100) that decays linearly from instant to the per-question
 * deadline. Wrong or timed-out answers earn 0.
 */
export function scoreAnswer(correct: boolean, ms: number, perQuestionMs: number): number {
  if (!correct) return 0;
  const remaining = Math.max(0, perQuestionMs - ms);
  const speedBonus = Math.round((remaining / perQuestionMs) * 100);
  return 100 + speedBonus;
}

/**
 * Decide the winner from each player's final tally.
 * Higher score wins; ties break on lower total correct-answer time; a remaining
 * tie is a draw (winnerId = null).
 */
export function decideWinner(done: Record<string, PlayerDone>): string | null {
  const entries = Object.values(done);
  if (entries.length === 0) return null;
  let best = entries[0];
  let tie = false;
  for (let i = 1; i < entries.length; i++) {
    const cur = entries[i];
    if (cur.score > best.score) { best = cur; tie = false; }
    else if (cur.score === best.score) {
      // Lower correctMs is better.
      if (cur.correctMs < best.correctMs) { best = cur; tie = false; }
      else if (cur.correctMs === best.correctMs) { tie = true; }
    }
  }
  return tie ? null : best.playerId;
}

export function buildResults(
  players: PlayerInfo[],
  done: Record<string, PlayerDone>,
  byForfeit = false,
): BattleResults {
  return {
    players,
    done,
    winnerId: byForfeit
      ? (Object.keys(done)[0] ?? null)
      : decideWinner(done),
    byForfeit,
  };
}

/** Host is the earliest joiner (deterministic across clients via presence). */
export function pickHostId(roster: PlayerInfo[]): string | null {
  if (roster.length === 0) return null;
  return [...roster].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0].id;
}
