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

  it('preserves existing stats and sessions', () => {
    const out = migrate(v1State, 1) as any;
    expect(out.stats.interval.P5_up.attempts).toBe(5);
    expect(out.sessions[0].durationSec).toBe(30);
    expect(out.settings.notation).toBe('roman');
    expect(out.settings.questionsPerSession).toBe(15);
  });

  it('adds default srs per mode and new settings', () => {
    const out = migrate(v1State, 1) as any;
    expect(out.srs).toBeDefined();
    expect(out.srs.interval).toEqual({});
    expect(out.srs.bpm).toEqual({});
    expect(out.settings.weakSessionLength).toBe(10);
    expect(out.settings.reducedMotion).toBe('system');
  });

  it('is a no-op when already at v2', () => {
    const v2 = migrate(v1State, 1) as any;
    const again = migrate(v2, 2) as any;
    expect(again.srs).toBe(v2.srs);
    expect(again.settings).toBe(v2.settings);
  });
});

describe('migrateImport', () => {
  it('treats missing schemaVersion as v1', () => {
    const out = migrateImport({ settings: {}, stats: {}, sessions: [] }) as any;
    expect(out.srs).toBeDefined();
    expect(out.settings.weakSessionLength).toBe(10);
  });

  it('passes through v2 blobs', () => {
    const v2blob = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      settings: { weakSessionLength: 25 },
      stats: {}, sessions: [], srs: { interval: { foo: { ease: 2.0, interval: 5, due: 0, reps: 1 } } },
    };
    const out = migrateImport(v2blob) as any;
    expect(out.srs.interval.foo.ease).toBe(2.0);
    expect(out.settings.weakSessionLength).toBe(25);
  });
});
