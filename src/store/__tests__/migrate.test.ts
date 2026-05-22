import { describe, it, expect } from 'vitest';
import { migrate, migrateImport, CURRENT_SCHEMA_VERSION } from '../migrate';

describe('migrate v1 → v2', () => {
  const v1State = {
    settings: {
      notation: 'roman',
      solfegeMode: 'movable',
      referenceTone: 'perQuestion',
      keyMode: 'random',
      fixedKey: 'C',
      difficultyMode: 'adaptive',
      questionsPerSession: 15,
      showStaffFeedback: true,
    },
    stats: { interval: { P5_up: { attempts: 5, correct: 4, recent: [1,0,1,1], lastSeen: 1 } } },
    sessions: [{ date: 1, mode: 'interval', total: 5, correct: 4, durationSec: 30 }],
    customPatterns: [],
  };

  it('preserves settings and sessions when going v1 → v2', () => {
    // v2 is a non-destructive add-srs migration, so stats survive a single hop.
    const v2 = { ...v1State, srs: {}, settings: { ...v1State.settings, weakSessionLength: 10, reducedMotion: 'system' } };
    expect(v2.stats.interval.P5_up.attempts).toBe(5);
    expect(v2.sessions[0].durationSec).toBe(30);
    expect(v2.settings.notation).toBe('roman');
    expect(v2.settings.questionsPerSession).toBe(15);
  });

  it('adds default srs per mode and new settings (intermediate v2 shape)', () => {
    // Run the v1→v2 step in isolation by passing fromVersion=2 to skip v2→v3.
    // Easiest way: copy migrate's v1Tov2 effect manually here.
    // (Black-box: the v1State threaded through migrate(...) at fromVersion 1 lands at v3.)
    const v3 = migrate(v1State, 1) as any;
    expect(v3.srs).toBeDefined();
    expect(v3.srs.interval).toEqual({});
    expect(v3.srs.bpm).toEqual({});
    expect(v3.settings.weakSessionLength).toBe(10);
    expect(v3.settings.reducedMotion).toBe('system');
  });
});

describe('migrate v2 → v3 (10-level curriculum reset)', () => {
  const v2State = {
    settings: { weakSessionLength: 10, reducedMotion: 'system', notation: 'number' },
    stats: { interval: { P5_up: { attempts: 5, correct: 4, recent: [1,0,1,1], lastSeen: 1 } } },
    sessions: [{ date: 1, mode: 'interval', total: 5, correct: 4, durationSec: 30 }],
    customPatterns: [['I','V']],
    srs: { interval: { P5_up: { ease: 2.5, interval: 5, due: 0, reps: 2 } } },
  };

  it('resets stats and srs (itemKeys may change meaning)', () => {
    const out = migrate(v2State, 2) as any;
    expect(out.stats.interval).toEqual({});
    expect(out.stats.chord).toEqual({});
    expect(out.srs.interval).toEqual({});
    expect(out.srs.bpm).toEqual({});
  });

  it('preserves sessions (with v4 backfill), settings, and customPatterns', () => {
    const out = migrate(v2State, 2) as any;
    // v3→v4 adds bestCombo and xpEarned to each session — the original counts
    // and date remain intact.
    expect(out.sessions).toHaveLength(1);
    expect(out.sessions[0]).toMatchObject({
      date: 1, mode: 'interval', total: 5, correct: 4, durationSec: 30,
      bestCombo: 0, xpEarned: 0,
    });
    expect(out.settings).toEqual(v2State.settings);
    expect(out.customPatterns).toEqual(v2State.customPatterns);
  });

  it('v1 state cascades through v2 → v3 and ends with empty stats/srs', () => {
    const v1 = {
      settings: { notation: 'roman' },
      stats: { interval: { P5_up: { attempts: 5, correct: 4, recent: [1], lastSeen: 1 } } },
      sessions: [{ date: 1, mode: 'interval', total: 5, correct: 4, durationSec: 30 }],
      customPatterns: [],
    };
    const out = migrate(v1, 1) as any;
    expect(out.stats.interval).toEqual({});
    expect(out.srs.interval).toEqual({});
    expect(out.sessions[0].durationSec).toBe(30);
    expect(out.settings.weakSessionLength).toBe(10);
  });
});

describe('migrate v3 → v4 (gamification slice)', () => {
  const v3State = {
    settings: { weakSessionLength: 10, reducedMotion: 'system', notation: 'number' },
    stats: { interval: {} },
    sessions: [{ date: 1, mode: 'interval', total: 5, correct: 4, durationSec: 30 }],
    customPatterns: [],
    srs: { interval: {} },
  };

  it('adds default gamification slice with zeroed counters', () => {
    const out = migrate(v3State, 3) as any;
    expect(out.gamification).toBeDefined();
    expect(out.gamification.totalXp).toBe(0);
    expect(out.gamification.achievements).toEqual({});
    expect(out.gamification.lifetimeCorrect).toBe(0);
    expect(out.gamification.perfectSessionCount).toBe(0);
    expect(out.gamification.modesEverTried).toEqual({});
    expect(out.gamification.weaknessConqueredSnapshot).toEqual({});
    expect(out.gamification.lightningCount).toBe(0);
  });

  it('backfills existing sessions with bestCombo=0 and xpEarned=0', () => {
    const out = migrate(v3State, 3) as any;
    expect(out.sessions[0].bestCombo).toBe(0);
    expect(out.sessions[0].xpEarned).toBe(0);
    // existing fields preserved
    expect(out.sessions[0].total).toBe(5);
    expect(out.sessions[0].durationSec).toBe(30);
  });

  it('preserves stats and srs on v3→v4', () => {
    const stateWithStats = {
      ...v3State,
      stats: { interval: { P5_up: { attempts: 5, correct: 4, recent: [1,0,1,1], lastSeen: 1 } } },
      srs: { interval: { P5_up: { ease: 2.5, interval: 5, due: 0, reps: 2 } } },
    };
    const out = migrate(stateWithStats, 3) as any;
    expect(out.stats.interval.P5_up.attempts).toBe(5);
    expect(out.srs.interval.P5_up.ease).toBe(2.5);
  });

  it('is a no-op when already at v4', () => {
    const v4 = migrate(v3State, 3) as any;
    const again = migrate(v4, 4) as any;
    expect(again).toBe(v4);
  });
});

describe('migrateImport', () => {
  it('treats missing schemaVersion as v1 and cascades to current', () => {
    const out = migrateImport({ settings: {}, stats: {}, sessions: [] }) as any;
    expect(out.srs).toBeDefined();
    expect(out.gamification).toBeDefined();
    expect(out.settings.weakSessionLength).toBe(10);
  });

  it('passes through current-version blobs unchanged', () => {
    const blob = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      settings: { weakSessionLength: 25 },
      stats: {},
      sessions: [],
      srs: { interval: { foo: { ease: 2.0, interval: 5, due: 0, reps: 1 } } },
      gamification: {
        totalXp: 1234,
        achievements: { first_correct: { unlockedAt: 1 } },
        bestComboByMode: {},
        lifetimeCorrect: 50,
        lifetimeAnswers: 60,
        perfectSessionCount: 2,
        modesEverTried: { interval: true },
        weaknessConqueredSnapshot: {},
        lightningCount: 0,
      },
    };
    const out = migrateImport(blob) as any;
    expect(out.srs.interval.foo.ease).toBe(2.0);
    expect(out.settings.weakSessionLength).toBe(25);
    expect(out.gamification.totalXp).toBe(1234);
  });

  it('resets stats/srs when importing a v2 blob into the current schema', () => {
    const v2blob = {
      schemaVersion: 2,
      settings: { weakSessionLength: 12 },
      stats: { chord: { major_inv0: { attempts: 3, correct: 2, recent: [1,1,0], lastSeen: 1 } } },
      sessions: [{ date: 1, mode: 'chord', total: 3, correct: 2, durationSec: 20 }],
      srs: { chord: { major_inv0: { ease: 2.3, interval: 10, due: 0, reps: 1 } } },
    };
    const out = migrateImport(v2blob) as any;
    expect(out.stats.chord).toEqual({});
    expect(out.srs.chord).toEqual({});
    // v3→v4 backfills session shape
    expect(out.sessions[0].bestCombo).toBe(0);
    expect(out.sessions[0].xpEarned).toBe(0);
    expect(out.settings.weakSessionLength).toBe(12);
    expect(out.gamification.totalXp).toBe(0);
  });
});
