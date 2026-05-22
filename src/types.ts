// ─── Training Modes ───────────────────────────────────────────────────────────
export type ModeKey =
  | 'interval'
  | 'chord'
  | 'progression'
  | 'melody'
  | 'solfege'
  | 'transpose'
  | 'rhythm'
  | 'tempo'
  | 'bpm'
  | 'lab'
  | 'lab-scale'
  | 'lab-cadence'
  | 'lab-key'
  | 'lab-inversion';

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
    absoluteMode?: boolean;     // session-flag: absolute-pitch mode (no reference)
  };
}

export type QuestionData =
  | IntervalData
  | ChordData
  | ProgressionData
  | MelodyData
  | SolfegeData
  | TransposeData
  | RhythmData
  | TempoData
  | BpmData
  | ScaleData
  | CadenceData
  | KeyIdData;

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
  playback: 'block' | 'arpeggio';
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
  notes: string[];       // actual notes played, e.g. ["G4","B4","D5"]
  degrees: number[];     // 1-7 scale degrees aligned with notes
  key: string;           // tonic of the chosen key, e.g. "G"
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

export interface TempoData {
  type: 'tempo';
  bpm: number;          // target BPM the user must maintain
  countInBeats: number; // metronome lead-in beat count
  holdBeats: number;    // beat count the user must sustain after the metronome stops
}

export interface ScaleData {
  type: 'scale';
  tonic: string;         // e.g. "C"
  scaleName: string;     // e.g. "major", "natural-minor", "dorian"
  notes: string[];       // full notes including upper tonic
  direction: 'up' | 'down';
}

export interface CadenceData {
  type: 'cadence';
  cadenceType: string;   // e.g. "authentic", "plagal", "half", "deceptive"
  key: string;
  chords: ChordStep[];
}

export interface KeyIdData {
  type: 'key-id';
  key: string;           // e.g. "C", "F#"
  mode: 'major' | 'minor';
  chords: string[][];    // sequence of chord note arrays (I-IV-V-I)
}

export interface BpmData {
  type: 'bpm';
  bpm: number;          // actual BPM played
  beats: number;        // metronome beat count
  inputMode: 'choice' | 'slider';
  choices?: number[];   // populated only when inputMode === 'choice'
  sliderRange?: [number, number]; // populated only when inputMode === 'slider'
}

export type AnswerValue =
  | string               // interval name, chord quality, solfege syllable
  | string[]             // melody notes, progression degrees
  | ProgressionAnswer[]
  | number               // bpm guess
  | number[];            // rhythm tap timestamps (ms) or tempo hold tap timestamps

export interface ProgressionAnswer {
  degree: number;
  quality: string;
}

// ─── Session Result ────────────────────────────────────────────────────────────
export interface SessionResult {
  questionId: string;
  itemKey: string;
  mode: ModeKey;
  level: number;          // level the question was generated at (for XP)
  correct: boolean;
  skipped: boolean;
  partialScore: number;
  timeTaken: number;
  xpEarned: number;       // gamification: XP awarded for this answer
  comboAtAnswer: number;  // gamification: combo length after this answer (0 if reset)
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
  weakSessionLength: number;
  reducedMotion: 'system' | 'on' | 'off';
}

// ─── SRS (Spaced Repetition) ───────────────────────────────────────────────────
export interface SrsCard {
  ease: number;      // 1.3 ~ 2.8, SM-2 ease factor
  interval: number;  // current interval in minutes
  due: number;       // timestamp ms when next due
  reps: number;      // successful reps in a row
}

export type ModeSrs = Record<string, SrsCard>;

// ─── Gamification ──────────────────────────────────────────────────────────────
export type RankTier =
  | 'bronze1' | 'bronze2' | 'bronze3'
  | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export interface XpAward {
  base: number;
  correctness: number;
  speed: number;
  combo: number;
  total: number;
}

export interface AchievementUnlock {
  unlockedAt: number;
}

export interface GamificationState {
  totalXp: number;
  achievements: Record<string, AchievementUnlock>;
  bestComboByMode: Partial<Record<ModeKey, number>>;
  lifetimeCorrect: number;
  lifetimeAnswers: number;
  perfectSessionCount: number;
  modesEverTried: Partial<Record<ModeKey, boolean>>;
  // For weakness_conquered detection. Key: `${mode}:${itemKey}`. Value: best
  // accuracy (0..1) ever observed for that item after sufficient attempts.
  weaknessConqueredSnapshot: Record<string, number>;
  // Lifetime count of correct answers given in <1s, for the lightning achievement.
  lightningCount: number;
}

// ─── App Store State ────────────────────────────────────────────────────────────
export interface AppState {
  settings: AppSettings;
  stats: Record<ModeKey, ModeStats>;
  sessions: SessionSummary[];
  customPatterns: string[][];
  srs: Record<ModeKey, ModeSrs>;
  gamification: GamificationState;
}

export interface SessionSummary {
  date: number;
  mode: ModeKey;
  total: number;
  correct: number;
  durationSec: number;
  bestCombo: number;
  xpEarned: number;
}
