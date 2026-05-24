import { describe, it, expect } from 'vitest';
import {
  makeIntervalQuestion, makeChordQuestion, makeSolfegeQuestion,
  makeProgressionQuestion, makeMelodyQuestion, makeTransposeQuestion,
  makeRhythmQuestion, makeTempoQuestion, makeBpmQuestion,
  makeScaleQuestion, makeCadenceQuestion, makeInversionQuestion,
  makeIntervalCompareQuestion, makeOddNoteQuestion, makeContourQuestion,
  makeTuningQuestion, makeFunctionQuestion, makeExtendedQuestion,
  makeBassQuestion, makeTensionQuestion,
  type SelectOpts,
} from '../questionFactory';
import { itemKeysForLevel } from '../itemPool';
import type { ModeKey, Question } from '../../types';
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
      const data = q.data as {
        type: string; degrees: number[]; fromKey: string; toKey: string;
        fromNotes: string[]; toNotes: string[];
      };
      expect(data.type).toBe('transpose');
      // A real key change always happens — that's what makes this transposition
      // rather than melody dictation.
      expect(data.fromKey).not.toBe(data.toKey);
      expect(data.fromNotes.length).toBe(data.degrees.length);
      expect(data.toNotes.length).toBe(data.degrees.length);
      expect(data.degrees.length).toBeGreaterThanOrEqual(2);
      // Answer is the transposed (toKey) notes; reference tone is the toKey tonic.
      expect(q.answer).toEqual(data.toNotes);
      expect(q.context.referenceToneNote).toBe(data.toKey + '4');
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

// Every item-focusable mode, called through a uniform builder so the weak-focus
// machinery (candidate filter + itemKey enumeration) can be exercised generically.
const BUILD: Partial<Record<ModeKey, (level: number, opts?: SelectOpts) => Question>> = {
  interval: (l, o) => makeIntervalQuestion(l, 'fixed', 'C', o?.lastItemKey, o?.srs, o?.stats, o?.candidateFilter),
  chord: (l, o) => makeChordQuestion(l, 'fixed', 'C', false, o?.lastItemKey, o?.srs, o?.stats, o?.candidateFilter),
  solfege: (l, o) => makeSolfegeQuestion(l, 'fixed', 'C', o?.lastItemKey, o?.srs, o?.stats, o?.candidateFilter),
  'lab-scale': makeScaleQuestion,
  'lab-cadence': makeCadenceQuestion,
  'lab-inversion': makeInversionQuestion,
  'lab-interval-compare': makeIntervalCompareQuestion,
  'lab-odd-note': makeOddNoteQuestion,
  'lab-contour': makeContourQuestion,
  'lab-tuning': makeTuningQuestion,
  'lab-function': makeFunctionQuestion,
  'lab-extended': makeExtendedQuestion,
  'lab-bass': makeBassQuestion,
  'lab-tension': makeTensionQuestion,
};

describe('weak-focus — itemPool enumerators match the keys factories actually produce', () => {
  for (const mode of Object.keys(BUILD) as ModeKey[]) {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      it(`${mode} Lv${level} stays within its enumerated pool`, () => {
        const pool = new Set(itemKeysForLevel(mode, level));
        expect(pool.size).toBeGreaterThan(0);
        for (let i = 0; i < 40; i++) {
          const q = BUILD[mode]!(level, undefined);
          expect(pool.has(q.itemKey)).toBe(true);
        }
      });
    }
  }
});

describe('weak-focus — candidateFilter restricts questions to the targeted item', () => {
  for (const mode of Object.keys(BUILD) as ModeKey[]) {
    it(`${mode} drills only the filtered itemKey`, () => {
      const pool = itemKeysForLevel(mode, MAX_LEVEL);
      const target = pool[0];
      const opts: SelectOpts = { candidateFilter: (k) => k === target };
      for (let i = 0; i < 30; i++) {
        const q = BUILD[mode]!(MAX_LEVEL, opts);
        expect(q.itemKey).toBe(target);
      }
    });
  }

  it('falls back to the full pool when the filter matches nothing', () => {
    const opts: SelectOpts = { candidateFilter: () => false };
    const pool = new Set(itemKeysForLevel('lab-function', 5));
    const q = makeFunctionQuestion(5, opts);
    expect(pool.has(q.itemKey)).toBe(true);
  });
});
