import { describe, it, expect } from 'vitest';
import { evaluateAchievements, ACHIEVEMENTS_BY_ID } from '../achievements';
import type { GamificationState, ModeKey, ModeStats, SessionResult } from '../../types';

function emptyState(overrides: Partial<GamificationState> = {}): GamificationState {
  return {
    totalXp: 0,
    achievements: {},
    bestComboByMode: {},
    lifetimeCorrect: 0,
    lifetimeAnswers: 0,
    perfectSessionCount: 0,
    modesEverTried: {},
    weaknessConqueredSnapshot: {},
    lightningCount: 0,
    ...overrides,
  };
}

function emptyStats(): Record<ModeKey, ModeStats> {
  const keys: ModeKey[] = [
    'interval','chord','progression','melody','solfege','transpose',
    'rhythm','tempo','bpm','lab-scale','lab-cadence','lab-inversion',
  ];
  return Object.fromEntries(keys.map((k) => [k, {}])) as Record<ModeKey, ModeStats>;
}

function fakeResult(overrides: Partial<SessionResult> = {}): SessionResult {
  return {
    questionId: 'q1', itemKey: 'P5_up', mode: 'interval', level: 1,
    correct: true, skipped: false, partialScore: 1,
    timeTaken: 2000, xpEarned: 12, comboAtAnswer: 1,
    ...overrides,
  };
}

describe('evaluateAchievements — volume', () => {
  it('unlocks first_correct on first correct answer', () => {
    const ids = evaluateAchievements({
      state: emptyState({ lifetimeCorrect: 1 }),
      stats: emptyStats(),
      lastResult: fakeResult(),
      comboAtAnswer: 1,
    });
    expect(ids).toContain('first_correct');
  });

  it('unlocks correct_10 and correct_100 at the right thresholds', () => {
    expect(evaluateAchievements({
      state: emptyState({ lifetimeCorrect: 10 }),
      stats: emptyStats(), comboAtAnswer: 1,
    })).toContain('correct_10');
    expect(evaluateAchievements({
      state: emptyState({ lifetimeCorrect: 100 }),
      stats: emptyStats(), comboAtAnswer: 1,
    })).toContain('correct_100');
  });

  it('does not re-unlock already-unlocked achievements', () => {
    const ids = evaluateAchievements({
      state: emptyState({
        lifetimeCorrect: 100,
        achievements: { first_correct: { unlockedAt: 1 }, correct_10: { unlockedAt: 1 } },
      }),
      stats: emptyStats(), comboAtAnswer: 1,
    });
    expect(ids).not.toContain('first_correct');
    expect(ids).not.toContain('correct_10');
    expect(ids).toContain('correct_100');
  });
});

describe('evaluateAchievements — streak', () => {
  it('combo_3 fires at 3 consecutive correct', () => {
    const ids = evaluateAchievements({
      state: emptyState({ lifetimeCorrect: 3 }),
      stats: emptyStats(),
      lastResult: fakeResult(),
      comboAtAnswer: 3,
    });
    expect(ids).toContain('combo_3');
  });

  it('combo_10 requires comboAtAnswer >= 10', () => {
    expect(evaluateAchievements({
      state: emptyState({ lifetimeCorrect: 10 }),
      stats: emptyStats(), comboAtAnswer: 9,
    })).not.toContain('combo_10');
    expect(evaluateAchievements({
      state: emptyState({ lifetimeCorrect: 10 }),
      stats: emptyStats(), comboAtAnswer: 10,
    })).toContain('combo_10');
  });
});

describe('evaluateAchievements — mastery', () => {
  it('master_interval requires 50+ attempts at 90%+ accuracy', () => {
    const stats = emptyStats();
    stats.interval.P5_up = { attempts: 50, correct: 45, recent: [], lastSeen: 0 };
    expect(evaluateAchievements({
      state: emptyState(), stats, comboAtAnswer: 1,
    })).toContain('master_interval');
  });

  it('does not unlock mastery below threshold', () => {
    const stats = emptyStats();
    stats.interval.P5_up = { attempts: 50, correct: 40, recent: [], lastSeen: 0 };
    expect(evaluateAchievements({
      state: emptyState(), stats, comboAtAnswer: 1,
    })).not.toContain('master_interval');
  });
});

describe('evaluateAchievements — completion', () => {
  it('try_all_modes unlocks when 9 core modes have been tried', () => {
    const state = emptyState({
      modesEverTried: {
        interval: true, chord: true, solfege: true, progression: true, melody: true,
        transpose: true, rhythm: true, tempo: true, bpm: true,
      },
    });
    expect(evaluateAchievements({ state, stats: emptyStats(), comboAtAnswer: 1 })).toContain('try_all_modes');
  });

  it('perfect_session unlocks after 1 perfect, perfect_session_10 after 10', () => {
    expect(evaluateAchievements({
      state: emptyState({ perfectSessionCount: 1 }),
      stats: emptyStats(), comboAtAnswer: 1,
    })).toContain('perfect_session');
    expect(evaluateAchievements({
      state: emptyState({ perfectSessionCount: 10 }),
      stats: emptyStats(), comboAtAnswer: 1,
    })).toContain('perfect_session_10');
  });
});

describe('evaluateAchievements — weakness conquered', () => {
  it('fires when snapshot has any value >= 0.9', () => {
    const state = emptyState({
      weaknessConqueredSnapshot: { 'interval:P5_up': 0.92 },
    });
    expect(evaluateAchievements({ state, stats: emptyStats(), comboAtAnswer: 1 }))
      .toContain('weakness_conquered');
  });

  it('does not fire at 0.89', () => {
    const state = emptyState({
      weaknessConqueredSnapshot: { 'interval:P5_up': 0.89 },
    });
    expect(evaluateAchievements({ state, stats: emptyStats(), comboAtAnswer: 1 }))
      .not.toContain('weakness_conquered');
  });
});

describe('evaluateAchievements — speed', () => {
  it('quick_draw needs session avg <= 3000ms across >= 5 answered', () => {
    const r = Array.from({ length: 6 }, () => fakeResult({ timeTaken: 2500 }));
    expect(evaluateAchievements({
      state: emptyState(), stats: emptyStats(),
      sessionResults: r, comboAtAnswer: 1,
    })).toContain('quick_draw');
  });

  it('quick_draw does not fire if avg > 3s', () => {
    const r = Array.from({ length: 6 }, () => fakeResult({ timeTaken: 4500 }));
    expect(evaluateAchievements({
      state: emptyState(), stats: emptyStats(),
      sessionResults: r, comboAtAnswer: 1,
    })).not.toContain('quick_draw');
  });

  it('lightning fires at 5 lifetime <1s correct answers', () => {
    expect(evaluateAchievements({
      state: emptyState({ lightningCount: 5 }),
      stats: emptyStats(), comboAtAnswer: 1,
    })).toContain('lightning');
  });
});

describe('ACHIEVEMENTS_BY_ID', () => {
  it('every achievement has a unique id, name, emoji and description', () => {
    const ids = Object.keys(ACHIEVEMENTS_BY_ID);
    expect(ids.length).toBeGreaterThanOrEqual(20);
    for (const id of ids) {
      const a = ACHIEVEMENTS_BY_ID[id];
      expect(a.name).toBeTruthy();
      expect(a.emoji).toBeTruthy();
      expect(a.description).toBeTruthy();
    }
  });
});
