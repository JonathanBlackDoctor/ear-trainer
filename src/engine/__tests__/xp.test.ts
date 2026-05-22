import { describe, it, expect } from 'vitest';
import { awardXp, rankFor, RANK_TIERS } from '../xp';

describe('awardXp', () => {
  it('full XP on a fast correct Lv1 answer with combo 1', () => {
    const a = awardXp({
      level: 1, correct: true, partialScore: 1,
      timeTakenMs: 2000, comboAfterAnswer: 1,
    });
    // base = 8 + 1*4 = 12, correctness = 1, speed = 12*0.3*(8/7)*1 ≈ 4.11
    // comboMult = 1 (combo 1 → 0 steps). total = round(12 + ~4.11) ≈ 16
    expect(a.total).toBeGreaterThanOrEqual(15);
    expect(a.total).toBeLessThanOrEqual(17);
    expect(a.combo).toBe(1);
  });

  it('wrong answer with partial credit gets discounted XP', () => {
    const a = awardXp({
      level: 1, correct: false, partialScore: 0.7,
      timeTakenMs: 8000, comboAfterAnswer: 0,
    });
    // base=12, correctness=0.7*0.6=0.42, speed ~ 12*0.3*0.286*0.42, combo=1.0
    expect(a.total).toBeGreaterThan(0);
    expect(a.total).toBeLessThan(10);
  });

  it('combo multiplier grows by 10% per consecutive step (capped at 2.0x)', () => {
    const noCombo = awardXp({ level: 5, correct: true, partialScore: 1, timeTakenMs: 4000, comboAfterAnswer: 1 });
    const combo5 = awardXp({ level: 5, correct: true, partialScore: 1, timeTakenMs: 4000, comboAfterAnswer: 5 });
    expect(combo5.combo).toBeCloseTo(1.4, 2);
    expect(combo5.total).toBeGreaterThan(noCombo.total);
    const combo20 = awardXp({ level: 5, correct: true, partialScore: 1, timeTakenMs: 4000, comboAfterAnswer: 20 });
    expect(combo20.combo).toBe(2.0);
  });

  it('speed bonus zero when answer is slow (>= 10s)', () => {
    const a = awardXp({ level: 1, correct: true, partialScore: 1, timeTakenMs: 12000, comboAfterAnswer: 1 });
    expect(a.speed).toBe(0);
    expect(a.total).toBe(12); // base 12 * correctness 1 * combo 1
  });

  it('a skipped (wrong, 0 partial) answer yields 0 XP', () => {
    const a = awardXp({ level: 3, correct: false, partialScore: 0, timeTakenMs: 5000, comboAfterAnswer: 0 });
    expect(a.total).toBe(0);
  });

  it('higher level → higher base XP', () => {
    const lv1 = awardXp({ level: 1, correct: true, partialScore: 1, timeTakenMs: 5000, comboAfterAnswer: 1 });
    const lv10 = awardXp({ level: 10, correct: true, partialScore: 1, timeTakenMs: 5000, comboAfterAnswer: 1 });
    expect(lv10.total).toBeGreaterThan(lv1.total * 2);
  });
});

describe('rankFor', () => {
  it('returns bronze1 at 0 XP', () => {
    const r = rankFor(0);
    expect(r.tier.id).toBe('bronze1');
    expect(r.next?.id).toBe('bronze2');
    expect(r.progress).toBe(0);
  });

  it('progresses linearly within a tier', () => {
    const r = rankFor(100); // halfway through bronze1 (0..200)
    expect(r.tier.id).toBe('bronze1');
    expect(r.progress).toBeCloseTo(0.5, 2);
    expect(r.xpToNext).toBe(100);
  });

  it('crosses tier boundary exactly', () => {
    expect(rankFor(200).tier.id).toBe('bronze2');
    expect(rankFor(1199).tier.id).toBe('bronze3');
    expect(rankFor(1200).tier.id).toBe('silver');
    expect(rankFor(50000).tier.id).toBe('master');
  });

  it('at master, progress=1 and no next tier', () => {
    const r = rankFor(99999);
    expect(r.tier.id).toBe('master');
    expect(r.next).toBeNull();
    expect(r.progress).toBe(1);
    expect(r.xpToNext).toBe(0);
  });

  it('handles negative XP defensively', () => {
    expect(rankFor(-100).tier.id).toBe('bronze1');
  });
});

describe('RANK_TIERS', () => {
  it('thresholds are strictly increasing', () => {
    for (let i = 1; i < RANK_TIERS.length; i++) {
      expect(RANK_TIERS[i].min).toBeGreaterThan(RANK_TIERS[i - 1].min);
    }
  });
});
