import { describe, it, expect } from 'vitest';
import {
  makeIntervalQuestion, makeChordQuestion, makeSolfegeQuestion,
  makeProgressionQuestion, makeMelodyQuestion, makeTransposeQuestion,
  makeRhythmQuestion, makeTempoQuestion, makeBpmQuestion,
} from '../questionFactory';
import { MAX_LEVEL } from '../../modes/levels';

describe('questionFactory — every mode × every level produces a valid question', () => {
  // For each mode + level, generate a handful of questions and assert basic
  // invariants. Each itemKey must be non-empty (otherwise SRS can't track it),
  // and the returned `mode`/`level` must match what was requested.
  for (let level = 1; level <= MAX_LEVEL; level++) {
    it(`interval Lv${level}`, () => {
      const q = makeIntervalQuestion(level, 'fixed', 'C');
      expect(q.mode).toBe('interval');
      expect(q.level).toBe(level);
      expect(q.itemKey).toBeTruthy();
      expect((q.data as { type: string }).type).toBe('interval');
    });
    it(`chord Lv${level}`, () => {
      const q = makeChordQuestion(level, 'fixed', 'C', false);
      expect(q.mode).toBe('chord');
      expect(q.level).toBe(level);
      expect(q.itemKey).toBeTruthy();
    });
    it(`solfege Lv${level}`, () => {
      const q = makeSolfegeQuestion(level, 'fixed', 'C');
      expect(q.mode).toBe('solfege');
      expect(q.level).toBe(level);
      expect(q.itemKey).toBeTruthy();
    });
    it(`progression Lv${level}`, () => {
      const q = makeProgressionQuestion(level, 'fixed', 'C', 'diatonic');
      expect(q.mode).toBe('progression');
      expect(q.level).toBe(level);
      expect(q.itemKey).toBeTruthy();
    });
    it(`melody Lv${level}`, () => {
      const q = makeMelodyQuestion(level, 'fixed', 'C');
      expect(q.mode).toBe('melody');
      expect(q.level).toBe(level);
      const data = q.data as { type: string; notes: string[] };
      expect(data.type).toBe('melody');
      expect(data.notes.length).toBeGreaterThan(0);
    });
    it(`transpose Lv${level}`, () => {
      const q = makeTransposeQuestion(level, 'fixed', 'C');
      expect(q.mode).toBe('transpose');
      expect(q.level).toBe(level);
      expect(q.itemKey).toBeTruthy();
      const data = q.data as { type: string; notes: string[]; degrees: number[]; key: string };
      expect(data.type).toBe('transpose');
      expect(data.notes.length).toBe(data.degrees.length);
      expect(data.notes.length).toBeGreaterThanOrEqual(2);
      // Reference tone must be the tonic of the picked key — without it, the
      // degree answer is ambiguous.
      expect(q.context.referenceToneNote).toBe(data.key + '4');
      // Answer must be the degree sequence (numbers), not interval names —
      // that's the fix that distinguishes this mode from interval mode.
      expect(Array.isArray(q.answer)).toBe(true);
      expect((q.answer as number[]).every((d) => typeof d === 'number')).toBe(true);
    });
    it(`rhythm Lv${level}`, () => {
      const q = makeRhythmQuestion(level);
      expect(q.mode).toBe('rhythm');
      expect(q.level).toBe(level);
      const data = q.data as { type: string; bpm: number };
      expect(data.type).toBe('rhythm');
      expect(data.bpm).toBeGreaterThan(0);
    });
    it(`tempo Lv${level}`, () => {
      const q = makeTempoQuestion(level);
      expect(q.mode).toBe('tempo');
      expect(q.level).toBe(level);
      const data = q.data as { type: string; bpm: number; holdBeats: number };
      expect(data.bpm).toBeGreaterThan(0);
      expect(data.holdBeats).toBeGreaterThan(0);
    });
    it(`bpm Lv${level}`, () => {
      const q = makeBpmQuestion(level);
      expect(q.mode).toBe('bpm');
      expect(q.level).toBe(level);
      const data = q.data as { type: string; inputMode: 'choice' | 'slider'; choices?: number[] };
      if (data.inputMode === 'choice') {
        expect(data.choices).toBeDefined();
        expect(data.choices!.length).toBeGreaterThan(1);
        expect(data.choices!).toContain(q.answer);
      }
    });
  }
});

describe('questionFactory — interval Lv2 introduces "down" direction', () => {
  // The whole point of parameter separation is that Lv2 adds *exactly one*
  // new variable over Lv1: the descending direction. Sample enough questions
  // to see at least one 'down' at Lv2 and zero at Lv1.
  it('Lv1 never produces direction="down"', () => {
    for (let i = 0; i < 30; i++) {
      const q = makeIntervalQuestion(1, 'fixed', 'C');
      const direction = (q.data as { direction: string }).direction;
      expect(direction).not.toBe('down');
    }
  });
  it('Lv2 can produce direction="down"', () => {
    let sawDown = false;
    for (let i = 0; i < 60 && !sawDown; i++) {
      const q = makeIntervalQuestion(2, 'fixed', 'C');
      if ((q.data as { direction: string }).direction === 'down') sawDown = true;
    }
    expect(sawDown).toBe(true);
  });
});

describe('questionFactory — chord Lv5 switches arpeggio→block', () => {
  it('Lv4 plays as arpeggio', () => {
    const q = makeChordQuestion(4, 'fixed', 'C', false);
    expect((q.data as { arpeggio: boolean }).arpeggio).toBe(true);
  });
  it('Lv5 plays as block chord', () => {
    const q = makeChordQuestion(5, 'fixed', 'C', false);
    expect((q.data as { arpeggio: boolean }).arpeggio).toBe(false);
  });
});

describe('questionFactory — bpm Lv7 transitions to slider', () => {
  it('Lv6 is choice mode', () => {
    const q = makeBpmQuestion(6);
    expect((q.data as { inputMode: string }).inputMode).toBe('choice');
  });
  it('Lv7 is slider mode', () => {
    const q = makeBpmQuestion(7);
    expect((q.data as { inputMode: string }).inputMode).toBe('slider');
  });
});
