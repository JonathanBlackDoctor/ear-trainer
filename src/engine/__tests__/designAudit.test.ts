import { describe, it, expect } from 'vitest';
import { Note } from 'tonal';
import {
  makeOddNoteQuestion, makeMicrotuningQuestion, makeBassQuestion, makeScaleQuestion,
} from '../questionFactory';
import { getMicrotuningChoices, getBassChoices } from '../../modes/labModes';
import { degreeToNote } from '../../theory/progressions';
import { formatItemKey } from '../../modes/itemLabels';
import { MODE_REGISTRY } from '../../modes/registry';
import { useStore } from '../../store/useStore';
import type { OddNoteData, ScaleData, ChordData, ModeKey } from '../../types';

// ── A1: odd-note alteration must never coincide with another scale tone ──────
describe('A1 — odd-note has no ambiguous/duplicate altered note', () => {
  it('the altered note differs from every other played note (all distinct)', () => {
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 150; i++) {
        const q = makeOddNoteQuestion(level);
        const d = q.data as OddNoteData;
        const midis = d.notes.map((n) => Note.midi(n));
        // No duplicates anywhere → the "odd" note is unambiguous.
        expect(new Set(midis).size).toBe(midis.length);
        // The altered slot is genuinely out of the reference scale.
        const altMidi = Note.midi(d.notes[d.wrongIndex]);
        const correctMidi = Note.midi(d.correctNotes[d.wrongIndex]);
        expect(altMidi).not.toBe(correctMidi);
      }
    }
  });
});

// ── A2: microtuning answers are magnitude-only (beat rate can't give sign) ───
describe('A2 — microtuning is magnitude-only and answerable', () => {
  it('choices carry no sign and the answer is among them', () => {
    for (let level = 1; level <= 10; level++) {
      const choices = getMicrotuningChoices(level);
      expect(choices.length).toBeGreaterThanOrEqual(2);
      for (const c of choices) {
        expect(c.value).not.toMatch(/[+-]/);
        expect(Number(c.value)).toBeGreaterThanOrEqual(0);
      }
      const values = choices.map((c) => c.value);
      for (let i = 0; i < 50; i++) {
        const q = makeMicrotuningQuestion(level, {});
        expect(values).toContain(q.answer);
      }
    }
  });
});

// ── B1: bass is a key-relative scale degree with a sounded tonic reference ───
describe('B1 — bass identification is relative (no absolute pitch required)', () => {
  it('answers a scale degree, plays a tonic reference, and matches the choices', () => {
    for (let level = 1; level <= 10; level++) {
      const choices = getBassChoices(level).map((c) => c.value);
      for (let i = 0; i < 80; i++) {
        const q = makeBassQuestion(level, {});
        expect(q.context.referenceToneNote).toBeTruthy();
        expect(q.context.absoluteMode).toBeFalsy();
        expect(String(q.answer)).toMatch(/^\d도$/);
        expect(choices).toContain(q.answer);
      }
    }
  });
});

// ── B2: bass is independent of the upper chord (slash-chord redesign) ────────
describe('B2 — bass lives in its own register and is not implied by the chord', () => {
  it('the bass note is strictly the lowest, in octave 2, and matches the answer degree', () => {
    for (let level = 1; level <= 10; level++) {
      for (let i = 0; i < 80; i++) {
        const q = makeBassQuestion(level, {});
        const d = q.data as ChordData;
        const midis = d.notes.map((n) => Note.midi(n) ?? 0);
        // Strictly lowest with a real registral gap (bass ≤ B2 < C3 ≤ upper).
        expect(midis[0]).toBeLessThanOrEqual(47);
        for (let k = 1; k < midis.length; k++) expect(midis[k]).toBeGreaterThanOrEqual(48);
        // The bass pitch class is the answered scale degree of the key.
        const deg = Number(String(q.answer).replace('도', ''));
        const expectedPc = Note.pitchClass(degreeToNote(deg, q.context.key, 2));
        expect(Note.pitchClass(d.notes[0])).toBe(expectedPc);
      }
    }
  });
  it('chord-tone levels keep the bass inside the upper chord; free levels escape it', () => {
    // Compare by chroma: the bass comes from the (possibly flat-spelled) scale
    // while buildChord re-spells with sharps — Bb and A# must match.
    const bassInUpper = (q: ReturnType<typeof makeBassQuestion>) => {
      const d = q.data as ChordData;
      const upperChromas = new Set(d.notes.slice(1).map((n) => Note.chroma(n)));
      return upperChromas.has(Note.chroma(d.notes[0]));
    };
    for (let i = 0; i < 120; i++) {
      expect(bassInUpper(makeBassQuestion(1 + (i % 6), {}))).toBe(true);
    }
    let sawOutside = false;
    for (let i = 0; i < 300 && !sawOutside; i++) {
      if (!bassInUpper(makeBassQuestion(7 + (i % 4), {}))) sawOutside = true;
    }
    expect(sawOutside).toBe(true);
  });
  it('the same upper chord appears over different basses (no degree→answer shortcut)', () => {
    // Group L1 samples by upper-chord root pitch class; at least one root must
    // occur with ≥2 distinct answers, i.e. chord identity ≠ bass identity.
    const answersByRoot = new Map<string, Set<string>>();
    for (let i = 0; i < 250; i++) {
      const q = makeBassQuestion(1, {});
      const d = q.data as ChordData;
      const root = Note.pitchClass(d.root);
      if (!answersByRoot.has(root)) answersByRoot.set(root, new Set());
      answersByRoot.get(root)!.add(String(q.answer));
    }
    const decoupled = [...answersByRoot.values()].some((s) => s.size >= 2);
    expect(decoupled).toBe(true);
  });
});

// ── C2: melodic minor is never played descending (ambiguous w/ natural minor) ─
describe('C2 — melodic minor scale is ascending-only', () => {
  it('never produces a descending melodic minor at the top (descending) tier', () => {
    let sawMelodic = false;
    for (let i = 0; i < 3000; i++) {
      const q = makeScaleQuestion(10, {}); // level 10 → descending probability 1
      const d = q.data as ScaleData;
      if (d.scaleName === 'melodic minor') {
        sawMelodic = true;
        expect(d.direction).toBe('up');
      }
    }
    expect(sawMelodic).toBe(true);
  });
});

// ── C1: thin mix modes cap maxLevel to real content (no padded/identical lvls) ─
describe('C1 — mix modes advertise only their genuine level ceiling', () => {
  it('caps maxLevel for the perceptually-limited mix modes', () => {
    const caps: Partial<Record<ModeKey, number>> = {
      'mix-pan': 5, 'mix-reverb-type': 5, 'mix-modulation': 5,
      'mix-compression': 6, 'mix-width': 6, 'mix-distortion': 6,
    };
    for (const [mode, max] of Object.entries(caps)) {
      expect(MODE_REGISTRY[mode as ModeKey].maxLevel).toBe(max);
    }
  });
});

// ── U5: stats/result item keys render as human labels, not raw keys ──────────
describe('U5 — formatItemKey yields readable labels', () => {
  it('maps representative keys and never leaks internal separators', () => {
    expect(formatItemKey('interval', 'M3_up')).toContain('장3도');
    expect(formatItemKey('chord', 'dominant7_inv0')).toContain('속7');
    expect(formatItemKey('chord', 'minor_inv1')).toContain('1전위');
    expect(formatItemKey('chord', 'minor_inv1')).not.toContain('_inv');
    expect(formatItemKey('lab-bass', 'bass_deg3')).toBe('3도');
    expect(formatItemKey('progression', 'prog_1-4-5__lv3')).toContain('진행');
    expect(formatItemKey('mix-eq-freq', 'eq-freq_1000')).toMatch(/Hz|kHz/);
    expect(formatItemKey('lab-cadence', 'cadence_authentic')).toContain('정격');
  });
});

// ── U8: a skip is a non-event for per-item stats / accuracy / SRS ────────────
describe('U8 — skips do not dent stats or weakness', () => {
  it('recordResult ignores skipped results', () => {
    useStore.getState().resetData();
    useStore.getState().recordResult(
      { questionId: 'x', itemKey: 'M3_up', mode: 'interval', level: 1, correct: false, skipped: true, partialScore: 0, timeTaken: 100, xpEarned: 0, comboAtAnswer: 0 },
      0,
    );
    const stats = useStore.getState().stats['interval'] ?? {};
    expect(stats['M3_up']).toBeUndefined();
    expect(useStore.getState().gamification.lifetimeAnswers).toBe(0);
  });
});
