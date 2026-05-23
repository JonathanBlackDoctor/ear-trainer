import type { ChoiceOption } from '../components/ChoiceGrid';
import type { ModeKey } from '../types';
import { chordLabel } from '../theory/chords';

export const LAB_SCALE_MODE_INFO = {
  key: 'lab-scale' as ModeKey,
  name: '스케일 식별',
  emoji: '🪜',
  description: '스케일 종류를 맞혀보세요',
  howTo: '음계가 처음부터 끝까지 차례로 들립니다. 어떤 종류의 스케일(장조·단조·선법 등)인지 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const LAB_CADENCE_MODE_INFO = {
  key: 'lab-cadence' as ModeKey,
  name: '종지 식별',
  emoji: '🛑',
  description: '종지 형태를 맞혀보세요',
  howTo: '짧은 화음 진행이 들립니다. 진행이 끝나는 종지의 형태(정격·변격·반·위장)를 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const LAB_INVERSION_MODE_INFO = {
  key: 'lab-inversion' as ModeKey,
  name: '자리바꿈 식별',
  emoji: '🔄',
  description: '화음의 자리바꿈을 맞혀보세요',
  howTo: '한 화음이 들립니다. 화음이 기본 위치인지, 1·2·3전위인지 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

// ─── Scales ───────────────────────────────────────────────────────────────
// Scale-type pool grows one family at a time; descending playback unlocks at
// the top tiers (handled in the factory).
export const SCALE_LEVELS: Record<number, string[]> = {
  1:  ['major', 'natural minor'],
  2:  ['major', 'natural minor', 'harmonic minor'],
  3:  ['major', 'natural minor', 'harmonic minor', 'melodic minor'],
  4:  ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian'],
  5:  ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'mixolydian'],
  6:  ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'mixolydian', 'lydian'],
  7:  ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'mixolydian', 'lydian', 'phrygian'],
  8:  ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian'],
  9:  ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian'],
  10: ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'mixolydian', 'lydian', 'phrygian', 'locrian'],
};

const SCALE_LABEL: Record<string, string> = {
  'major': '장조 (Major)',
  'natural minor': '자연단조',
  'harmonic minor': '화성단조',
  'melodic minor': '가락단조',
  'dorian': '도리안',
  'phrygian': '프리지안',
  'lydian': '리디안',
  'mixolydian': '믹솔리디안',
  'locrian': '로크리안',
};

export function getScaleChoices(level: number): ChoiceOption[] {
  return (SCALE_LEVELS[level] ?? SCALE_LEVELS[1]).map((s) => ({
    value: s,
    label: SCALE_LABEL[s] ?? s,
  }));
}

// ─── Cadences ─────────────────────────────────────────────────────────────
// pattern as degree-quality pairs
export const CADENCE_PATTERNS: Record<string, Array<[number, string]>> = {
  authentic:  [[1,'major'],[4,'major'],[5,'dominant7'],[1,'major']],  // ends V→I
  plagal:     [[1,'major'],[5,'dominant7'],[4,'major'],[1,'major']],  // ends IV→I
  half:       [[1,'major'],[6,'minor'],[4,'major'],[5,'dominant7']],  // ends on V
  deceptive:  [[1,'major'],[4,'major'],[5,'dominant7'],[6,'minor']],  // V→vi
};

const CADENCE_ALL = ['authentic', 'plagal', 'half', 'deceptive'];

// Cadence type pool grows, then the key pool widens (more transposition).
export const CADENCE_LEVELS: Record<number, { types: string[]; keys: string[] }> = {
  1:  { types: ['authentic', 'plagal'], keys: ['C'] },
  2:  { types: ['authentic', 'plagal', 'half'], keys: ['C'] },
  3:  { types: CADENCE_ALL, keys: ['C'] },
  4:  { types: CADENCE_ALL, keys: ['C', 'G', 'F'] },
  5:  { types: CADENCE_ALL, keys: ['C', 'G', 'F', 'D', 'Bb'] },
  6:  { types: CADENCE_ALL, keys: ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'] },
  7:  { types: CADENCE_ALL, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'] },
  8:  { types: CADENCE_ALL, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'] },
  9:  { types: CADENCE_ALL, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'] },
  10: { types: CADENCE_ALL, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'] },
};

const CADENCE_LABEL: Record<string, string> = {
  authentic: '정격 종지 (V→I)',
  plagal:    '변격 종지 (IV→I)',
  half:      '반종지 (→V)',
  deceptive: '위장 종지 (V→vi)',
};

export function getCadenceChoices(level: number): ChoiceOption[] {
  const cfg = CADENCE_LEVELS[level] ?? CADENCE_LEVELS[1];
  return cfg.types.map((c) => ({
    value: c,
    label: CADENCE_LABEL[c] ?? c,
  }));
}

// ─── Inversions ───────────────────────────────────────────────────────────
// Chord-quality vocabulary grows; 3rd inversion (and 7th chords) unlock at L5.
export const INVERSION_LEVELS: Record<number, { inversions: number[]; qualities: string[] }> = {
  1:  { inversions: [0, 1, 2], qualities: ['major'] },
  2:  { inversions: [0, 1, 2], qualities: ['major', 'minor'] },
  3:  { inversions: [0, 1, 2], qualities: ['major', 'minor', 'dim'] },
  4:  { inversions: [0, 1, 2], qualities: ['major', 'minor', 'dim', 'aug'] },
  5:  { inversions: [0, 1, 2, 3], qualities: ['major', 'minor', 'dominant7'] },
  6:  { inversions: [0, 1, 2, 3], qualities: ['major', 'minor', 'dominant7', 'major7'] },
  7:  { inversions: [0, 1, 2, 3], qualities: ['major', 'minor', 'dominant7', 'major7', 'minor7'] },
  8:  { inversions: [0, 1, 2, 3], qualities: ['major', 'minor', 'dominant7', 'major7', 'minor7', 'm7b5'] },
  9:  { inversions: [0, 1, 2, 3], qualities: ['major', 'minor', 'dim', 'aug', 'dominant7', 'major7', 'minor7', 'm7b5'] },
  10: { inversions: [0, 1, 2, 3], qualities: ['major', 'minor', 'dim', 'aug', 'dominant7', 'major7', 'minor7', 'm7b5'] },
};

// 7th-chord qualities — the only ones that have a meaningful 3rd inversion.
export const INVERSION_SEVENTHS = ['dominant7', 'major7', 'minor7', 'm7b5'];

const INVERSION_LABEL: Record<number, string> = {
  0: '기본 위치',
  1: '1전위',
  2: '2전위',
  3: '3전위',
};

export function getInversionChoices(level: number): ChoiceOption[] {
  const cfg = INVERSION_LEVELS[level] ?? INVERSION_LEVELS[1];
  return cfg.inversions.map((n) => ({
    value: String(n),
    label: INVERSION_LABEL[n] ?? `${n}전위`,
  }));
}

// All eight new lab modes use the full 10-level ladder like the core trainings.
// Each *_LEVELS map ramps difficulty monotonically; content-limited modes
// (3 answers) lean on tighter tolerances / larger pools at higher tiers.

// ─── Interval Compare ───────────────────────────────────────────────────────
export const LAB_INTERVAL_COMPARE_MODE_INFO = {
  key: 'lab-interval-compare' as ModeKey,
  name: '음정 크기 비교',
  emoji: '🆚',
  description: '두 음정 중 더 넓은 쪽을 고르세요',
  howTo: '두 개의 음정이 차례로 들립니다. 첫 번째와 두 번째 중 어느 쪽이 더 넓은지(또는 두 음정이 같은지) 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

// Answer strings double as choice values so feedback reads naturally.
export const COMPARE_FIRST = '첫 번째';
export const COMPARE_SECOND = '두 번째';
export const COMPARE_SAME = '같음';

// minGap shrinks (harder to tell apart), range widens, "same" unlocks midway.
export const COMPARE_LEVELS: Record<number, { minGap: number; allowSame: boolean; low: string; high: string }> = {
  1:  { minGap: 6, allowSame: false, low: 'C4', high: 'C5' },
  2:  { minGap: 5, allowSame: false, low: 'C4', high: 'C5' },
  3:  { minGap: 4, allowSame: false, low: 'C4', high: 'C5' },
  4:  { minGap: 3, allowSame: false, low: 'C3', high: 'C5' },
  5:  { minGap: 3, allowSame: true,  low: 'C3', high: 'C5' },
  6:  { minGap: 2, allowSame: true,  low: 'C3', high: 'C5' },
  7:  { minGap: 2, allowSame: true,  low: 'A2', high: 'C6' },
  8:  { minGap: 1, allowSame: true,  low: 'A2', high: 'C6' },
  9:  { minGap: 1, allowSame: true,  low: 'A2', high: 'C6' },
  10: { minGap: 1, allowSame: true,  low: 'A2', high: 'C6' },
};

export function getIntervalCompareChoices(level: number): ChoiceOption[] {
  const cfg = COMPARE_LEVELS[level] ?? COMPARE_LEVELS[1];
  const base: ChoiceOption[] = [
    { value: COMPARE_FIRST, label: '첫 번째가 더 넓다' },
    { value: COMPARE_SECOND, label: '두 번째가 더 넓다' },
  ];
  if (cfg.allowSame) base.push({ value: COMPARE_SAME, label: '두 음정이 같다' });
  return base;
}

// ─── Odd Note (spot the altered note) ───────────────────────────────────────
export const LAB_ODD_NOTE_MODE_INFO = {
  key: 'lab-odd-note' as ModeKey,
  name: '틀린 음 찾기',
  emoji: '🔍',
  description: '음계 속 어긋난 음의 위치를 찾으세요',
  howTo: '음계가 차례로 들리는데 그중 한 음만 음정이 어긋나 있습니다. 몇 번째 음이 틀렸는지 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

// Scale pool widens, end notes become eligible, descending playback unlocks.
export const ODD_LEVELS: Record<number, { scales: string[]; allowEnds: boolean; descending: boolean }> = {
  1:  { scales: ['major'], allowEnds: false, descending: false },
  2:  { scales: ['major'], allowEnds: false, descending: false },
  3:  { scales: ['major'], allowEnds: true,  descending: false },
  4:  { scales: ['major', 'minor'], allowEnds: false, descending: false },
  5:  { scales: ['major', 'minor'], allowEnds: true,  descending: false },
  6:  { scales: ['major', 'minor'], allowEnds: true,  descending: true },
  7:  { scales: ['major', 'minor', 'dorian'], allowEnds: true, descending: true },
  8:  { scales: ['major', 'minor', 'dorian', 'mixolydian'], allowEnds: true, descending: true },
  9:  { scales: ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian'], allowEnds: true, descending: true },
  10: { scales: ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian'], allowEnds: true, descending: true },
};

// noteCount-aware: 8-note scale (octave inclusive) → positions 1..8.
export function getOddNoteChoices(noteCount = 8): ChoiceOption[] {
  return Array.from({ length: noteCount }, (_, i) => ({
    value: `${i + 1}번`,
    label: `${i + 1}번`,
  }));
}

// ─── Melodic Contour ────────────────────────────────────────────────────────
export const LAB_CONTOUR_MODE_INFO = {
  key: 'lab-contour' as ModeKey,
  name: '멜로디 윤곽',
  emoji: '〰️',
  description: '선율의 모양을 맞혀보세요',
  howTo: '짧은 선율이 들립니다. 음높이가 그리는 전체 모양(상행·하행·아치·역아치·물결)을 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

const ALL_CONTOURS = ['up', 'down', 'arch', 'inv-arch', 'wave'];

// Shapes unlock 1→4, then longer melodies and a non-tonic start (jitter) raise
// the challenge while the answer set stays at the five named shapes.
export const CONTOUR_LEVELS: Record<number, { shapes: string[]; length: 5 | 7; jitter: boolean }> = {
  1:  { shapes: ['up', 'down'], length: 5, jitter: false },
  2:  { shapes: ['up', 'down', 'arch'], length: 5, jitter: false },
  3:  { shapes: ['up', 'down', 'arch', 'inv-arch'], length: 5, jitter: false },
  4:  { shapes: ALL_CONTOURS, length: 5, jitter: false },
  5:  { shapes: ALL_CONTOURS, length: 5, jitter: true },
  6:  { shapes: ALL_CONTOURS, length: 7, jitter: false },
  7:  { shapes: ALL_CONTOURS, length: 7, jitter: true },
  8:  { shapes: ALL_CONTOURS, length: 7, jitter: true },
  9:  { shapes: ALL_CONTOURS, length: 7, jitter: true },
  10: { shapes: ALL_CONTOURS, length: 7, jitter: true },
};

export const CONTOUR_LABEL: Record<string, string> = {
  'up': '상행 ↗',
  'down': '하행 ↘',
  'arch': '아치 ↗↘',
  'inv-arch': '역아치 ↘↗',
  'wave': '물결 ↗↘↗',
};

export function getContourChoices(level: number): ChoiceOption[] {
  const cfg = CONTOUR_LEVELS[level] ?? CONTOUR_LEVELS[1];
  return cfg.shapes.map((c) => ({
    value: CONTOUR_LABEL[c],
    label: CONTOUR_LABEL[c],
  }));
}

// ─── Tuning (intonation) ────────────────────────────────────────────────────
export const LAB_TUNING_MODE_INFO = {
  key: 'lab-tuning' as ModeKey,
  name: '음정 정확도',
  emoji: '🎯',
  description: '기준음 대비 높낮이를 판별하세요',
  howTo: '기준음이 먼저 들리고, 이어서 같은 음이 다시 들립니다. 두 번째 음이 기준음보다 정확한지·높은지(♯)·낮은지(♭) 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const TUNING_IN_TUNE = '정확';
export const TUNING_SHARP = '높음 (♯)';
export const TUNING_FLAT = '낮음 (♭)';

export function getTuningChoices(): ChoiceOption[] {
  return [
    { value: TUNING_IN_TUNE, label: TUNING_IN_TUNE },
    { value: TUNING_SHARP, label: TUNING_SHARP },
    { value: TUNING_FLAT, label: TUNING_FLAT },
  ];
}

// Detune magnitude (cents) shrinks every level — subtler = harder.
export const TUNING_CENTS: Record<number, number[]> = {
  1:  [40, 45],
  2:  [33, 38],
  3:  [28, 32],
  4:  [23, 27],
  5:  [18, 22],
  6:  [15, 18],
  7:  [12, 15],
  8:  [9, 12],
  9:  [7, 9],
  10: [5, 7],
};

// ─── Harmonic Function (T/S/D) ──────────────────────────────────────────────
export const LAB_FUNCTION_MODE_INFO = {
  key: 'lab-function' as ModeKey,
  name: '화성 기능 식별',
  emoji: '⚙️',
  description: '화음의 기능(T/S/D)을 맞혀보세요',
  howTo: '으뜸화음으로 조성을 잡아준 뒤 한 화음이 들립니다. 그 화음의 기능이 으뜸(T)·버금딸림(S)·딸림(D) 중 무엇인지 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const FUNCTION_TONIC = '으뜸 (T)';
export const FUNCTION_SUBDOMINANT = '버금딸림 (S)';
export const FUNCTION_DOMINANT = '딸림 (D)';

// Scale degree → harmonic function.
export const DEGREE_FUNCTION: Record<number, string> = {
  1: FUNCTION_TONIC, 3: FUNCTION_TONIC, 6: FUNCTION_TONIC,
  2: FUNCTION_SUBDOMINANT, 4: FUNCTION_SUBDOMINANT,
  5: FUNCTION_DOMINANT, 7: FUNCTION_DOMINANT,
};

// Degree pool grows, then keys randomize.
export const FUNCTION_LEVELS: Record<number, { degrees: number[]; randomKey: boolean }> = {
  1:  { degrees: [1, 4, 5], randomKey: false },
  2:  { degrees: [1, 4, 5, 6], randomKey: false },
  3:  { degrees: [1, 2, 4, 5], randomKey: false },
  4:  { degrees: [1, 2, 4, 5, 6], randomKey: false },
  5:  { degrees: [1, 2, 3, 4, 5, 6, 7], randomKey: false },
  6:  { degrees: [1, 2, 3, 4, 5, 6, 7], randomKey: true },
  7:  { degrees: [1, 2, 3, 4, 5, 6, 7], randomKey: true },
  8:  { degrees: [1, 2, 3, 4, 5, 6, 7], randomKey: true },
  9:  { degrees: [1, 2, 3, 4, 5, 6, 7], randomKey: true },
  10: { degrees: [1, 2, 3, 4, 5, 6, 7], randomKey: true },
};

export function getFunctionChoices(): ChoiceOption[] {
  return [
    { value: FUNCTION_TONIC, label: FUNCTION_TONIC },
    { value: FUNCTION_SUBDOMINANT, label: FUNCTION_SUBDOMINANT },
    { value: FUNCTION_DOMINANT, label: FUNCTION_DOMINANT },
  ];
}

// ─── Extended / Color Chords ────────────────────────────────────────────────
export const LAB_EXTENDED_MODE_INFO = {
  key: 'lab-extended' as ModeKey,
  name: '확장 화음 식별',
  emoji: '🎨',
  description: '6·add9·9·sus 등 컬러 코드를 맞혀보세요',
  howTo: '한 화음이 들립니다. 6·m6·sus2·sus4·add9·maj9·9·m9 등 어떤 확장 화음인지 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

const ALL_EXTENDED = ['maj6', 'min6', 'sus2', 'sus4', 'add9', 'maj9', 'dom9', 'min9'];

// Quality pool grows, arpeggio→block, then inversions enter.
export const EXTENDED_LEVELS: Record<number, { qualities: string[]; inversions: number[]; arpeggio: boolean }> = {
  1:  { qualities: ['maj6', 'min6'], inversions: [0], arpeggio: true },
  2:  { qualities: ['maj6', 'min6', 'sus2', 'sus4'], inversions: [0], arpeggio: true },
  3:  { qualities: ['maj6', 'min6', 'sus2', 'sus4', 'add9'], inversions: [0], arpeggio: true },
  4:  { qualities: ['maj6', 'min6', 'sus2', 'sus4', 'add9'], inversions: [0], arpeggio: false },
  5:  { qualities: ['maj6', 'min6', 'sus2', 'sus4', 'add9', 'maj9'], inversions: [0], arpeggio: false },
  6:  { qualities: ['maj6', 'min6', 'sus2', 'sus4', 'add9', 'maj9', 'dom9'], inversions: [0], arpeggio: false },
  7:  { qualities: ALL_EXTENDED, inversions: [0], arpeggio: false },
  8:  { qualities: ALL_EXTENDED, inversions: [0, 1], arpeggio: false },
  9:  { qualities: ALL_EXTENDED, inversions: [0, 1, 2], arpeggio: false },
  10: { qualities: ALL_EXTENDED, inversions: [0, 1, 2], arpeggio: false },
};

export function getExtendedChoices(level: number): ChoiceOption[] {
  const cfg = EXTENDED_LEVELS[level] ?? EXTENDED_LEVELS[1];
  return cfg.qualities.map((q) => ({
    value: chordLabel(q),
    label: chordLabel(q),
  }));
}

// ─── Bass (lowest note) ─────────────────────────────────────────────────────
export const LAB_BASS_MODE_INFO = {
  key: 'lab-bass' as ModeKey,
  name: '베이스 식별',
  emoji: '🔊',
  description: '화음의 최저음을 찾으세요',
  howTo: '한 화음이 들립니다. 화음에서 가장 낮은 음(베이스)의 음이름을 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
// Flat spelling matches tonal's Note.fromMidi output (e.g. midi 70 → "Bb4").
const CHROMATIC_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Once inversions appear (L2+), the bass can be any chromatic pitch class.
export function getBassChoices(level: number): ChoiceOption[] {
  const names = level >= 2 ? CHROMATIC_NOTES : NATURAL_NOTES;
  return names.map((n) => ({ value: n, label: n }));
}

const BASS_7THS = ['major', 'minor', 'dominant7', 'major7', 'minor7'];
const BASS_ALL = [...BASS_7THS, 'dim', 'aug'];

export const BASS_LEVELS: Record<number, { roots: string[]; qualities: string[]; inversions: number[] }> = {
  1:  { roots: NATURAL_NOTES, qualities: ['major', 'minor'], inversions: [0] },
  2:  { roots: NATURAL_NOTES, qualities: ['major', 'minor'], inversions: [0, 1] },
  3:  { roots: NATURAL_NOTES, qualities: ['major', 'minor'], inversions: [0, 1, 2] },
  4:  { roots: NATURAL_NOTES, qualities: ['major', 'minor', 'dominant7'], inversions: [0, 1, 2] },
  5:  { roots: CHROMATIC_NOTES, qualities: ['major', 'minor', 'dominant7'], inversions: [0, 1, 2] },
  6:  { roots: CHROMATIC_NOTES, qualities: BASS_7THS, inversions: [0, 1, 2] },
  7:  { roots: CHROMATIC_NOTES, qualities: BASS_7THS, inversions: [0, 1, 2, 3] },
  8:  { roots: CHROMATIC_NOTES, qualities: BASS_ALL, inversions: [0, 1, 2, 3] },
  9:  { roots: CHROMATIC_NOTES, qualities: BASS_ALL, inversions: [0, 1, 2, 3] },
  10: { roots: CHROMATIC_NOTES, qualities: BASS_ALL, inversions: [0, 1, 2, 3] },
};

// ─── Tension Notes ──────────────────────────────────────────────────────────
export const LAB_TENSION_MODE_INFO = {
  key: 'lab-tension' as ModeKey,
  name: '텐션음 식별',
  emoji: '🌶️',
  description: '화음 위에 더해진 텐션을 맞혀보세요',
  howTo: '기본 화음이 들린 뒤, 텐션이 더해진 화음이 이어서 들립니다. 더해진 텐션(9·♭9·♯9·11·♯11·13·♭13)이 무엇인지 아래 보기에서 고르세요.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const TENSION_SEMITONES: Record<string, number> = {
  '9': 14, 'b9': 13, '#9': 15, '11': 17, '#11': 18, '13': 21, 'b13': 20,
};

export const TENSION_LABEL: Record<string, string> = {
  '9': '9도', 'b9': '♭9', '#9': '♯9', '11': '11도', '#11': '♯11', '13': '13도', 'b13': '♭13',
};

const ALL_TENSIONS = ['9', 'b9', '#9', '11', '#11', '13', 'b13'];

// Tension pool grows, then the underlying chord quality varies.
export const TENSION_LEVELS: Record<number, { tensions: string[]; bases: string[] }> = {
  1:  { tensions: ['9', '11', '13'], bases: ['dominant7'] },
  2:  { tensions: ['9', 'b9', '11', '13'], bases: ['dominant7'] },
  3:  { tensions: ['9', 'b9', '#9', '11', '13'], bases: ['dominant7'] },
  4:  { tensions: ['9', 'b9', '#9', '11', '#11', '13'], bases: ['dominant7'] },
  5:  { tensions: ALL_TENSIONS, bases: ['dominant7'] },
  6:  { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7'] },
  7:  { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7', 'minor7'] },
  8:  { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7', 'minor7'] },
  9:  { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7', 'minor7'] },
  10: { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7', 'minor7'] },
};

export function getTensionChoices(level: number): ChoiceOption[] {
  const cfg = TENSION_LEVELS[level] ?? TENSION_LEVELS[1];
  return cfg.tensions.map((t) => ({
    value: TENSION_LABEL[t],
    label: TENSION_LABEL[t],
  }));
}
