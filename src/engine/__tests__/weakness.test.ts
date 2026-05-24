import { describe, it, expect } from 'vitest';
import { weaknessScore, weightedPool, pickWeighted, topWeakItems, suggestLevel, weakFocusLevel } from '../weakness';
import type { StatsItem, ModeStats } from '../../types';

const item = (overrides: Partial<StatsItem> = {}): StatsItem => ({
  attempts: 0, correct: 0, recent: [], lastSeen: Date.now(), ...overrides,
});

describe('weaknessScore', () => {
  it('returns 0.5 for never-attempted items (unknown)', () => {
    expect(weaknessScore(item())).toBe(0.5);
  });
  it('high accuracy + perfect recent → low score', () => {
    const s = weaknessScore(item({ attempts: 10, correct: 10, recent: [1, 1, 1, 1] }));
    expect(s).toBeLessThan(0.15);
  });
  it('low accuracy + all-wrong recent → high score', () => {
    const s = weaknessScore(item({ attempts: 10, correct: 0, recent: [0, 0, 0, 0] }));
    expect(s).toBeGreaterThan(0.85);
  });
  it('long-unseen items get an age bonus', () => {
    const fresh = weaknessScore(item({ attempts: 5, correct: 5, lastSeen: Date.now() }));
    const stale = weaknessScore(item({
      attempts: 5, correct: 5,
      lastSeen: Date.now() - 30 * 24 * 60 * 60 * 1000,
    }));
    expect(stale).toBeGreaterThan(fresh);
  });
});

describe('weightedPool / pickWeighted', () => {
  const stats: ModeStats = {
    easy: item({ attempts: 20, correct: 20, recent: [1, 1, 1, 1] }),
    hard: item({ attempts: 20, correct: 2,  recent: [0, 0, 0, 0] }),
  };

  it('produces more "hard" slots than "easy" in the pool', () => {
    const pool = weightedPool(stats, ['easy', 'hard']);
    const easyCount = pool.filter((k) => k === 'easy').length;
    const hardCount = pool.filter((k) => k === 'hard').length;
    expect(hardCount).toBeGreaterThan(easyCount);
  });

  it('pickWeighted avoids immediate repetition of lastKey when possible', () => {
    for (let i = 0; i < 30; i++) {
      const pick = pickWeighted(stats, ['easy', 'hard'], 'hard');
      // When the alternative is non-empty, we should never pick lastKey.
      // pool with 'easy' filtered keeps 'easy' available, so pick must be 'easy'.
      // (hard dominates the pool but the filter removes it entirely.)
      expect(pick).toBe('easy');
    }
  });

  it('falls back gracefully when the only candidate equals lastKey', () => {
    const pick = pickWeighted(stats, ['solo'], 'solo');
    expect(pick).toBe('solo');
  });

  it('handles empty itemKeys', () => {
    expect(pickWeighted({}, [])).toBe('');
  });
});

describe('topWeakItems', () => {
  it('returns top-N weakest by score', () => {
    const stats: ModeStats = {
      a: item({ attempts: 10, correct: 10 }),
      b: item({ attempts: 10, correct: 5  }),
      c: item({ attempts: 10, correct: 2  }),
    };
    const top = topWeakItems(stats, 2);
    expect(top.map((x) => x.key)).toEqual(['c', 'b']);
  });
});

describe('weakFocusLevel', () => {
  const weak = item({ attempts: 10, correct: 1, recent: [0, 0, 0, 0] });

  it('falls back when there are no attempted items', () => {
    expect(weakFocusLevel('interval', {}, 10, 1)).toBe(1);
  });

  it('picks the lowest interval level whose pool contains the weak item', () => {
    // m2_up only appears from Lv4 (PLUS_2_6); _down only from Lv2.
    expect(weakFocusLevel('interval', { 'm2_up': weak }, 10)).toBe(4);
    expect(weakFocusLevel('interval', { 'P5_down': weak }, 10)).toBe(2);
  });

  it('picks a level covering the hardest weak item across a set', () => {
    // P5_up (Lv1) + M6_down (Lv4) → need Lv4 to cover both.
    const lv = weakFocusLevel('interval', { 'P5_up': weak, 'M6_down': weak }, 10);
    expect(lv).toBe(4);
  });

  it('picks the chord level that introduces the weak quality', () => {
    // dominant7 first appears at Lv6.
    expect(weakFocusLevel('chord', { 'dominant7_inv0': weak }, 10)).toBe(6);
  });

  it('parses the level from level-encoded item keys (transpose)', () => {
    expect(weakFocusLevel('transpose', { 'transpose_lv3': weak }, 10)).toBe(3);
  });

  it('falls back for modes with no enumerable pool', () => {
    expect(weakFocusLevel('melody', { 'whatever': weak }, 10, 2)).toBe(2);
  });
});

describe('suggestLevel', () => {
  // Build a ModeStats with 5+ items so suggestLevel's `items.length >= 5` guard
  // passes, and each item carries a `recent` window biased to the desired
  // overall accuracy.
  const mk = (acc: number): ModeStats => {
    const out: ModeStats = {};
    for (let i = 0; i < 6; i++) {
      const recent = Array.from({ length: 8 }, (_, j) => (j / 8 < acc ? 1 : 0));
      out[`item${i}`] = item({ attempts: 8, correct: recent.filter((x) => x === 1).length, recent });
    }
    return out;
  };

  it('bumps level up when recent accuracy >= 85%', () => {
    expect(suggestLevel(mk(1.0), 1, 3)).toBe(2);
  });
  it('drops level when recent accuracy < 60%', () => {
    expect(suggestLevel(mk(0.25), 3, 3)).toBe(2);
  });
  it('holds when in-band', () => {
    expect(suggestLevel(mk(0.75), 2, 3)).toBe(2);
  });
  it('never exceeds maxLevel or drops below 1', () => {
    expect(suggestLevel(mk(1.0), 3, 3)).toBe(3);
    expect(suggestLevel(mk(0.0), 1, 3)).toBe(1);
  });
});
