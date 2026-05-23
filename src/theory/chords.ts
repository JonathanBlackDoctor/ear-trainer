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
  // Extended / color chords (lab-extended mode)
  { quality: 'sus2',    label: 'Sus2',               symbol: 'sus2',intervals: ['1P','2M','5P'],            semitones: [0,2,7] },
  { quality: 'maj6',    label: '장6화음 (6)',         symbol: '6',   intervals: ['1P','3M','5P','6M'],       semitones: [0,4,7,9] },
  { quality: 'min6',    label: '단6화음 (m6)',        symbol: 'm6',  intervals: ['1P','3m','5P','6M'],       semitones: [0,3,7,9] },
  { quality: 'add9',    label: 'Add9',               symbol: 'add9',intervals: ['1P','3M','5P','9M'],       semitones: [0,4,7,14] },
  { quality: 'maj9',    label: '장9화음 (Maj9)',      symbol: 'M9',  intervals: ['1P','3M','5P','7M','9M'],   semitones: [0,4,7,11,14] },
  { quality: 'dom9',    label: '속9화음 (9)',         symbol: '9',   intervals: ['1P','3M','5P','7m','9M'],   semitones: [0,4,7,10,14] },
  { quality: 'min9',    label: '단9화음 (m9)',        symbol: 'm9',  intervals: ['1P','3m','5P','7m','9M'],   semitones: [0,3,7,10,14] },
];

export interface ChordLevelConfig {
  label: string;
  qualities: string[];
  inversions: number[];
  arpeggio: boolean;
}

const BASIC_2 = ['major', 'minor'];
const PLUS_DIM = [...BASIC_2, 'dim'];
const PLUS_AUG = [...PLUS_DIM, 'aug'];
const PLUS_SUS4 = [...PLUS_AUG, 'sus4'];
const PLUS_DOM7 = [...PLUS_SUS4, 'dominant7'];
const PLUS_MAJ7 = [...PLUS_DOM7, 'major7'];
const PLUS_MIN7 = [...PLUS_MAJ7, 'minor7'];
const ALL_9 = [...PLUS_MIN7, 'm7b5'];

export const CHORD_LEVELS: Record<number, ChordLevelConfig> = {
  1:  { label: '장·단화음',          qualities: BASIC_2,    inversions: [0],    arpeggio: true  },
  2:  { label: '감화음 추가',         qualities: PLUS_DIM,   inversions: [0],    arpeggio: true  },
  3:  { label: '증화음 추가',         qualities: PLUS_AUG,   inversions: [0],    arpeggio: true  },
  4:  { label: 'Sus4 추가',           qualities: PLUS_SUS4,  inversions: [0],    arpeggio: true  },
  5:  { label: '블록 코드 (동시발음)', qualities: PLUS_SUS4,  inversions: [0],    arpeggio: false },
  6:  { label: '속7화음(Dom7) 추가',   qualities: PLUS_DOM7,  inversions: [0],    arpeggio: false },
  7:  { label: '장7화음(Major7) 추가', qualities: PLUS_MAJ7,  inversions: [0],    arpeggio: false },
  8:  { label: '단7화음(Minor7) 추가', qualities: PLUS_MIN7,  inversions: [0],    arpeggio: false },
  9:  { label: '반감화음(ø7) 추가',    qualities: ALL_9,      inversions: [0],    arpeggio: false },
  10: { label: '1전위 추가',          qualities: ALL_9,      inversions: [0, 1], arpeggio: false },
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
