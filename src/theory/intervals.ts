import { Note, Interval, transpose } from 'tonal';

export const INTERVAL_NAMES = [
  { name: 'P1', label: '완전1도 (유니즌)', semitones: 0 },
  { name: 'm2', label: '단2도', semitones: 1 },
  { name: 'M2', label: '장2도', semitones: 2 },
  { name: 'm3', label: '단3도', semitones: 3 },
  { name: 'M3', label: '장3도', semitones: 4 },
  { name: 'P4', label: '완전4도', semitones: 5 },
  { name: 'A4', label: '증4도 (트라이톤)', semitones: 6 },
  { name: 'P5', label: '완전5도', semitones: 7 },
  { name: 'm6', label: '단6도', semitones: 8 },
  { name: 'M6', label: '장6도', semitones: 9 },
  { name: 'm7', label: '단7도', semitones: 10 },
  { name: 'M7', label: '장7도', semitones: 11 },
  { name: 'P8', label: '완전8도 (옥타브)', semitones: 12 },
];

export type IntervalDirection = 'up' | 'down' | 'harmonic';

export interface IntervalLevelConfig {
  label: string;
  intervals: string[];
  directions: IntervalDirection[];
  noteRangeLow: string;
  noteRangeHigh: string;
}

const CORE_5 = ['P5', 'P4', 'M3', 'm3', 'P8'];
const PLUS_2_6 = [...CORE_5, 'M2', 'm2', 'M6', 'm6'];
const PLUS_TRITONE = [...PLUS_2_6, 'A4'];
const PLUS_M7 = [...PLUS_TRITONE, 'M7'];
const ALL_12 = [...PLUS_M7, 'm7'];

export const INTERVAL_LEVELS: Record<number, IntervalLevelConfig> = {
  1:  { label: '기본 5음 (P5·P4·3도·8도)', intervals: CORE_5,       directions: ['up', 'harmonic'],         noteRangeLow: 'C4', noteRangeHigh: 'C5' },
  2:  { label: '하행 추가',                  intervals: CORE_5,       directions: ['up', 'down', 'harmonic'], noteRangeLow: 'C4', noteRangeHigh: 'C5' },
  3:  { label: '음역 확장',                  intervals: CORE_5,       directions: ['up', 'down', 'harmonic'], noteRangeLow: 'C3', noteRangeHigh: 'G4' },
  4:  { label: '2도·6도 추가',               intervals: PLUS_2_6,     directions: ['up', 'down', 'harmonic'], noteRangeLow: 'C3', noteRangeHigh: 'G4' },
  5:  { label: '광역 음역',                  intervals: PLUS_2_6,     directions: ['up', 'down', 'harmonic'], noteRangeLow: 'A2', noteRangeHigh: 'C6' },
  6:  { label: '트라이톤 추가',              intervals: PLUS_TRITONE, directions: ['up', 'down', 'harmonic'], noteRangeLow: 'A2', noteRangeHigh: 'C6' },
  7:  { label: '장7도 추가',                 intervals: PLUS_M7,      directions: ['up', 'down', 'harmonic'], noteRangeLow: 'A2', noteRangeHigh: 'C6' },
  8:  { label: '단7도 추가 (전음정)',        intervals: ALL_12,       directions: ['up', 'down', 'harmonic'], noteRangeLow: 'A2', noteRangeHigh: 'C6' },
  9:  { label: '화성만 듣기',                intervals: ALL_12,       directions: ['harmonic'],               noteRangeLow: 'A2', noteRangeHigh: 'C6' },
  10: { label: '하행만 듣기',                intervals: ALL_12,       directions: ['down'],                   noteRangeLow: 'A2', noteRangeHigh: 'C6' },
};

/** All item keys (`${interval}_${direction}`) for a given interval level. */
export function intervalItemKeys(level: number): string[] {
  const cfg = INTERVAL_LEVELS[level] ?? INTERVAL_LEVELS[1];
  return cfg.intervals.flatMap((n) => cfg.directions.map((d) => `${n}_${d}`));
}

/** Given a root note and interval name, return the second note */
export function buildInterval(
  root: string,
  intervalName: string,
  direction: IntervalDirection
): string {
  if (direction === 'down') {
    // invert: go down by transposing up by the inverted interval
    const inv = Interval.invert(intervalName);
    const upper = transpose(root, intervalName);
    if (!upper) return root;
    // actually go down: result should be below root
    const down = transpose(root, `-${intervalName}`);
    return down ?? upper;
  }
  const result = transpose(root, intervalName);
  return result ?? root;
}

/** Get the interval name between two notes */
export function detectInterval(noteA: string, noteB: string): string {
  const i = Interval.distance(noteA, noteB);
  return i ?? 'P1';
}

/** Return interval label from short name */
export function intervalLabel(name: string): string {
  return INTERVAL_NAMES.find((i) => i.name === name)?.label ?? name;
}

/** Safe note frequency range check */
export function noteInRange(note: string, low = 'A2', high = 'C6'): boolean {
  const midi = Note.midi(note);
  const midiLow = Note.midi(low);
  const midiHigh = Note.midi(high);
  if (midi == null || midiLow == null || midiHigh == null) return false;
  return midi >= midiLow && midi <= midiHigh;
}

/** Random element helper */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random note in range for a given octave span */
export function randomNote(
  lowNote = 'C3',
  highNote = 'B5'
): string {
  const lowMidi = Note.midi(lowNote) ?? 48;
  const highMidi = Note.midi(highNote) ?? 83;
  const midi = Math.floor(Math.random() * (highMidi - lowMidi + 1)) + lowMidi;
  return Note.fromMidi(midi) ?? 'C4';
}
