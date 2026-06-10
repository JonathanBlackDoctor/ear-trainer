import { describe, it, expect } from 'vitest';
import { Note } from 'tonal';
import {
  voicingCost, pickNextVoicing, buildProgressionSteps,
  degreeToNote, PROGRESSION_LEVELS,
} from '../progressions';
import { buildChord } from '../chords';
import { makeProgressionQuestion } from '../../engine/questionFactory';
import type { ProgressionData } from '../../types';

const midis = (notes: string[]) => notes.map((n) => Note.midi(n) ?? 0);
const pcSet = (notes: string[]) => new Set(notes.map((n) => Note.pitchClass(n)));

// Diatonic (degree, quality) pairs in the factory's vocabulary.
const DIATONIC: Array<[number, string]> = [
  [1, 'major'], [2, 'minor'], [3, 'minor'], [4, 'major'],
  [5, 'dominant7'], [6, 'minor'], [7, 'dim'],
];

describe('voicingCost', () => {
  it('is zero for identical voicings and symmetric', () => {
    const a = buildChord('C3', 'major', 0);
    const b = buildChord('G3', 'major', 1);
    expect(voicingCost(a, a)).toBe(0);
    expect(voicingCost(a, b)).toBe(voicingCost(b, a));
    expect(voicingCost(a, b)).toBeGreaterThan(0);
  });
});

describe('pickNextVoicing', () => {
  it('preserves the chord pitch-class set, stays in the register window, and beats root position', () => {
    for (const key of ['C', 'G', 'F', 'Bb', 'E']) {
      let prev = buildChord(degreeToNote(1, key, 3), 'major', 0);
      for (const [deg, quality] of DIATONIC) {
        const rootPc = Note.pitchClass(degreeToNote(deg, key, 3));
        const next = pickNextVoicing(prev, rootPc, quality);
        // Same chord tones, just re-voiced.
        expect(pcSet(next)).toEqual(pcSet(buildChord(rootPc + '3', quality, 0)));
        // Register window: above the octave-2 bass, below the squeal register.
        const ms = midis(next);
        expect(Math.min(...ms)).toBeGreaterThanOrEqual(48); // C3
        expect(Math.max(...ms)).toBeLessThanOrEqual(69);    // A4
        // Never a worse connection than the legacy root-position jump —
        // comparable only when root position itself fits the register window
        // (e.g. vii° in Bb tops out above A4 and is rightly excluded).
        const rootPos = buildChord(degreeToNote(deg, key, 3), quality, 0);
        const rms = midis(rootPos);
        if (Math.min(...rms) >= 48 && Math.max(...rms) <= 69) {
          expect(voicingCost(prev, next)).toBeLessThanOrEqual(voicingCost(prev, rootPos));
        }
        prev = next;
      }
    }
  });

  it('re-uses the previous voicing when the same chord repeats', () => {
    const prev = pickNextVoicing(buildChord('C3', 'major', 0), 'F', 'major');
    const again = pickNextVoicing(prev, 'F', 'major');
    expect(again).toEqual(prev);
  });
});

describe('buildProgressionSteps', () => {
  const pattern: Array<[number, string]> = [[1, 'major'], [5, 'dominant7'], [6, 'minor'], [4, 'major']];

  it('without opts matches the legacy root-position output (lab-cadence/function regression guard)', () => {
    const steps = buildProgressionSteps(pattern, 'C', 3);
    steps.forEach((step, i) => {
      const [deg, quality] = pattern[i];
      expect(step.degree).toBe(deg);
      expect(step.notes).toEqual(buildChord(degreeToNote(deg, 'C', 3), quality, 0));
      expect(step.bass).toBeUndefined();
    });
  });

  it('with bass adds the octave-2 root strictly below every upper voice', () => {
    const steps = buildProgressionSteps(pattern, 'C', 3, { bass: true });
    for (const step of steps) {
      expect(step.bass).toBeTruthy();
      const bassMidi = Note.midi(step.bass!) ?? 0;
      expect(Note.pitchClass(step.bass!)).toBe(Note.pitchClass(degreeToNote(step.degree, 'C', 2)));
      expect(bassMidi).toBeLessThan(Math.min(...midis(step.notes)));
    }
  });

  it('with voiceLeading keeps the first chord legacy and smooth-connects the rest', () => {
    const steps = buildProgressionSteps(pattern, 'C', 3, { voiceLeading: true });
    expect(steps[0].notes).toEqual(buildChord(degreeToNote(1, 'C', 3), 'major', 0));
    for (let i = 1; i < steps.length; i++) {
      const [deg, quality] = pattern[i];
      // Chord tones intact despite re-voicing.
      expect(pcSet(steps[i].notes)).toEqual(pcSet(buildChord(degreeToNote(deg, 'C', 3), quality, 0)));
      // Not a worse connection than the legacy root-position jump.
      const rootPos = buildChord(degreeToNote(deg, 'C', 3), quality, 0);
      expect(voicingCost(steps[i - 1].notes, steps[i].notes))
        .toBeLessThanOrEqual(voicingCost(steps[i - 1].notes, rootPos));
    }
  });
});

describe('progression level gating (makeProgressionQuestion)', () => {
  it('L1-2 keep the bare legacy sound: root position, no bass', () => {
    for (const level of [1, 2]) {
      for (let i = 0; i < 20; i++) {
        const q = makeProgressionQuestion(level, 'fixed', 'C', 'diatonic');
        const d = q.data as ProgressionData;
        for (const step of d.chords) {
          expect(step.bass).toBeUndefined();
          expect(step.notes).toEqual(
            buildChord(degreeToNote(step.degree, d.key, 3), invQuality(step.quality), 0),
          );
        }
      }
    }
  });

  it('L3 adds the bass only; L4+ adds voice leading too', () => {
    expect(PROGRESSION_LEVELS[3].bass).toBe(true);
    expect(PROGRESSION_LEVELS[3].voiceLeading).toBe(false);
    for (let level = 4; level <= 10; level++) {
      expect(PROGRESSION_LEVELS[level].voiceLeading).toBe(true);
      expect(PROGRESSION_LEVELS[level].bass).toBe(true);
    }
    // Level 9 randomizes the key — the bass must stay strictly lowest in every
    // key (octave-2 pinning), not just in C.
    for (const level of [4, 9]) {
      for (let i = 0; i < 20; i++) {
        const q = makeProgressionQuestion(level, 'fixed', 'C', 'diatonic');
        const d = q.data as ProgressionData;
        for (const step of d.chords) {
          expect(step.bass).toBeTruthy();
          const bassMidi = Note.midi(step.bass!) ?? 99;
          expect(bassMidi).toBeLessThanOrEqual(47); // B2 — octave 2 proper
          expect(bassMidi).toBeLessThan(Math.min(...midis(step.notes)));
        }
      }
    }
  });

  it('answer/itemKey formats are unchanged by the voicing upgrade', () => {
    for (const level of [1, 4, 9]) {
      const q = makeProgressionQuestion(level, 'fixed', 'C', 'diatonic');
      expect(q.itemKey).toMatch(/^prog_\d(-\d)*__lv\d+$/);
      const answer = q.answer as Array<{ degree: number; quality: string }>;
      expect(answer.length).toBe((q.data as ProgressionData).chords.length);
      for (const a of answer) {
        expect(a.degree).toBeGreaterThanOrEqual(1);
        expect(a.degree).toBeLessThanOrEqual(7);
      }
    }
  });

  it('praise progressions get the same per-level voicing treatment', () => {
    for (let i = 0; i < 20; i++) {
      const q = makeProgressionQuestion(4, 'fixed', 'C', 'praise');
      const d = q.data as ProgressionData;
      for (const step of d.chords) expect(step.bass).toBeTruthy();
    }
  });
});

// ChordStep stores the short quality code; map back to the builder vocabulary.
function invQuality(short: string): string {
  const map: Record<string, string> = {
    M: 'major', m: 'minor', dim: 'dim', aug: 'aug',
    '7': 'dominant7', M7: 'major7', m7: 'minor7', m7b5: 'm7b5',
  };
  return map[short] ?? 'major';
}
