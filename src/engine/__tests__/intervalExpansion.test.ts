import { describe, it, expect } from 'vitest';
import { Note } from 'tonal';
import {
  makeWideIntervalQuestion, makeNoteStackQuestion,
  makeMicrotuningQuestion, makeHarmonicQuestion,
} from '../questionFactory';
import { judge } from '../judge';
import { WIDE_SEMITONES, WIDE_LEVELS, NOTE_STACK_LEVELS, getNoteStackChoices } from '../../modes/labModes';
import { semitoneToSolfege } from '../../theory/solfege';
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

describe('lab-note-stack (다성 계명) factory + judge', () => {
  it('builds ascending distinct notes within the level spacing constraints', () => {
    for (let i = 0; i < 60; i++) {
      const lvl = 1 + (i % 10);
      const cfg = NOTE_STACK_LEVELS[lvl];
      const q = makeNoteStackQuestion(lvl);
      const d = q.data as NoteStackData;
      const n = Number(q.itemKey.slice('stack_n'.length));
      expect(cfg.noteCounts).toContain(n);
      expect(d.notes.length).toBe(n);
      const midis = d.notes.map((nt) => Note.midi(nt) ?? 0);
      for (let k = 1; k < midis.length; k++) {
        expect(midis[k] - midis[k - 1]).toBeGreaterThanOrEqual(cfg.minGap);
      }
      expect(midis[midis.length - 1] - midis[0]).toBeLessThanOrEqual(cfg.maxSpan);
      expect(midis[0]).toBeGreaterThanOrEqual(48);  // C3
      expect(midis[midis.length - 1]).toBeLessThanOrEqual(84);  // C6
    }
  });
  it('syllables align with the notes relative to the key, all from the level pool', () => {
    for (let i = 0; i < 60; i++) {
      const lvl = 1 + (i % 10);
      const cfg = NOTE_STACK_LEVELS[lvl];
      const q = makeNoteStackQuestion(lvl);
      const d = q.data as NoteStackData;
      expect(d.syllables.length).toBe(d.notes.length);
      expect(new Set(d.syllables).size).toBe(d.syllables.length); // distinct pitch classes
      const tonicMidi = Note.midi(d.key + '4') ?? 60;
      d.notes.forEach((nt, idx) => {
        const semis = (((Note.midi(nt) ?? 60) - tonicMidi) % 12 + 12) % 12;
        expect(semitoneToSolfege(semis)).toBe(d.syllables[idx]);
        expect(cfg.candidates).toContain(d.syllables[idx]);
      });
      expect(q.context.referenceToneNote).toBe(d.key + '4');
      expect(q.context.absoluteMode).toBeFalsy();
    }
  });
  it('judges the syllable set order-free with partial credit', () => {
    const q = makeNoteStackQuestion(4); // 3 notes, diatonic
    const d = q.data as NoteStackData;
    expect(judge(q, [...d.syllables].reverse()).correct).toBe(true);
    // Drop one syllable → partial, not correct.
    const partial = judge(q, d.syllables.slice(0, -1));
    expect(partial.correct).toBe(false);
    expect(partial.partialScore).toBeCloseTo((d.syllables.length - 1) / d.syllables.length, 5);
    // Replace one syllable with a wrong one → partial.
    const wrongSyl = ['도', '레', '미', '파', '솔', '라', '시'].find((s) => !d.syllables.includes(s))!;
    const mixed = judge(q, [...d.syllables.slice(0, -1), wrongSyl]);
    expect(mixed.correct).toBe(false);
    expect(mixed.partialScore).toBeLessThan(1);
    // A duplicate of an already-matched syllable only counts once.
    const dup = judge(q, [d.syllables[0], d.syllables[0], d.syllables[1]]);
    expect(dup.correct).toBe(false);
  });
  it('every syllable answer is offered by the level choice grid', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      const choices = new Set(getNoteStackChoices(lvl).map((c) => c.value));
      const q = makeNoteStackQuestion(lvl);
      for (const syl of (q.data as NoteStackData).syllables) {
        expect(choices.has(syl)).toBe(true);
      }
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
