import { Note, Scale, transpose } from 'tonal';
import { buildChord, type ChordInfo } from './chords';
import type { ChordStep } from '../types';

// Diatonic chord qualities for major key (degrees 1-7)
const MAJOR_DIATONIC: Array<{ quality: string; label: string }> = [
  { quality: 'major',    label: 'I'   },
  { quality: 'minor',    label: 'ii'  },
  { quality: 'minor',    label: 'iii' },
  { quality: 'major',    label: 'IV'  },
  { quality: 'dominant7',label: 'V'   },
  { quality: 'minor',    label: 'vi'  },
  { quality: 'dim',      label: 'vii°'},
];

// Quality shorthand
const Q_MAP: Record<string, 'M' | 'm' | 'dim' | 'aug' | '7' | 'M7' | 'm7' | 'm7b5'> = {
  major:     'M',
  minor:     'm',
  dim:       'dim',
  aug:       'aug',
  dominant7: '7',
  major7:    'M7',
  minor7:    'm7',
  m7b5:      'm7b5',
};

// Praise / CCM common progressions (as degree arrays, 1-indexed)
// Each entry: [degree, quality_key][]
export const PRAISE_PATTERNS: Array<{ name: string; pattern: Array<[number, string]> }> = [
  { name: 'I-V-vi-IV',    pattern: [[1,'major'],[5,'dominant7'],[6,'minor'],[4,'major']] },
  { name: 'vi-IV-I-V',    pattern: [[6,'minor'],[4,'major'],[1,'major'],[5,'dominant7']] },
  { name: 'I-vi-IV-V',    pattern: [[1,'major'],[6,'minor'],[4,'major'],[5,'dominant7']] },
  { name: 'I-IV-V-I',     pattern: [[1,'major'],[4,'major'],[5,'dominant7'],[1,'major']] },
  { name: 'ii-V-I',       pattern: [[2,'minor'],[5,'dominant7'],[1,'major']] },
  { name: 'I-V-vi-iii',   pattern: [[1,'major'],[5,'dominant7'],[6,'minor'],[3,'minor']] },
  { name: 'IV-I-V-vi',    pattern: [[4,'major'],[1,'major'],[5,'dominant7'],[6,'minor']] },
  { name: 'I-IV-vi-V',    pattern: [[1,'major'],[4,'major'],[6,'minor'],[5,'dominant7']] },
  { name: 'I-IV-I-V',     pattern: [[1,'major'],[4,'major'],[1,'major'],[5,'dominant7']] },
  { name: 'vi-V-IV-V',    pattern: [[6,'minor'],[5,'dominant7'],[4,'major'],[5,'dominant7']] },
];

// Common key list for random selection
export const COMMON_KEYS = ['C','G','D','A','E','F','Bb','Eb'];

export interface ProgressionLevelConfig {
  label: string;
  length: 2 | 3 | 4 | 5 | 6;
  degreePool: number[];            // allowed degrees (1..7)
  playback: 'arpeggio' | 'block';
  keyMode: 'fixed' | 'random';
  voiceLeading: boolean;           // smooth-connect each chord to the previous voicing
  bass: boolean;                   // low root note (octave 2) under each chord
}

const CORE_TRIAD = [1, 4, 5];
const CORE_PLUS_VI = [1, 4, 5, 6];
const CORE_PLUS_II = [1, 2, 4, 5, 6];
const CORE_PLUS_III = [1, 2, 3, 4, 5, 6];
const ALL_7 = [1, 2, 3, 4, 5, 6, 7];

const choose = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Functional-harmony transition map for a major key: each degree lists the
// degrees that idiomatically follow it. Used to generate progressions that
// actually sound like music instead of a random walk through the scale.
const DIATONIC_NEXT: Record<number, number[]> = {
  1: [2, 3, 4, 5, 6],
  2: [5, 7, 4, 3],
  3: [6, 4, 2],
  4: [5, 1, 2, 7],
  5: [1, 6],
  6: [2, 4, 5, 1],
  7: [1, 3],
};

// Degrees that make a natural opening (tonic-function or pre-dominant).
const OPENINGS = [1, 6, 4];
// Degrees that give a sense of resolution when they land last.
const RESOLUTIONS = [1, 6];

// Realism ramp: L1-2 keep the bare root-position sound so beginners hear the
// degrees plainly; L3 adds the low root bass (the bass doubles as the answer
// cue, easing the transition); L4+ voice-leads the upper structure so the root
// no longer sits predictably at the bottom — like hearing a real accompaniment.
export const PROGRESSION_LEVELS: Record<number, ProgressionLevelConfig> = {
  1:  { label: '2화음 진행 (I·IV·V)',    length: 2, degreePool: CORE_TRIAD,    playback: 'arpeggio', keyMode: 'fixed',  voiceLeading: false, bass: false },
  2:  { label: '+ vi 추가',              length: 2, degreePool: CORE_PLUS_VI,  playback: 'arpeggio', keyMode: 'fixed',  voiceLeading: false, bass: false },
  3:  { label: '3화음 · 베이스 추가',    length: 3, degreePool: CORE_PLUS_VI,  playback: 'arpeggio', keyMode: 'fixed',  voiceLeading: false, bass: true  },
  4:  { label: '4화음 · 부드러운 연결',  length: 4, degreePool: CORE_PLUS_VI,  playback: 'arpeggio', keyMode: 'fixed',  voiceLeading: true,  bass: true  },
  5:  { label: '+ ii 추가',              length: 4, degreePool: CORE_PLUS_II,  playback: 'arpeggio', keyMode: 'fixed',  voiceLeading: true,  bass: true  },
  6:  { label: '+ iii 추가',             length: 4, degreePool: CORE_PLUS_III, playback: 'arpeggio', keyMode: 'fixed',  voiceLeading: true,  bass: true  },
  7:  { label: '블록 코드 재생',         length: 4, degreePool: CORE_PLUS_III, playback: 'block',    keyMode: 'fixed',  voiceLeading: true,  bass: true  },
  8:  { label: '+ vii° 추가 (전 7도)',   length: 4, degreePool: ALL_7,         playback: 'block',    keyMode: 'fixed',  voiceLeading: true,  bass: true  },
  9:  { label: '5화음 · 랜덤 키',        length: 5, degreePool: ALL_7,         playback: 'block',    keyMode: 'random', voiceLeading: true,  bass: true  },
  10: { label: '6화음 진행 · 랜덤 키',   length: 6, degreePool: ALL_7,         playback: 'block',    keyMode: 'random', voiceLeading: true,  bass: true  },
};

/**
 * Build a progression respecting the level's degreePool and length, walking
 * the functional-harmony transition map so the result sounds musical. The
 * opening chord is chosen from the tonic/pre-dominant degrees (not always I)
 * and the final chord is biased toward a resolution when one is reachable.
 */
export function randomProgressionFromConfig(
  cfg: ProgressionLevelConfig,
  tonic: string,
  octave = 3
): ChordStep[] {
  const { length, degreePool } = cfg;
  const inPool = (d: number) => degreePool.includes(d);

  const openings = OPENINGS.filter(inPool);
  const degrees: number[] = [choose(openings.length > 0 ? openings : degreePool)];

  for (let i = 1; i < length; i++) {
    const prev = degrees[i - 1];
    let candidates = (DIATONIC_NEXT[prev] ?? []).filter((d) => inPool(d) && d !== prev);
    if (candidates.length === 0) candidates = degreePool.filter((d) => d !== prev);
    if (candidates.length === 0) candidates = [...degreePool];
    // On the last step, prefer landing on a resolving degree if one is available.
    if (i === length - 1) {
      const resolved = candidates.filter((d) => RESOLUTIONS.includes(d));
      if (resolved.length > 0) candidates = resolved;
    }
    degrees.push(choose(candidates));
  }

  const pattern: Array<[number, string]> = degrees.map((d) => {
    const info = MAJOR_DIATONIC[(d - 1) % 7];
    return [d, info?.quality ?? 'major'];
  });
  return buildProgressionSteps(pattern, tonic, octave, {
    voiceLeading: cfg.voiceLeading,
    bass: cfg.bass,
  });
}

/** Get the scale notes for a major key */
export function getScaleNotes(tonic: string, octave = 4): string[] {
  const scale = Scale.get(`${tonic}${octave} major`);
  return scale.notes;
}

/** Get the root note for scale degree (1-7) in a given key */
export function degreeToNote(degree: number, tonic: string, octave = 4): string {
  const scale = getScaleNotes(tonic, octave);
  const idx = ((degree - 1) % 7 + 7) % 7;
  return scale[idx] ?? (tonic + octave);
}

const midiOf = (n: string): number => Note.midi(n) ?? 60;

/**
 * Total semitone movement between two voicings: sort both by pitch and sum
 * the index-wise |difference| over the shorter length. Cardinality mismatch
 * (triad → 7th) penalizes every candidate of the next chord equally, so the
 * comparison stays fair.
 */
export function voicingCost(a: string[], b: string[]): number {
  const am = a.map(midiOf).sort((x, y) => x - y);
  const bm = b.map(midiOf).sort((x, y) => x - y);
  const len = Math.min(am.length, bm.length);
  let cost = 0;
  for (let i = 0; i < len; i++) cost += Math.abs(am[i] - bm[i]);
  return cost;
}

// Upper-structure register window for voice-led progressions. The C3 floor
// keeps every voicing strictly above the octave-2 bass (max B2 = midi 47).
const VOICING_LOW = 48;  // C3
const VOICING_HIGH = 69; // A4

const lexLess = (a: number[], b: number[]): boolean => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
};

/**
 * Choose the close voicing of (rootPc, quality) — any inversion, octave 2-4 —
 * that moves least from the previous voicing while staying inside the register
 * window. Ties break deterministically (top-note movement, then inversion,
 * then octave) so generation and tests are stable.
 */
export function pickNextVoicing(prevNotes: string[], rootPc: string, quality: string): string[] {
  const chordLen = buildChord(rootPc + '3', quality, 0).length;
  const candidates: Array<{ notes: string[]; inv: number; oct: number }> = [];
  for (let inv = 0; inv < chordLen; inv++) {
    for (const oct of [2, 3, 4]) {
      candidates.push({ notes: buildChord(`${rootPc}${oct}`, quality, inv), inv, oct });
    }
  }
  const inWindow = candidates.filter(({ notes }) => {
    const ms = notes.map(midiOf);
    return Math.min(...ms) >= VOICING_LOW && Math.max(...ms) <= VOICING_HIGH;
  });
  const pool = inWindow.length > 0 ? inWindow : candidates;

  const prevTop = Math.max(...prevNotes.map(midiOf));
  let best = pool[0];
  let bestKey: number[] | null = null;
  for (const cand of pool) {
    const top = Math.max(...cand.notes.map(midiOf));
    const key = [voicingCost(prevNotes, cand.notes), Math.abs(top - prevTop), cand.inv, cand.oct];
    if (bestKey === null || lexLess(key, bestKey)) {
      best = cand;
      bestKey = key;
    }
  }
  return best.notes;
}

export interface ProgressionVoicingOpts {
  voiceLeading?: boolean;
  bass?: boolean;
}

/**
 * Build ChordStep objects for a progression in a key. Without opts the output
 * is identical to the legacy behavior (root position at `octave`) — lab-cadence
 * and lab-function depend on that. With `voiceLeading` each chord after the
 * first connects smoothly to the previous voicing; with `bass` every step
 * carries its root at octave 2.
 */
export function buildProgressionSteps(
  pattern: Array<[number, string]>,
  tonic: string,
  octave = 3,
  opts?: ProgressionVoicingOpts
): ChordStep[] {
  const steps: ChordStep[] = [];
  for (const [degree, quality] of pattern) {
    const rootNote = degreeToNote(degree, tonic, octave);
    const prev = steps[steps.length - 1];
    const notes = opts?.voiceLeading && prev
      ? pickNextVoicing(prev.notes, Note.pitchClass(rootNote), quality)
      : buildChord(rootNote, quality, 0);
    const step: ChordStep = { degree, quality: Q_MAP[quality] ?? 'M', notes };
    // Octave 2 proper (C2..B2, midi 36-47): degreeToNote returns the scale
    // octave starting at the tonic, which for e.g. degree 6 of G lands at E3 —
    // inside the upper-voicing window. Pinning the pitch class to octave 2
    // keeps the bass strictly below every upper voice in all keys.
    if (opts?.bass) step.bass = `${Note.pitchClass(degreeToNote(degree, tonic, 2))}2`;
    steps.push(step);
  }
  return steps;
}

/** Get random diatonic progression of given length */
export function randomDiatonicProgression(
  length: 2 | 3 | 4 | 5,
  tonic: string,
  octave = 3
): ChordStep[] {
  const COMMON: Array<Array<[number, string]>> = [
    [[1,'major'],[5,'dominant7']],
    [[1,'major'],[4,'major']],
    [[1,'major'],[6,'minor']],
    [[4,'major'],[5,'dominant7'],[1,'major']],
    [[1,'major'],[5,'dominant7'],[6,'minor']],
    [[2,'minor'],[5,'dominant7'],[1,'major']],
    [[1,'major'],[5,'dominant7'],[6,'minor'],[4,'major']],
    [[6,'minor'],[4,'major'],[1,'major'],[5,'dominant7']],
    [[1,'major'],[4,'major'],[5,'dominant7'],[1,'major']],
  ];

  const filtered = COMMON.filter((p) => p.length === length);
  const base = filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : COMMON[Math.floor(Math.random() * COMMON.length)].slice(0, length);

  return buildProgressionSteps(base, tonic, octave);
}

/**
 * Get a random praise pattern. When a level config is supplied, the selection
 * respects the level: only patterns whose degrees all fit the level's pool are
 * considered, and patterns longer than the level's length are trimmed. Without
 * a config, any pattern is returned at full length.
 */
export function randomPraiseProgression(
  tonic: string,
  octave = 3,
  cfg?: ProgressionLevelConfig
): ChordStep[] {
  let pool = PRAISE_PATTERNS;
  if (cfg) {
    const fits = pool.filter((p) => p.pattern.every(([d]) => cfg.degreePool.includes(d)));
    if (fits.length > 0) pool = fits;
  }
  const pat = choose(pool);
  const pattern = cfg && pat.pattern.length > cfg.length
    ? pat.pattern.slice(0, cfg.length)
    : pat.pattern;
  return buildProgressionSteps(
    pattern,
    tonic,
    octave,
    cfg ? { voiceLeading: cfg.voiceLeading, bass: cfg.bass } : undefined,
  );
}

/** Degree number to Roman numeral or arabic */
export function degreeLabel(degree: number, quality: string, notation: 'roman' | 'number'): string {
  const romanNums = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const isMinor = ['m', 'dim', 'm7', 'm7b5'].includes(quality);
  if (notation === 'number') {
    return `${degree}${isMinor ? 'm' : ''}`;
  }
  const roman = romanNums[degree] ?? degree.toString();
  return isMinor ? roman.toLowerCase() : roman;
}
