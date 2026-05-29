import { describe, it, expect } from 'vitest';
import { scoreAnswer, decideWinner, buildResults, pickHostId } from '../battleMachine';
import type { PlayerDone, PlayerInfo } from '../types';

describe('scoreAnswer', () => {
  it('gives 0 for a wrong answer regardless of speed', () => {
    expect(scoreAnswer(false, 0, 10_000)).toBe(0);
    expect(scoreAnswer(false, 5_000, 10_000)).toBe(0);
  });

  it('gives 100 base + full speed bonus for an instant correct answer', () => {
    expect(scoreAnswer(true, 0, 10_000)).toBe(200);
  });

  it('decays the speed bonus linearly toward the deadline', () => {
    expect(scoreAnswer(true, 5_000, 10_000)).toBe(150);
    expect(scoreAnswer(true, 10_000, 10_000)).toBe(100);
  });

  it('never goes below the 100 base for a correct (even late) answer', () => {
    expect(scoreAnswer(true, 999_999, 10_000)).toBe(100);
  });
});

const done = (playerId: string, score: number, correctMs: number, correct = 0): PlayerDone =>
  ({ playerId, score, correctMs, correct });

describe('decideWinner', () => {
  it('picks the higher score', () => {
    expect(decideWinner({ a: done('a', 300, 5000), b: done('b', 200, 1000) })).toBe('a');
  });

  it('breaks ties on lower total correct time', () => {
    expect(decideWinner({ a: done('a', 200, 8000), b: done('b', 200, 4000) })).toBe('b');
  });

  it('returns null for a full tie (draw)', () => {
    expect(decideWinner({ a: done('a', 200, 4000), b: done('b', 200, 4000) })).toBeNull();
  });
});

describe('buildResults', () => {
  const players: PlayerInfo[] = [
    { id: 'a', nick: 'A', joinedAt: 1 },
    { id: 'b', nick: 'B', joinedAt: 2 },
  ];

  it('computes the winner normally', () => {
    const r = buildResults(players, { a: done('a', 300, 1), b: done('b', 100, 1) });
    expect(r.winnerId).toBe('a');
    expect(r.byForfeit).toBe(false);
  });

  it('awards the only remaining player on forfeit', () => {
    const r = buildResults(players, { a: done('a', 0, 0) }, true);
    expect(r.winnerId).toBe('a');
    expect(r.byForfeit).toBe(true);
  });
});

describe('pickHostId', () => {
  it('chooses the earliest joiner', () => {
    const roster: PlayerInfo[] = [
      { id: 'b', nick: 'B', joinedAt: 200 },
      { id: 'a', nick: 'A', joinedAt: 100 },
    ];
    expect(pickHostId(roster)).toBe('a');
  });

  it('is deterministic on a joinedAt tie via id', () => {
    const roster: PlayerInfo[] = [
      { id: 'z', nick: 'Z', joinedAt: 100 },
      { id: 'a', nick: 'A', joinedAt: 100 },
    ];
    expect(pickHostId(roster)).toBe('a');
  });

  it('returns null for an empty roster', () => {
    expect(pickHostId([])).toBeNull();
  });
});
