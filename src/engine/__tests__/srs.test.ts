import { describe, it, expect } from 'vitest';
import { makeCard, updateCard, pickDue, ensureCard } from '../srs';
import type { ModeSrs, ModeStats, StatsItem } from '../../types';

const stat = (correct: number, attempts: number, recent: number[] = []): StatsItem => ({
  correct, attempts, recent, lastSeen: 0,
});

describe('srs', () => {
  describe('makeCard', () => {
    it('higher weakness lowers initial ease (sees it sooner)', () => {
      const easy = makeCard(0);
      const hard = makeCard(1);
      expect(hard.ease).toBeLessThan(easy.ease);
      expect(hard.ease).toBeGreaterThanOrEqual(1.3);
      expect(easy.ease).toBeLessThanOrEqual(2.8);
    });
    it('is due immediately', () => {
      const now = 1_000_000;
      const card = makeCard(0.5, now);
      expect(card.due).toBeLessThanOrEqual(now);
      expect(card.reps).toBe(0);
    });
  });

  describe('updateCard', () => {
    it('wrong answer drops ease and resets interval to 1 minute', () => {
      const start = makeCard(0.2, 0);
      const after = updateCard(start, 0, 100_000);
      expect(after.ease).toBeLessThan(start.ease);
      expect(after.interval).toBe(1);
      expect(after.reps).toBe(0);
      expect(after.due).toBe(100_000 + 60_000);
    });
    it('first correct schedules ~1 minute out, second correct ~10 minutes', () => {
      const c0 = makeCard(0.5, 0);
      const c1 = updateCard(c0, 1, 1000);
      expect(c1.interval).toBe(1);
      expect(c1.reps).toBe(1);
      const c2 = updateCard(c1, 1, 2000);
      expect(c2.interval).toBe(10);
      expect(c2.reps).toBe(2);
    });
    it('subsequent correct answers compound via ease factor', () => {
      let c = makeCard(0.5, 0);
      c = updateCard(c, 1, 0);
      c = updateCard(c, 1, 0);
      const before = c.interval;
      c = updateCard(c, 1, 0);
      expect(c.interval).toBeGreaterThan(before);
    });
    it('ease never escapes [1.3, 2.8]', () => {
      let c = makeCard(0, 0);
      for (let i = 0; i < 50; i++) c = updateCard(c, 1, 0);
      expect(c.ease).toBeLessThanOrEqual(2.8);
      for (let i = 0; i < 50; i++) c = updateCard(c, 0, 0);
      expect(c.ease).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('pickDue', () => {
    const stats: ModeStats = { a: stat(1, 1), b: stat(0, 1), c: stat(0, 0) };

    it('returns "" for empty candidate list', () => {
      expect(pickDue({}, stats, [], 0)).toBe('');
    });
    it('picks the most-overdue due card', () => {
      const now = 10_000;
      const srs: ModeSrs = {
        a: { ease: 2.0, interval: 1, due: now - 100, reps: 1 },
        b: { ease: 2.0, interval: 1, due: now - 5000, reps: 1 },
      };
      expect(pickDue(srs, stats, ['a', 'b'], now)).toBe('b');
    });
    it('prefers unseen items when nothing is due', () => {
      const now = 0;
      const srs: ModeSrs = { a: { ease: 2.0, interval: 60, due: now + 1_000_000, reps: 5 } };
      const pick = pickDue(srs, stats, ['a', 'b', 'c'], now);
      expect(['b', 'c']).toContain(pick);
    });
    it('avoids immediate repetition when alternative exists', () => {
      const now = 1000;
      const srs: ModeSrs = {
        a: { ease: 2.0, interval: 1, due: now - 100, reps: 1 },
        b: { ease: 2.0, interval: 1, due: now - 100, reps: 1 },
      };
      // Both due — but `lastKey: 'a'` should filter a out.
      expect(pickDue(srs, stats, ['a', 'b'], now, 'a')).toBe('b');
    });
  });

  describe('ensureCard', () => {
    it('returns existing card unchanged', () => {
      const existing = { ease: 1.5, interval: 7, due: 999, reps: 3 };
      const srs: ModeSrs = { x: existing };
      expect(ensureCard(srs, {}, 'x')).toBe(existing);
    });
    it('creates a new card using stats weakness when missing', () => {
      const stats: ModeStats = { y: stat(0, 5) };
      const card = ensureCard({}, stats, 'y');
      expect(card.reps).toBe(0);
      expect(card.interval).toBe(1);
    });
  });
});
