import type { ChoiceOption } from '../components/ChoiceGrid';
import type { ModeKey } from '../types';

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
