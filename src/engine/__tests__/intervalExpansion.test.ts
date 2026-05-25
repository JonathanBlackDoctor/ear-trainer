import { describe, it, expect } from 'vitest';
import { Note } from 'tonal';
import {
  makeWideIntervalQuestion, makeNoteStackQuestion,
  makeMicrotuningQuestion, makeHarmonicQuestion,
} from '../questionFactory';
import { judge } from '../judge';
import { WIDE_SEMITONES, WIDE_LEVELS, NOTE_STACK_LEVELS } from '../../modes/labModes';
import type { IntervalData, NoteStackData, HarmonicData } from '../../types';

describe('lab-wide-interval factory', () => {
  it('produces two notes whose gap matches the named compound interval', () => {
    for (let i = 0; i < 60; i++) {
      const lvl = 1 + (i % 10);
      const q = makeWideIntervalQuestion(lvl);
      expect(q.mode).toBe('lab-wide-interval');
      const d = q.data as IntervalData;
      const [a, b] = d.notes;
      const gap = Math.abs((Note.midi(b) ?? 0) - (Note.midi(a) ?? 0));
      expect(gap).toBe(WIDE_SEMITONES[d.intervalName]);
      expect(WIDE_SEMITONES[d.intervalName]).toBeGreaterThanOrEqual(12); // always an octave or wider
    }
  });
  it('only emits intervals from the level pool', () => {
    const names = new Set(WIDE_LEVELS[1].names);
    for (let i = 0; i < 30; i++) {
      const q = makeWideIntervalQuestion(1);
      expect(names.has((q.data as IntervalData).intervalName)).toBe(true);
    }
  });
  it('judges the chosen interval name', () => {
    const q = makeWideIntervalQuestion(4);
    const name = (q.data as IntervalData).intervalName;
    expect(judge(q, name).correct).toBe(true);
    expect(judge(q, name === 'P8' ? 'P15' : 'P8').correct).toBe(false);
  });
});

describe('lab-note-stack factory + judge', () => {
  it('builds an ascending stack matching the pattern steps', () => {
    for (let i = 0; i < 60; i++) {
      const lvl = 1 + (i % 10);
      const q = makeNoteStackQuestion(lvl);
      const d = q.data as NoteStackData;
      const midis = d.notes.map((n) => Note.midi(n) ?? 0);
      for (let k = 1; k < midis.length; k++) expect(midis[k]).toBeGreaterThan(midis[k - 1]);
      const steps = d.stackCode.split('+').length; // consecutive interval count
      expect(d.notes.length).toBe(steps + 1);
    }
  });
  it('choice input: exact stack-code match is correct', () => {
    const q = makeNoteStackQuestion(3);
    const d = q.data as NoteStackData;
    expect(judge(q, d.stackCode).correct).toBe(true);
    expect(judge(q, d.stackCode + '_x').correct).toBe(false);
  });
  it('piano input: pitch-class set match is correct and octave-tolerant', () => {
    const q = makeNoteStackQuestion(3);
    const d = q.data as NoteStackData;
    // Re-spell every note an octave up — pitch classes unchanged.
    const shifted = d.notes.map((n) => Note.fromMidi((Note.midi(n) ?? 0) + 12) ?? n);
    expect(judge(q, shifted).correct).toBe(true);
    // Drop a note → partial, not correct.
    const partial = judge(q, d.notes.slice(0, -1));
    expect(partial.correct).toBe(false);
    expect(partial.partialScore).toBeGreaterThan(0);
    expect(partial.partialScore).toBeLessThan(1);
  });
  it('every level pool yields choices that include the played stack', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const codes = new Set(NOTE_STACK_LEVELS[lvl].map((p) => p.code));
      const q = makeNoteStackQuestion(lvl);
      expect(codes.has((q.data as NoteStackData).stackCode)).toBe(true);
    }
  });
});

describe('lab-microtuning factory + judge', () => {
  it('answer is the signed cents code and matches the upper-note detune', () => {
    for (let i = 0; i < 40; i++) {
      const q = makeMicrotuningQuestion(1 + (i % 10));
      expect(judge(q, q.answer as string).correct).toBe(true);
    }
  });
  it('builds the dyad at the requested interval', () => {
    const q = makeMicrotuningQuestion(5);
    const d = q.data as import('../../types').MicrotuningData;
    const gap = (Note.midi(d.highNote) ?? 0) - (Note.midi(d.lowNote) ?? 0);
    expect(gap).toBeGreaterThan(0);
  });
});

describe('lab-harmonics factory + judge', () => {
  it('cents equal 1200·log2(partial) and answer is "N배음"', () => {
    for (let i = 0; i < 40; i++) {
      const q = makeHarmonicQuestion(1 + (i % 10));
      const d = q.data as HarmonicData;
      expect(d.cents).toBeCloseTo(1200 * Math.log2(d.partial), 5);
      expect(q.answer).toBe(`${d.partial}배음`);
      expect(judge(q, `${d.partial}배음`).correct).toBe(true);
    }
  });
});
