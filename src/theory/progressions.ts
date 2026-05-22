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
  length: 2 | 3 | 4 | 5;
  degreePool: number[];            // allowed degrees (1..7)
  playback: 'arpeggio' | 'block';
  keyMode: 'fixed' | 'random';
}

const CORE_TRIAD = [1, 4, 5];
const CORE_PLUS_VI = [1, 4, 5, 6];
const CORE_PLUS_II = [1, 2, 4, 5, 6];
const CORE_PLUS_III = [1, 2, 3, 4, 5, 6];
const ALL_7 = [1, 2, 3, 4, 5, 6, 7];

export const PROGRESSION_LEVELS: Record<number, ProgressionLevelConfig> = {
  1:  { label: '2화음 진행 (I·IV·V)',    length: 2, degreePool: CORE_TRIAD,    playback: 'arpeggio', keyMode: 'fixed'  },
  2:  { label: '+ vi 추가',              length: 2, degreePool: CORE_PLUS_VI,  playback: 'arpeggio', keyMode: 'fixed'  },
  3:  { label: '3화음 진행',             length: 3, degreePool: CORE_PLUS_VI,  playback: 'arpeggio', keyMode: 'fixed'  },
  4:  { label: '4화음 진행',             length: 4, degreePool: CORE_PLUS_VI,  playback: 'arpeggio', keyMode: 'fixed'  },
  5:  { label: '+ ii 추가',              length: 4, degreePool: CORE_PLUS_II,  playback: 'arpeggio', keyMode: 'fixed'  },
  6:  { label: '+ iii 추가',             length: 4, degreePool: CORE_PLUS_III, playback: 'arpeggio', keyMode: 'fixed'  },
  7:  { label: '블록 코드 재생',         length: 4, degreePool: CORE_PLUS_III, playback: 'block',    keyMode: 'fixed'  },
  8:  { label: '+ vii° 추가 (전 7도)',   length: 4, degreePool: ALL_7,         playback: 'block',    keyMode: 'fixed'  },
  9:  { label: '+ 랜덤 키',              length: 4, degreePool: ALL_7,         playback: 'block',    keyMode: 'random' },
  10: { label: '5화음 진행',             length: 5, degreePool: ALL_7,         playback: 'block',    keyMode: 'random' },
};

/** Build a progression respecting the level's degreePool and length. Starts on I. */
export function randomProgressionFromConfig(
  cfg: ProgressionLevelConfig,
  tonic: string,
  octave = 3
): ChordStep[] {
  const { length, degreePool } = cfg;
  const degrees: number[] = [1];
  for (let i = 1; i < length; i++) {
    const prev = degrees[degrees.length - 1];
    const avail = degreePool.filter((d) => d !== prev);
    const next = avail.length > 0
      ? avail[Math.floor(Math.random() * avail.length)]
      : degreePool[Math.floor(Math.random() * degreePool.length)];
    degrees.push(next);
  }
  const pattern: Array<[number, string]> = degrees.map((d) => {
    const info = MAJOR_DIATONIC[(d - 1) % 7];
    return [d, info?.quality ?? 'major'];
  });
  return buildProgressionSteps(pattern, tonic, octave);
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

/** Build ChordStep objects for a progression in a key */
export function buildProgressionSteps(
  pattern: Array<[number, string]>,
  tonic: string,
  octave = 3
): ChordStep[] {
  return pattern.map(([degree, quality]) => {
    const rootNote = degreeToNote(degree, tonic, octave);
    const notes = buildChord(rootNote, quality, 0);
    return {
      degree,
      quality: Q_MAP[quality] ?? 'M',
      notes,
    };
  });
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

/** Get a random praise pattern */
export function randomPraiseProgression(tonic: string, octave = 3): ChordStep[] {
  const pat = PRAISE_PATTERNS[Math.floor(Math.random() * PRAISE_PATTERNS.length)];
  return buildProgressionSteps(pat.pattern, tonic, octave);
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
