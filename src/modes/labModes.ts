import type { ChoiceOption } from '../components/ChoiceGrid';
import type { ModeKey } from '../types';
import { chordLabel } from '../theory/chords';
import type { IntervalDirection } from '../theory/intervals';

export const LAB_SCALE_MODE_INFO = {
  key: 'lab-scale' as ModeKey,
  name: '스케일 식별',
  emoji: '🪜',
  description: '스케일 종류를 맞혀보세요',
  howTo: '음계가 처음부터 끝까지 차례로 들립니다. 어떤 종류의 스케일(장조·단조·선법 등)인지 아래 보기에서 고르세요.',
  theory: '스케일(음계)은 한 옥타브 안의 음을 일정한 순서로 배열한 것으로, 온음과 반음이 어디에 놓이느냐가 그 색채를 결정합니다. 장조는 밝고, 단조는 어두우며(자연·화성·가락의 세 형태), 도리안·믹솔리디안 같은 선법(모드)은 그 중간의 독특한 분위기를 냅니다. 음계는 멜로디와 화음이 만들어지는 음의 재료 창고입니다.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const LAB_CADENCE_MODE_INFO = {
  key: 'lab-cadence' as ModeKey,
  name: '종지 식별',
  emoji: '🛑',
  description: '종지 형태를 맞혀보세요',
  howTo: '짧은 화음 진행이 들립니다. 진행이 끝나는 종지의 형태(정격·변격·반·위장)를 아래 보기에서 고르세요.',
  theory: '종지(케이던스)는 악구를 마무리 짓는 화음 진행으로, 문장의 마침표·쉼표와 같은 역할을 합니다. 정격 종지(V→I)는 가장 확실한 끝맺음, 변격 종지(IV→I)는 "아멘" 같은 부드러운 마침, 반종지(→V)는 말이 이어질 듯 멈추는 느낌, 위장 종지(V→vi)는 끝날 듯 빗나가는 반전을 줍니다. 종지를 들을 줄 알면 곡의 구조가 보입니다.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const LAB_INVERSION_MODE_INFO = {
  key: 'lab-inversion' as ModeKey,
  name: '자리바꿈 식별',
  emoji: '🔄',
  description: '화음의 자리바꿈을 맞혀보세요',
  howTo: '한 화음이 들립니다. 화음이 기본 위치인지, 1·2·3전위인지 아래 보기에서 고르세요.',
  theory: '자리바꿈(전위)은 화음의 구성음은 그대로 둔 채 어떤 음을 가장 낮은 음(베이스)에 두느냐를 바꾸는 것입니다. 근음이 맨 아래면 기본 위치, 3음이 아래면 1전위, 5음이면 2전위(7화음은 7음이 아래면 3전위)입니다. 같은 화음이라도 베이스가 달라지면 무게중심과 베이스 라인의 흐름이 달라집니다.',
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

// Once the scale pool is maxed (8 modes), the top tiers add descending playback
// — increasingly often — so the same answer set keeps getting harder to hear.
export const SCALE_DESCENDING_PROB: Record<number, number> = {
  8: 0.4, 9: 0.7, 10: 1,
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
  8:  { types: CADENCE_ALL, keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'B'] },
  9:  { types: CADENCE_ALL, keys: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] },
  10: { types: CADENCE_ALL, keys: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] },
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
  theory: '음정의 크기는 두 음이 벌어진 폭으로, 반음 수가 많을수록 더 "넓게" 들립니다. 음정의 이름을 정확히 몰라도 두 음정의 상대적 넓이를 비교하는 감각은 음높이 변화를 가늠하는 가장 기초적인 청각 능력입니다. 폭 차이가 작을수록 구분이 어려워집니다.',
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
  9:  { minGap: 1, allowSame: true,  low: 'A1', high: 'C7' },
  10: { minGap: 1, allowSame: true,  low: 'A1', high: 'C7' },
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
  theory: '음계는 온음·반음의 규칙적인 패턴을 따르므로, 그 패턴에서 벗어난 음은 "어울리지 않게" 튀어 들립니다. 이 훈련은 익숙한 음계의 흐름을 머릿속에 그려 두고 실제로 들리는 음과 어긋나는 지점을 짚어 내는 능력을 기릅니다. 연주의 음 이탈이나 조옮김 오류를 잡아내는 데 직결됩니다.',
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
  9:  { scales: ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'harmonic minor', 'melodic minor'], allowEnds: true, descending: true },
  10: { scales: ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'harmonic minor', 'melodic minor', 'locrian'], allowEnds: true, descending: true },
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
  theory: '멜로디 윤곽(컨투어)은 정확한 음정과 무관하게 선율이 그리는 전체적인 오르내림의 모양입니다. 상행·하행·아치(올랐다 내림)·역아치·물결처럼 큰 그림을 먼저 파악하면, 세부 음을 받아적기 전에 선율의 인상을 빠르게 잡을 수 있습니다. 작곡에서 프레이즈의 방향감을 설계하는 기본 개념이기도 합니다.',
  maxLevel: 10,
  defaultLevel: 1,
};

const ALL_CONTOURS = ['up', 'down', 'arch', 'inv-arch', 'wave'];

// Shapes unlock 1→4, then longer melodies and a non-tonic start (jitter) raise
// the challenge while the answer set stays at the five named shapes.
export const CONTOUR_LEVELS: Record<number, { shapes: string[]; length: 5 | 7 | 9; jitter: boolean }> = {
  1:  { shapes: ['up', 'down'], length: 5, jitter: false },
  2:  { shapes: ['up', 'down', 'arch'], length: 5, jitter: false },
  3:  { shapes: ['up', 'down', 'arch', 'inv-arch'], length: 5, jitter: false },
  4:  { shapes: ALL_CONTOURS, length: 5, jitter: false },
  5:  { shapes: ALL_CONTOURS, length: 5, jitter: true },
  6:  { shapes: ALL_CONTOURS, length: 7, jitter: false },
  7:  { shapes: ALL_CONTOURS, length: 7, jitter: true },
  8:  { shapes: ALL_CONTOURS, length: 9, jitter: false },
  9:  { shapes: ALL_CONTOURS, length: 9, jitter: true },
  10: { shapes: ALL_CONTOURS, length: 9, jitter: true },
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
  theory: '같은 이름의 음이라도 실제 높이는 미세하게 어긋날 수 있는데, 이 미세한 차이를 인토네이션(음정 정확도)이라 하고 한 반음의 1/100인 "센트(cent)" 단위로 잽니다. 기준보다 조금 높으면 샵(♯) 쪽, 낮으면 플랫(♭) 쪽으로 들립니다. 합주나 노래에서 음을 깨끗하게 맞추는 데 꼭 필요한 감각이며, 차이가 작을수록 알아채기 어렵습니다.',
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
  6:  [14, 17],
  7:  [11, 14],
  8:  [7, 9],
  9:  [5, 6],
  10: [3, 4],
};

// ─── Harmonic Function (T/S/D) ──────────────────────────────────────────────
export const LAB_FUNCTION_MODE_INFO = {
  key: 'lab-function' as ModeKey,
  name: '화성 기능 식별',
  emoji: '⚙️',
  description: '화음의 기능(T/S/D)을 맞혀보세요',
  howTo: '으뜸화음으로 조성을 잡아준 뒤 한 화음이 들립니다. 그 화음의 기능이 으뜸(T)·버금딸림(S)·딸림(D) 중 무엇인지 아래 보기에서 고르세요.',
  theory: '화성 기능은 조성 안에서 각 화음이 맡는 역할을 으뜸(T)·버금딸림(S)·딸림(D) 세 부류로 묶어 보는 관점입니다. 으뜸(T, I·iii·vi)은 안정과 귀착, 버금딸림(S, ii·IV)은 으뜸에서 벗어나는 이동, 딸림(D, V·vii°)은 으뜸으로 강하게 돌아가려는 긴장을 만듭니다. T→S→D→T의 순환이 조성 음악의 가장 기본적인 추진력입니다.',
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
  theory: '확장·컬러 화음은 기본 3화음에 음을 더하거나 바꿔 색채를 입힌 화음입니다. 6도를 더한 6화음, 9도를 더한 add9, 7음 위에 9도까지 쌓은 9화음, 3음을 2도나 4도로 대신해 모호한 여운을 주는 sus 화음 등이 있습니다. 재즈·팝·영화음악에서 단순한 장·단화음을 넘어 풍부한 분위기를 만들 때 즐겨 쓰입니다.',
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
  10: { qualities: ALL_EXTENDED, inversions: [0, 1, 2, 3], arpeggio: false },
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
  theory: '베이스는 화음에서 가장 낮은 음으로, 화음의 토대이자 무게중심을 잡아 줍니다. 같은 화음이라도 베이스가 근음이 아닌 다른 음이면 자리바꿈(전위)이나 슬래시 코드(예: C/E)가 되어 흐름의 느낌이 달라집니다. 베이스 라인을 따로 들어 내는 능력은 화음의 자리바꿈을 파악하고 곡을 채보하는 데 핵심입니다.',
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
  theory: '텐션은 7화음 위에 한 옥타브를 넘겨 더 쌓은 음(9·11·13도)으로, 화음에 긴장감과 색채를 더합니다. ♭9·♯9·♯11·♭13처럼 반음 변형을 주면 더 날카롭거나 이국적인 울림이 되며, 재즈 화성의 핵심 표현 수단입니다. 기본 화음과 비교해 "어떤 색이 덧칠됐는지"를 듣는 훈련으로, 가장 섬세한 화성 청음에 해당합니다.',
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
  8:  { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7', 'minor7', 'm7b5'] },
  9:  { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7', 'minor7', 'm7b5'] },
  10: { tensions: ALL_TENSIONS, bases: ['dominant7', 'major7', 'minor7', 'm7b5'] },
};

export function getTensionChoices(level: number): ChoiceOption[] {
  const cfg = TENSION_LEVELS[level] ?? TENSION_LEVELS[1];
  return cfg.tensions.map((t) => ({
    value: TENSION_LABEL[t],
    label: TENSION_LABEL[t],
  }));
}

// ─── Wide / Compound Intervals (octave → 3 octaves) ─────────────────────────
export const LAB_WIDE_INTERVAL_MODE_INFO = {
  key: 'lab-wide-interval' as ModeKey,
  name: '광역 음정',
  emoji: '📏',
  description: '옥타브를 넘는 넓은 음정을 맞혀보세요',
  howTo: '두 음이 차례로(또는 동시에) 들립니다. 두 음 사이의 음정이 옥타브를 넘어 몇 도인지(완전8도·장10도·완전12도·2옥타브 등) 아래 보기에서 고르세요.',
  theory: '한 옥타브를 넘는 음정을 컴파운드(복합) 음정이라 부르며, 옥타브에 단순 음정을 더한 것과 같습니다. 예를 들어 10도는 옥타브+3도, 12도는 옥타브+5도입니다. 음이 멀리 떨어질수록 두 음을 하나의 "간격"으로 묶어 듣기가 어려워지므로, 넓은 도약을 정확히 가늠하는 감각은 큰 폭의 멜로디나 넓게 벌린 화음을 채보할 때 핵심이 됩니다.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const WIDE_INTERVAL_NAMES = [
  { name: 'P8',  label: '완전8도 (옥타브)',        semitones: 12 },
  { name: 'm9',  label: '단9도',                   semitones: 13 },
  { name: 'M9',  label: '장9도',                   semitones: 14 },
  { name: 'm10', label: '단10도',                  semitones: 15 },
  { name: 'M10', label: '장10도',                  semitones: 16 },
  { name: 'P11', label: '완전11도',                semitones: 17 },
  { name: 'A11', label: '증11도',                  semitones: 18 },
  { name: 'P12', label: '완전12도',                semitones: 19 },
  { name: 'm13', label: '단13도',                  semitones: 20 },
  { name: 'M13', label: '장13도',                  semitones: 21 },
  { name: 'm14', label: '단14도',                  semitones: 22 },
  { name: 'M14', label: '장14도',                  semitones: 23 },
  { name: 'P15', label: '완전15도 (2옥타브)',      semitones: 24 },
  { name: 'M17', label: '장17도 (2옥타브+장3도)',  semitones: 28 },
  { name: 'P19', label: '완전19도 (2옥타브+5도)',  semitones: 31 },
  { name: 'P22', label: '완전22도 (3옥타브)',      semitones: 36 },
];

export const WIDE_SEMITONES: Record<string, number> = Object.fromEntries(
  WIDE_INTERVAL_NAMES.map((i) => [i.name, i.semitones]),
);
const WIDE_LABEL: Record<string, string> = Object.fromEntries(
  WIDE_INTERVAL_NAMES.map((i) => [i.name, i.label]),
);

const WIDE_SPREAD = ['P8', 'M10', 'P12', 'P15'];
const WIDE_TENTHS = ['P8', 'm9', 'M9', 'm10', 'M10', 'P11', 'P12', 'P15'];
const WIDE_TO_15 = ['P8', 'm9', 'M9', 'm10', 'M10', 'P11', 'A11', 'P12', 'm13', 'M13', 'm14', 'M14', 'P15'];
const WIDE_ULTRA = [...WIDE_TO_15, 'M17', 'P19', 'P22'];

export const WIDE_LEVELS: Record<number, { names: string[]; directions: IntervalDirection[]; low: string; high: string }> = {
  1:  { names: WIDE_SPREAD, directions: ['up'],                       low: 'C3', high: 'C4' },
  2:  { names: WIDE_TENTHS, directions: ['up'],                       low: 'C3', high: 'C4' },
  3:  { names: WIDE_TENTHS, directions: ['up', 'down'],               low: 'C2', high: 'C4' },
  4:  { names: WIDE_TO_15,  directions: ['up', 'down'],               low: 'C2', high: 'C4' },
  5:  { names: WIDE_TO_15,  directions: ['up', 'down', 'harmonic'],   low: 'C2', high: 'C4' },
  6:  { names: WIDE_TO_15,  directions: ['up', 'down', 'harmonic'],   low: 'A1', high: 'C4' },
  7:  { names: WIDE_ULTRA,  directions: ['up', 'down'],               low: 'A1', high: 'G3' },
  8:  { names: WIDE_ULTRA,  directions: ['up', 'down', 'harmonic'],   low: 'A1', high: 'G3' },
  9:  { names: WIDE_ULTRA,  directions: ['up', 'down', 'harmonic'],   low: 'A1', high: 'F3' },
  10: { names: WIDE_ULTRA,  directions: ['up', 'down', 'harmonic'],   low: 'A1', high: 'F3' },
};

export function getWideIntervalChoices(level: number): ChoiceOption[] {
  const cfg = WIDE_LEVELS[level] ?? WIDE_LEVELS[1];
  return cfg.names.map((n) => ({ value: n, label: n, sublabel: WIDE_LABEL[n] ?? n }));
}

// ─── Note Stack (identify simultaneous notes / interval stack) ──────────────
export const LAB_NOTE_STACK_MODE_INFO = {
  key: 'lab-note-stack' as ModeKey,
  name: '다성 음 쌓기',
  emoji: '🗼',
  description: '동시에 울린 2~4개 음을 찾으세요',
  howTo: '여러 음이 동시에 울립니다. "건반" 입력에서는 들은 음을 모두 눌러 재구성하고, "보기" 입력에서는 베이스부터 쌓인 음정 구성을 고르세요.',
  theory: '두 개 이상의 음이 동시에 울리면 각 음을 따로 가려내기가 어려운데, 이를 베이스(맨 아래 음)부터 위로 쌓인 음정의 연속으로 분석하면 구조가 보입니다. 예컨대 "장3도 위에 단3도"는 장3화음, "단3도 위에 장3도"는 단3화음입니다. 동시에 울리는 음을 분해해 듣는 능력은 화음 채보와 편곡의 토대입니다.',
  maxLevel: 10,
  defaultLevel: 1,
};

export interface StackPattern { code: string; label: string; steps: number[] }

const STACK_DYADS: StackPattern[] = [
  { code: 'M3', label: '장3도', steps: [4] },
  { code: 'm3', label: '단3도', steps: [3] },
  { code: 'P5', label: '완전5도', steps: [7] },
  { code: 'P4', label: '완전4도', steps: [5] },
];
const STACK_DYADS_PLUS: StackPattern[] = [
  ...STACK_DYADS,
  { code: 'A4', label: '증4도 (트라이톤)', steps: [6] },
  { code: 'M6', label: '장6도', steps: [9] },
  { code: 'm7', label: '단7도', steps: [10] },
];
const STACK_TRIADS: StackPattern[] = [
  { code: 'M3+m3', label: '장3+단3 (장3화음형)', steps: [4, 3] },
  { code: 'm3+M3', label: '단3+장3 (단3화음형)', steps: [3, 4] },
  { code: 'm3+m3', label: '단3+단3 (감3화음형)', steps: [3, 3] },
  { code: 'M3+M3', label: '장3+장3 (증3화음형)', steps: [4, 4] },
  { code: 'P4+P4', label: '완4+완4 (4도 쌓기)', steps: [5, 5] },
  { code: 'M2+M2', label: '장2+장2 (온음 클러스터)', steps: [2, 2] },
];
const STACK_SEVENTHS: StackPattern[] = [
  { code: 'M3+m3+M3', label: '장3+단3+장3 (장7화음형)', steps: [4, 3, 4] },
  { code: 'M3+m3+m3', label: '장3+단3+단3 (속7화음형)', steps: [4, 3, 3] },
  { code: 'm3+M3+m3', label: '단3+장3+단3 (단7화음형)', steps: [3, 4, 3] },
  { code: 'm3+m3+M3', label: '단3+단3+장3 (반감7형)', steps: [3, 3, 4] },
  { code: 'm3+m3+m3', label: '단3+단3+단3 (감7화음형)', steps: [3, 3, 3] },
];
const STACK_WIDE: StackPattern[] = [
  { code: 'P8+M3', label: '옥타브+장3도 (넓은 보이싱)', steps: [12, 4] },
  { code: 'P5+P8', label: '완전5도+옥타브 (넓은 보이싱)', steps: [7, 12] },
  { code: 'P4+P8', label: '완전4도+옥타브 (넓은 보이싱)', steps: [5, 12] },
];

export const NOTE_STACK_LEVELS: Record<number, StackPattern[]> = {
  1:  STACK_DYADS,
  2:  STACK_DYADS_PLUS,
  3:  STACK_TRIADS,
  4:  [...STACK_TRIADS],
  5:  [...STACK_DYADS_PLUS, ...STACK_TRIADS],
  6:  STACK_SEVENTHS,
  7:  [...STACK_TRIADS, ...STACK_SEVENTHS],
  8:  [...STACK_TRIADS, ...STACK_SEVENTHS, ...STACK_WIDE],
  9:  [...STACK_DYADS_PLUS, ...STACK_TRIADS, ...STACK_SEVENTHS, ...STACK_WIDE],
  10: [...STACK_DYADS_PLUS, ...STACK_TRIADS, ...STACK_SEVENTHS, ...STACK_WIDE],
};

// Levels at or above this randomize the register (essence-independent listening).
export const NOTE_STACK_RANDOM_REGISTER_LEVEL = 5;

export function getNoteStackChoices(level: number): ChoiceOption[] {
  return (NOTE_STACK_LEVELS[level] ?? NOTE_STACK_LEVELS[1]).map((p) => ({
    value: p.code,
    label: p.label,
  }));
}

export function noteStackLabel(code: string): string {
  for (const lvl of Object.values(NOTE_STACK_LEVELS)) {
    const found = lvl.find((p) => p.code === code);
    if (found) return found.label;
  }
  return code;
}

// ─── Microtuning (cents-level intonation on a sustained dyad) ────────────────
export const LAB_MICROTUNING_MODE_INFO = {
  key: 'lab-microtuning' as ModeKey,
  name: '정밀 조율',
  emoji: '🔬',
  description: '센트 단위 음정 어긋남을 판별하세요',
  howTo: '정확히 맞는 두 음(기준)이 먼저 울리고, 같은 음정이 다시 울립니다. 두 번째에서 위 음이 몇 센트 어긋났는지(맥놀이로 판별) 아래 보기에서 고르세요.',
  theory: '두 음을 함께 울리면 주파수 차이에 따라 음량이 주기적으로 흔들리는 맥놀이(beating)가 생깁니다. 음정이 정확할수록 맥놀이가 사라지고, 어긋날수록 빨라집니다. 한 반음의 1/100인 센트(cent) 단위의 미세한 차이를 맥놀이로 가려내는 것은 합주·조율의 가장 전문적인 청각 기술입니다.',
  maxLevel: 10,
  defaultLevel: 1,
};

export function centsCode(cents: number): string {
  return cents > 0 ? `+${cents}` : String(cents);
}
export function centsLabel(cents: number): string {
  if (cents === 0) return '정확 (0¢)';
  return cents > 0 ? `+${cents}¢ (높음)` : `${cents}¢ (낮음)`;
}

interface MicroInterval { name: string; semitones: number }
const MICRO_OCTAVE: MicroInterval[] = [{ name: 'P8', semitones: 12 }];
const MICRO_OCT_5: MicroInterval[] = [{ name: 'P8', semitones: 12 }, { name: 'P5', semitones: 7 }];
const MICRO_OCT_5_3: MicroInterval[] = [...MICRO_OCT_5, { name: 'M3', semitones: 4 }, { name: 'M6', semitones: 9 }];

export const MICROTUNING_LEVELS: Record<number, { cents: number[]; intervals: MicroInterval[] }> = {
  1:  { cents: [0, 20, -20],            intervals: MICRO_OCTAVE },
  2:  { cents: [0, 20, -20, 10, -10],   intervals: MICRO_OCTAVE },
  3:  { cents: [0, 15, -15, 8, -8],     intervals: MICRO_OCT_5 },
  4:  { cents: [0, 12, -12, 6, -6],     intervals: MICRO_OCT_5 },
  5:  { cents: [0, 10, -10, 5, -5],     intervals: MICRO_OCT_5 },
  6:  { cents: [0, 8, -8, 4, -4],       intervals: MICRO_OCT_5_3 },
  7:  { cents: [0, 7, -7, 4, -4],       intervals: MICRO_OCT_5_3 },
  8:  { cents: [0, 6, -6, 3, -3],       intervals: MICRO_OCT_5_3 },
  9:  { cents: [0, 5, -5, 3, -3],       intervals: MICRO_OCT_5_3 },
  10: { cents: [0, 4, -4, 2, -2],       intervals: MICRO_OCT_5_3 },
};

export function getMicrotuningChoices(level: number): ChoiceOption[] {
  const cfg = MICROTUNING_LEVELS[level] ?? MICROTUNING_LEVELS[1];
  return cfg.cents.map((c) => ({ value: centsCode(c), label: centsLabel(c) }));
}

// ─── Harmonics (harmonic-series partial identification) ─────────────────────
export const LAB_HARMONICS_MODE_INFO = {
  key: 'lab-harmonics' as ModeKey,
  name: '배음렬 청음',
  emoji: '🌈',
  description: '근음 위의 배음이 몇 배음인지 맞혀보세요',
  howTo: '근음이 먼저 울리고, 이어서 그 배음(정수배 주파수의 음)이 들립니다. 몇 배음인지(2·3·5배음 등) 아래 보기에서 고르세요.',
  theory: '한 음(근음)은 그 주파수의 정수배인 배음들을 품고 있습니다. 2배음은 한 옥타브 위, 3배음은 옥타브+완전5도, 4배음은 2옥타브 위로 멀리 퍼져 나갑니다. 흥미롭게도 5배음(장3도)은 평균율보다 14센트, 7배음(단7도)은 31센트 낮아 자연 배음 특유의 색을 냅니다. 배음을 가려 듣는 귀는 음색·화성·조율의 근본을 이해하는 전문 감각입니다.',
  maxLevel: 10,
  defaultLevel: 1,
};

export const HARMONICS_LEVELS: Record<number, { partials: number[]; low: string; high: string }> = {
  1:  { partials: [2, 4, 8],                       low: 'C2', high: 'C3' },
  2:  { partials: [2, 3, 4, 6, 8],                 low: 'C2', high: 'C3' },
  3:  { partials: [2, 3, 4, 5, 6, 8],              low: 'C2', high: 'C3' },
  4:  { partials: [2, 3, 4, 5, 6, 7, 8],           low: 'C2', high: 'G2' },
  5:  { partials: [2, 3, 4, 5, 6, 7, 8, 9],        low: 'C2', high: 'G2' },
  6:  { partials: [2, 3, 4, 5, 6, 7, 8, 9, 10],    low: 'C2', high: 'G2' },
  7:  { partials: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], low: 'C2', high: 'G2' },
  8:  { partials: [3, 4, 5, 6, 7, 8, 9, 10, 11],   low: 'C2', high: 'A2' },
  9:  { partials: [5, 6, 7, 8, 9, 10, 11],         low: 'C2', high: 'A2' },
  10: { partials: [5, 6, 7, 8, 9, 10, 11],         low: 'A1', high: 'A2' },
};

export function harmonicAnswer(partial: number): string {
  return `${partial}배음`;
}

export function getHarmonicsChoices(level: number): ChoiceOption[] {
  return (HARMONICS_LEVELS[level] ?? HARMONICS_LEVELS[1]).partials.map((p) => ({
    value: harmonicAnswer(p),
    label: harmonicAnswer(p),
  }));
}
