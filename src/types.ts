// ─── Training Modes ───────────────────────────────────────────────────────────
export type ModeKey =
  | 'interval'
  | 'chord'
  | 'progression'
  | 'melody'
  | 'solfege'
  | 'transpose'
  | 'rhythm';

// ─── Question & Answer ────────────────────────────────────────────────────────
export interface Question {
  id: string;
  mode: ModeKey;
  level: number;
  itemKey: string;       // stats tracking key, e.g. "P5_harmonic"
  data: QuestionData;
  answer: AnswerValue;
  context: {
    key: string;         // tonic, e.g. "C"
    referenceToneNote?: string; // full note to play as reference, e.g. "C4"
  };
}

export type QuestionData =
  | IntervalData
  | ChordData
  | ProgressionData
  | MelodyData
  | SolfegeData
  | TransposeData
  | RhythmData;

export interface IntervalData {
  type: 'interval';
  notes: string[];       // two full notes, e.g. ["C4","G4"]
  direction: 'up' | 'down' | 'harmonic';
  intervalName: string;  // e.g. "P5"
}

export interface ChordData {
  type: 'chord';
  notes: string[];       // full notes in the chord
  root: string;          // e.g. "C4"
  quality: string;       // e.g. "major", "minor", "dim"
  inversion: number;     // 0 = root, 1 = first, 2 = second
  arpeggio: boolean;
}

export interface ProgressionData {
  type: 'progression';
  chords: ChordStep[];   // ordered list of chord steps
  key: string;
  source: 'diatonic' | 'praise';
}

export interface ChordStep {
  degree: number;        // 1-7
  quality: 'M' | 'm' | 'dim' | 'aug' | '7' | 'M7' | 'm7' | 'm7b5';
  notes: string[];
}

export interface MelodyData {
  type: 'melody';
  notes: string[];       // full notes, e.g. ["C4","D4","E4"]
  key: string;
}

export interface SolfegeData {
  type: 'solfege';
  note: string;          // full note, e.g. "E4"
  solfege: string;       // "mi"
  key: string;
}

export interface TransposeData {
  type: 'transpose';
  subMode: 'A' | 'B';
  chords?: ChordStep[];
  melody?: string[];
  fromKey: string;
  toKey?: string;
}

export interface RhythmData {
  type: 'rhythm';
  pattern: RhythmBeat[];
  bpm: number;
}

export interface RhythmBeat {
  time: number;  // beat position (0-based, in 16th notes)
  duration: number; // in 16th notes
}

export type AnswerValue =
  | string               // interval name, chord quality, solfege syllable
  | string[]             // melody notes, progression degrees
  | ProgressionAnswer[]
  | number[];            // rhythm tap timestamps (ms)

export interface ProgressionAnswer {
  degree: number;
  quality: string;
}

// ─── Session Result ────────────────────────────────────────────────────────────
export interface SessionResult {
  questionId: string;
  itemKey: string;
  mode: ModeKey;
  correct: boolean;
  skipped: boolean;
  partialScore: number;
  timeTaken: number;
}

// ─── Stats Item ────────────────────────────────────────────────────────────────
export interface StatsItem {
  attempts: number;
  correct: number;
  recent: number[];      // last 8: 1=correct, 0=wrong
  lastSeen: number;      // timestamp ms
}

export type ModeStats = Record<string, StatsItem>;

// ─── App Settings ──────────────────────────────────────────────────────────────
export interface AppSettings {
  notation: 'roman' | 'number';
  solfegeMode: 'movable' | 'fixed';
  referenceTone: 'off' | 'perQuestion' | 'perSession';
  keyMode: 'fixed' | 'random';
  fixedKey: string;
  difficultyMode: 'manual' | 'adaptive';
  questionsPerSession: number;
  showStaffFeedback: boolean;
}

// ─── App Store State ────────────────────────────────────────────────────────────
export interface AppState {
  settings: AppSettings;
  stats: Record<ModeKey, ModeStats>;
  sessions: SessionSummary[];
  customPatterns: string[][];
}

export interface SessionSummary {
  date: number;
  mode: ModeKey;
  total: number;
  correct: number;
  durationSec: number;
}
