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

// Intervals grouped by level
export const INTERVAL_LEVELS: Record<number, string[]> = {
  1: ['P5', 'P4', 'M3', 'm3', 'P8'],
  2: ['P5', 'P4', 'M3', 'm3', 'P8', 'M2', 'm2', 'M6', 'm6'],
  3: ['P5', 'P4', 'M3', 'm3', 'P8', 'M2', 'm2', 'M6', 'm6', 'M7', 'm7', 'A4'],
};

export type IntervalDirection = 'up' | 'down' | 'harmonic';

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
