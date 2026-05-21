import { Chord, Note, transpose, Interval } from 'tonal';

export interface ChordInfo {
  quality: string;
  label: string;
  symbol: string;      // e.g. "m", "dim", "M7"
  intervals: string[]; // e.g. ["1P", "3m", "5P"]
  semitones: number[]; // e.g. [0, 3, 7]
}

export const CHORD_TYPES: ChordInfo[] = [
  { quality: 'major',   label: '장화음 (메이저)',     symbol: '',    intervals: ['1P','3M','5P'],       semitones: [0,4,7] },
  { quality: 'minor',   label: '단화음 (마이너)',     symbol: 'm',   intervals: ['1P','3m','5P'],       semitones: [0,3,7] },
  { quality: 'dim',     label: '감화음 (디미니시드)', symbol: 'dim', intervals: ['1P','3m','5d'],       semitones: [0,3,6] },
  { quality: 'aug',     label: '증화음 (어그멘티드)', symbol: 'aug', intervals: ['1P','3M','5A'],       semitones: [0,4,8] },
  { quality: 'sus4',    label: 'Sus4',               symbol: 'sus4',intervals: ['1P','4P','5P'],       semitones: [0,5,7] },
  { quality: 'major7',  label: '장7화음 (Major7)',    symbol: 'M7',  intervals: ['1P','3M','5P','7M'],  semitones: [0,4,7,11] },
  { quality: 'dominant7',label: '속7화음 (Dom7)',     symbol: '7',   intervals: ['1P','3M','5P','7m'],  semitones: [0,4,7,10] },
  { quality: 'minor7',  label: '단7화음 (Minor7)',    symbol: 'm7',  intervals: ['1P','3m','5P','7m'],  semitones: [0,3,7,10] },
  { quality: 'm7b5',    label: '반감화음 (m7b5)',     symbol: 'ø',   intervals: ['1P','3m','5d','7m'],  semitones: [0,3,6,10] },
];

// Levels for chord training
export const CHORD_LEVELS: Record<number, string[]> = {
  1: ['major', 'minor'],
  2: ['major', 'minor', 'dim', 'aug', 'sus4'],
  3: ['major', 'minor', 'dim', 'aug', 'sus4', 'major7', 'dominant7', 'minor7', 'm7b5'],
  4: ['major', 'minor', 'dim', 'aug', 'sus4', 'major7', 'dominant7', 'minor7', 'm7b5'], // + inversions
};

/** Build chord notes from root and quality */
export function buildChord(
  root: string,   // e.g. "C4"
  quality: string,
  inversion = 0
): string[] {
  const info = CHORD_TYPES.find((c) => c.quality === quality);
  if (!info) return [root];

  const notes = info.semitones.map((st) => {
    const midi = (Note.midi(root) ?? 60) + st;
    return Note.fromMidi(midi) ?? 'C4';
  });

  // Apply inversion: move bottom note(s) up an octave
  const inv = Math.min(inversion, notes.length - 1);
  for (let i = 0; i < inv; i++) {
    const shifted = Note.fromMidi((Note.midi(notes[0]) ?? 60) + 12) ?? notes[0];
    notes.shift();
    notes.push(shifted);
  }
  return notes;
}

export function chordLabel(quality: string): string {
  return CHORD_TYPES.find((c) => c.quality === quality)?.label ?? quality;
}

export function chordSymbol(quality: string): string {
  return CHORD_TYPES.find((c) => c.quality === quality)?.symbol ?? '';
}
