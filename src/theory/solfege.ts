import { Note, Scale, transpose } from 'tonal';

// Movable-do solfege syllables (major scale = 12 chromatic steps from tonic)
const MOVABLE_DO: Record<number, string> = {
  0:  '도',
  1:  '도#/레b',
  2:  '레',
  3:  '레#/미b',
  4:  '미',
  5:  '파',
  6:  '파#/솔b',
  7:  '솔',
  8:  '솔#/라b',
  9:  '라',
  10: '라#/시b',
  11: '시',
};

export const DIATONIC_SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'];
export const CHROMATIC_SOLFEGE = Object.values(MOVABLE_DO);

const TONIC_TRIAD = ['도', '미', '솔'];
const TONIC_TRIAD_PLUS_RE = ['도', '레', '미', '솔'];
const DIATONIC_7 = ['도', '레', '미', '파', '솔', '라', '시'];
const PLUS_DO_RE_SHARP = [...DIATONIC_7, '도#', '레#'];
const PLUS_FA_SOL_SHARP = [...PLUS_DO_RE_SHARP, '파#', '솔#'];
const CHROMATIC_12 = [...PLUS_FA_SOL_SHARP, '라#'];

const COMMON_KEYS_8 = ['C','G','D','A','E','F','Bb','Eb'];
const ALL_12_KEYS = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

export interface SolfegeLevelConfig {
  label: string;
  candidates: string[];          // syllables included (e.g. ['도','미','솔'])
  keyMode: 'fixed' | 'random';
  keyPool: string[];             // used when keyMode === 'random'
  octaveJitter: 0 | 1 | 2;       // ±octaves from the tonic octave
  suppressReferenceTone: boolean;
}

// The reference tone is always provided — solfège is relative-pitch training, so
// the upper levels raise difficulty with wide octave-spanning leaps (octaveJitter
// up to ±2) and key randomization, never by hiding the tonic.
export const SOLFEGE_LEVELS: Record<number, SolfegeLevelConfig> = {
  1:  { label: '3음 (도·미·솔)',     candidates: TONIC_TRIAD,         keyMode: 'fixed',  keyPool: [],            octaveJitter: 0, suppressReferenceTone: false },
  2:  { label: '+ 레',                candidates: TONIC_TRIAD_PLUS_RE, keyMode: 'fixed',  keyPool: [],            octaveJitter: 0, suppressReferenceTone: false },
  3:  { label: '다이아토닉 7음',      candidates: DIATONIC_7,          keyMode: 'fixed',  keyPool: [],            octaveJitter: 0, suppressReferenceTone: false },
  4:  { label: '+ 옥타브 변화',       candidates: DIATONIC_7,          keyMode: 'fixed',  keyPool: [],            octaveJitter: 1, suppressReferenceTone: false },
  5:  { label: '+ 도#/레#',           candidates: PLUS_DO_RE_SHARP,    keyMode: 'fixed',  keyPool: [],            octaveJitter: 1, suppressReferenceTone: false },
  6:  { label: '+ 파#/솔#',           candidates: PLUS_FA_SOL_SHARP,   keyMode: 'fixed',  keyPool: [],            octaveJitter: 1, suppressReferenceTone: false },
  7:  { label: '+ 라# (전 12음)',     candidates: CHROMATIC_12,        keyMode: 'fixed',  keyPool: [],            octaveJitter: 1, suppressReferenceTone: false },
  8:  { label: '+ 랜덤 키 (8개)',     candidates: CHROMATIC_12,        keyMode: 'random', keyPool: COMMON_KEYS_8, octaveJitter: 1, suppressReferenceTone: false },
  9:  { label: '+ 넓은 옥타브 도약',  candidates: CHROMATIC_12,        keyMode: 'random', keyPool: COMMON_KEYS_8, octaveJitter: 2, suppressReferenceTone: false },
  10: { label: '+ 12개 키 전체',      candidates: CHROMATIC_12,        keyMode: 'random', keyPool: ALL_12_KEYS,   octaveJitter: 2, suppressReferenceTone: false },
};

/** Map syllable → semitone offset from tonic (0..11). Returns -1 if unknown. */
export function solfegeToSemitone(syllable: string): number {
  const map: Record<string, number> = {
    '도': 0, '도#': 1, '레': 2, '레#': 3, '미': 4, '파': 5, '파#': 6,
    '솔': 7, '솔#': 8, '라': 9, '라#': 10, '시': 11,
  };
  return map[syllable] ?? -1;
}

/** All item keys (`solfege_${syllable}`) for a given solfege level. */
export function solfegeItemKeys(level: number): string[] {
  const cfg = SOLFEGE_LEVELS[level] ?? SOLFEGE_LEVELS[1];
  return cfg.candidates
    .filter((syl) => solfegeToSemitone(syl) >= 0)
    .map((syl) => `solfege_${syl}`);
}

/** Get solfege syllable for a note given a tonic (movable-do) */
export function noteToSolfege(note: string, tonic: string): string {
  const noteMidi = Note.midi(note);
  const tonicMidi = Note.midi(tonic + '0'); // use octave 0 for relative calc
  if (noteMidi == null) return '?';

  // Tonic MIDI without octave
  const tonicPc = Note.pitchClass(tonic);
  const tonicMidi0 = Note.midi(tonicPc + '4') ?? 60;
  const noteMidi4 = Note.midi(Note.pitchClass(note) + '4') ?? 60;

  const semitones = ((noteMidi4 - tonicMidi0) % 12 + 12) % 12;
  return MOVABLE_DO[semitones] ?? '?';
}

/** Simple single-syllable solfege (without sharps/flats) */
export const SIMPLE_SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'];

// Map semitone offset to simple solfege
const SEMITONE_TO_SIMPLE: Record<number, string> = {
  0: '도', 2: '레', 4: '미', 5: '파', 7: '솔', 9: '라', 11: '시',
  // chromatic
  1: '도#', 3: '레#', 6: '파#', 8: '솔#', 10: '라#',
};

export function semitoneToSolfege(semitones: number): string {
  return SEMITONE_TO_SIMPLE[((semitones % 12) + 12) % 12] ?? '?';
}

/** Get the major scale notes of a tonic in octave 4 */
export function getMajorScale(tonic: string, octave = 4): string[] {
  const scale = Scale.get(`${tonic}${octave} major`);
  return scale.notes;
}

/** Convert semitone offset from tonic to diatonic degree label (for display) */
export function semitoneToDegreeName(semitones: number, notation: 'roman' | 'number'): string {
  const diatonic: Record<number, [string, string]> = {
    0:  ['I',  '1'],
    2:  ['II', '2'],
    4:  ['III','3'],
    5:  ['IV', '4'],
    7:  ['V',  '5'],
    9:  ['VI', '6'],
    11: ['VII','7'],
  };
  const entry = diatonic[((semitones % 12) + 12) % 12];
  if (!entry) return '?';
  return notation === 'roman' ? entry[0] : entry[1];
}
