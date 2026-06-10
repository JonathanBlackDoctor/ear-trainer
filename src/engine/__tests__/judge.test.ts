import { describe, it, expect } from 'vitest';
import { judge } from '../judge';
import type { Question, ProgressionAnswer } from '../../types';

function q(partial: Partial<Question>): Question {
  return {
    id: 't', mode: 'interval', level: 1, itemKey: 'k',
    data: { type: 'interval', notes: [], direction: 'up', intervalName: 'P5' },
    answer: 'P5',
    context: { key: 'C' },
    ...partial,
  } as Question;
}

describe('judge — string modes (interval/chord/solfege)', () => {
  it('marks an exact string match correct', () => {
    const r = judge(q({}), 'P5');
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBe(1);
  });
  it('marks a wrong string as 0', () => {
    const r = judge(q({}), 'P4');
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBe(0);
  });
});

describe('judge — melody', () => {
  const ques = q({
    mode: 'melody',
    answer: ['C4', 'D4', 'E4'],
    data: { type: 'melody', notes: ['C4', 'D4', 'E4'], key: 'C' },
  });
  it('full match', () => {
    const r = judge(ques, ['C4', 'D4', 'E4']);
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBe(1);
  });
  it('partial credit on 2/3 matches', () => {
    const r = judge(ques, ['C4', 'D4', 'F4']);
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeCloseTo(2 / 3);
  });
  it('wrong length → 0', () => {
    const r = judge(ques, ['C4', 'D4']);
    expect(r.partialScore).toBe(0);
  });
  it('enharmonic-equivalent input (A#4 vs Bb4) counts as correct', () => {
    const fQues = q({
      mode: 'melody',
      answer: ['F4', 'A4', 'Bb4'],
      data: { type: 'melody', notes: ['F4', 'A4', 'Bb4'], key: 'F' },
    });
    // Piano always emits sharp form, so the user's correct play of Bb4
    // is reported as A#4 — judge must treat them as equivalent.
    const r = judge(fQues, ['F4', 'A4', 'A#4']);
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBe(1);
  });
});

describe('judge — transpose', () => {
  const ques = q({
    mode: 'transpose',
    answer: ['G4', 'B4', 'D5'],
    data: {
      type: 'transpose', degrees: [1, 3, 5], fromKey: 'C', toKey: 'G',
      fromNotes: ['C4', 'E4', 'G4'], toNotes: ['G4', 'B4', 'D5'],
    },
  });
  it('exact transposed notes → correct', () => {
    const r = judge(ques, ['G4', 'B4', 'D5']);
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBe(1);
  });
  it('octave-shifted but same pitch classes → still correct', () => {
    const r = judge(ques, ['G3', 'B3', 'D4']);
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBe(1);
  });
  it('one wrong note → partial credit', () => {
    const r = judge(ques, ['G4', 'B4', 'E5']);
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeCloseTo(2 / 3);
  });
  it('wrong length → 0', () => {
    const r = judge(ques, ['G4', 'B4']);
    expect(r.partialScore).toBe(0);
  });
});

describe('judge — progression', () => {
  const answer: ProgressionAnswer[] = [
    { degree: 1, quality: 'M' }, { degree: 4, quality: 'M' }, { degree: 5, quality: 'M' },
  ];
  const ques = q({
    mode: 'progression',
    answer,
    data: { type: 'progression', chords: [], key: 'C', source: 'diatonic', playback: 'block' },
  });
  it('partial: matches by both degree AND quality', () => {
    const r = judge(ques, [
      { degree: 1, quality: 'M' }, { degree: 4, quality: 'm' }, { degree: 5, quality: 'M' },
    ]);
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeCloseTo(2 / 3);
  });
  it('non-array answer → 0', () => {
    const r = judge(ques, 'oops' as any);
    expect(r.partialScore).toBe(0);
  });
});

describe('judge — lab-note-stack (계이름 집합)', () => {
  const ques = q({
    mode: 'lab-note-stack',
    answer: ['도', '미', '솔'],
    data: { type: 'note-stack', notes: ['C3', 'E4', 'G4'], syllables: ['도', '미', '솔'], key: 'C' },
  });
  it('order-free full set → correct', () => {
    const r = judge(ques, ['솔', '도', '미']);
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBe(1);
  });
  it('missing one syllable → partial, not correct', () => {
    const r = judge(ques, ['도', '미']);
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeCloseTo(2 / 3);
  });
  it('a duplicate pick only counts once', () => {
    const r = judge(ques, ['도', '도', '미']);
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeCloseTo(2 / 3);
  });
  it('wrong syllable in the set → partial', () => {
    const r = judge(ques, ['도', '미', '라']);
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeCloseTo(2 / 3);
  });
});

describe('judge — rhythm', () => {
  const expected = [0, 500, 1000, 1500];
  const ques = q({ mode: 'rhythm', answer: expected, level: 1,
    data: { type: 'rhythm', pattern: [], bpm: 120 } });
  it('all taps within ±120ms → correct', () => {
    const r = judge(ques, [10, 510, 990, 1450]);
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBe(1);
  });
  it('most taps miss → not correct, partial reflects hits', () => {
    const r = judge(ques, [200, 800, 1300, 2000]);
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeLessThan(1);
  });
  it('wrong number of taps → 0', () => {
    expect(judge(ques, [0, 500]).partialScore).toBe(0);
  });
});

describe('judge — tempo', () => {
  // Generate ideal taps at exact target BPM.
  function evenTaps(bpm: number, count: number, start = 1000): number[] {
    const ms = 60_000 / bpm;
    return Array.from({ length: count }, (_, i) => start + i * ms);
  }
  const ques = q({ mode: 'tempo', answer: 100, level: 1,
    data: { type: 'tempo', bpm: 100, countInBeats: 4, holdBeats: 8 } });

  it('perfect taps → correct with full score', () => {
    const r = judge(ques, evenTaps(100, 9));
    expect(r.correct).toBe(true);
    expect(r.partialScore).toBeCloseTo(1, 2);
    expect(r.details?.kind).toBe('tempo');
  });
  it('within tolerance (5% on Lv1) → correct', () => {
    const r = judge(ques, evenTaps(104, 9));
    expect(r.correct).toBe(true);
  });
  it('beyond tolerance → incorrect but partial credit nonzero', () => {
    const r = judge(ques, evenTaps(112, 9));
    expect(r.correct).toBe(false);
    expect(r.partialScore).toBeGreaterThan(0);
    expect(r.partialScore).toBeLessThan(1);
  });
  it('fewer than 2 taps → 0', () => {
    expect(judge(ques, [1000]).partialScore).toBe(0);
  });
});

describe('judge — bpm', () => {
  const choiceQ = q({ mode: 'bpm', answer: 100, level: 1,
    data: { type: 'bpm', bpm: 100, beats: 8, inputMode: 'choice', choices: [60, 80, 100, 120] } });
  const sliderQ = q({ mode: 'bpm', answer: 100, level: 3,
    data: { type: 'bpm', bpm: 100, beats: 8, inputMode: 'slider' } });

  it('choice mode requires exact match', () => {
    expect(judge(choiceQ, 100).correct).toBe(true);
    expect(judge(choiceQ, 99).correct).toBe(false);
  });
  it('slider mode allows ±3 BPM', () => {
    expect(judge(sliderQ, 102).correct).toBe(true);
    expect(judge(sliderQ, 105).correct).toBe(false);
  });
  it('non-number guess → 0', () => {
    expect(judge(choiceQ, NaN as any).partialScore).toBe(0);
  });
});
