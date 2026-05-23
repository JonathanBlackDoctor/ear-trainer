import type { ChoiceOption } from '../components/ChoiceGrid';
import type { ModeKey } from '../types';
import { chordLabel } from '../theory/chords';

export const LAB_MODE_INFO = {
  key: 'lab' as ModeKey,
  name: '실험실',
  emoji: '🧪',
  description: '다양한 음악 식별 훈련 모음',
  maxLevel: 3,
  defaultLevel: 1,
};

export const LAB_SCALE_MODE_INFO = {
  key: 'lab-scale' as ModeKey,
  name: '스케일 식별',
  emoji: '🪜',
  description: '스케일 종류를 맞혀보세요',
  maxLevel: 3,
  defaultLevel: 1,
};

export const LAB_CADENCE_MODE_INFO = {
  key: 'lab-cadence' as ModeKey,
  name: '종지 식별',
  emoji: '🛑',
  description: '종지 형태를 맞혀보세요',
  maxLevel: 2,
  defaultLevel: 1,
};

export const LAB_KEY_MODE_INFO = {
  key: 'lab-key' as ModeKey,
  name: '조성 식별',
  emoji: '🗝️',
  description: '진행을 듣고 조성을 맞혀보세요',
  maxLevel: 3,
  defaultLevel: 1,
};

export const LAB_INVERSION_MODE_INFO = {
  key: 'lab-inversion' as ModeKey,
  name: '자리바꿈 식별',
  emoji: '🔄',
  description: '화음의 자리바꿈을 맞혀보세요',
  maxLevel: 2,
  defaultLevel: 1,
};

// ─── Scales ───────────────────────────────────────────────────────────────
export const SCALE_LEVELS: Record<number, string[]> = {
  1: ['major', 'natural minor'],
  2: ['major', 'natural minor', 'harmonic minor', 'melodic minor'],
  3: ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'phrygian', 'lydian', 'mixolydian'],
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

export const CADENCE_LEVELS: Record<number, string[]> = {
  1: ['authentic', 'plagal'],
  2: ['authentic', 'plagal', 'half', 'deceptive'],
};

const CADENCE_LABEL: Record<string, string> = {
  authentic: '정격 종지 (V→I)',
  plagal:    '변격 종지 (IV→I)',
  half:      '반종지 (→V)',
  deceptive: '위장 종지 (V→vi)',
};

export function getCadenceChoices(level: number): ChoiceOption[] {
  return (CADENCE_LEVELS[level] ?? CADENCE_LEVELS[1]).map((c) => ({
    value: c,
    label: CADENCE_LABEL[c] ?? c,
  }));
}

// ─── Keys ─────────────────────────────────────────────────────────────────
export const KEY_LEVELS: Record<number, string[]> = {
  1: ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb'],
  2: ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  3: ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
};

export function getKeyChoices(level: number): ChoiceOption[] {
  return (KEY_LEVELS[level] ?? KEY_LEVELS[1]).map((k) => ({
    value: k,
    label: k,
  }));
}

// ─── Inversions ───────────────────────────────────────────────────────────
export const INVERSION_LEVELS: Record<number, number[]> = {
  1: [0, 1, 2],     // triads: root / 1st / 2nd
  2: [0, 1, 2, 3],  // 7th chords add 3rd inversion
};

const INVERSION_LABEL: Record<number, string> = {
  0: '기본 위치',
  1: '1전위',
  2: '2전위',
  3: '3전위',
};

export function getInversionChoices(level: number): ChoiceOption[] {
  return (INVERSION_LEVELS[level] ?? INVERSION_LEVELS[1]).map((n) => ({
    value: String(n),
    label: INVERSION_LABEL[n] ?? `${n}전위`,
  }));
}

// ─── Interval Compare ───────────────────────────────────────────────────────
export const LAB_INTERVAL_COMPARE_MODE_INFO = {
  key: 'lab-interval-compare' as ModeKey,
  name: '음정 크기 비교',
  emoji: '🆚',
  description: '두 음정 중 더 넓은 쪽을 고르세요',
  maxLevel: 2,
  defaultLevel: 1,
};

// Answer strings double as choice values so feedback reads naturally.
export const COMPARE_FIRST = '첫 번째';
export const COMPARE_SECOND = '두 번째';
export const COMPARE_SAME = '같음';

export function getIntervalCompareChoices(level: number): ChoiceOption[] {
  const base: ChoiceOption[] = [
    { value: COMPARE_FIRST, label: '첫 번째가 더 넓다' },
    { value: COMPARE_SECOND, label: '두 번째가 더 넓다' },
  ];
  if (level >= 2) base.push({ value: COMPARE_SAME, label: '두 음정이 같다' });
  return base;
}

// ─── Odd Note (spot the altered note) ───────────────────────────────────────
export const LAB_ODD_NOTE_MODE_INFO = {
  key: 'lab-odd-note' as ModeKey,
  name: '틀린 음 찾기',
  emoji: '🔍',
  description: '음계 속 어긋난 음의 위치를 찾으세요',
  maxLevel: 2,
  defaultLevel: 1,
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
  maxLevel: 2,
  defaultLevel: 1,
};

export const CONTOUR_LEVELS: Record<number, string[]> = {
  1: ['up', 'down', 'arch', 'inv-arch'],
  2: ['up', 'down', 'arch', 'inv-arch', 'wave'],
};

export const CONTOUR_LABEL: Record<string, string> = {
  'up': '상행 ↗',
  'down': '하행 ↘',
  'arch': '아치 ↗↘',
  'inv-arch': '역아치 ↘↗',
  'wave': '물결 ↗↘↗',
};

export function getContourChoices(level: number): ChoiceOption[] {
  return (CONTOUR_LEVELS[level] ?? CONTOUR_LEVELS[1]).map((c) => ({
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
  maxLevel: 2,
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

// Detune magnitude (cents) by level. Larger = easier.
export const TUNING_CENTS: Record<number, number[]> = {
  1: [28, 33, 38, 42],
  2: [12, 15, 18, 22],
};

// ─── Harmonic Function (T/S/D) ──────────────────────────────────────────────
export const LAB_FUNCTION_MODE_INFO = {
  key: 'lab-function' as ModeKey,
  name: '화성 기능 식별',
  emoji: '⚙️',
  description: '화음의 기능(T/S/D)을 맞혀보세요',
  maxLevel: 2,
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

export const FUNCTION_LEVELS: Record<number, number[]> = {
  1: [1, 4, 5],
  2: [1, 2, 3, 4, 5, 6, 7],
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
  maxLevel: 2,
  defaultLevel: 1,
};

export const EXTENDED_LEVELS: Record<number, string[]> = {
  1: ['maj6', 'min6', 'sus2', 'sus4'],
  2: ['maj6', 'min6', 'sus2', 'sus4', 'add9', 'maj9', 'dom9', 'min9'],
};

export function getExtendedChoices(level: number): ChoiceOption[] {
  return (EXTENDED_LEVELS[level] ?? EXTENDED_LEVELS[1]).map((q) => ({
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
  maxLevel: 2,
  defaultLevel: 1,
};

const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
// Flat spelling matches tonal's Note.fromMidi output (e.g. midi 70 → "Bb4").
const CHROMATIC_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function getBassChoices(level: number): ChoiceOption[] {
  const names = level >= 2 ? CHROMATIC_NOTES : NATURAL_NOTES;
  return names.map((n) => ({ value: n, label: n }));
}

export const BASS_LEVELS: Record<number, { roots: string[]; qualities: string[]; inversions: number[] }> = {
  1: { roots: NATURAL_NOTES, qualities: ['major', 'minor'], inversions: [0] },
  2: { roots: CHROMATIC_NOTES, qualities: ['major', 'minor', 'dominant7'], inversions: [0, 1, 2] },
};

// ─── Tension Notes ──────────────────────────────────────────────────────────
export const LAB_TENSION_MODE_INFO = {
  key: 'lab-tension' as ModeKey,
  name: '텐션음 식별',
  emoji: '🌶️',
  description: '화음 위에 더해진 텐션을 맞혀보세요',
  maxLevel: 2,
  defaultLevel: 1,
};

export const TENSION_SEMITONES: Record<string, number> = {
  '9': 14, 'b9': 13, '#9': 15, '11': 17, '#11': 18, '13': 21, 'b13': 20,
};

export const TENSION_LABEL: Record<string, string> = {
  '9': '9도', 'b9': '♭9', '#9': '♯9', '11': '11도', '#11': '♯11', '13': '13도', 'b13': '♭13',
};

export const TENSION_LEVELS: Record<number, string[]> = {
  1: ['9', '11', '13'],
  2: ['9', 'b9', '#9', '11', '#11', '13', 'b13'],
};

export function getTensionChoices(level: number): ChoiceOption[] {
  return (TENSION_LEVELS[level] ?? TENSION_LEVELS[1]).map((t) => ({
    value: TENSION_LABEL[t],
    label: TENSION_LABEL[t],
  }));
}
