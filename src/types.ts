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
  | 'lab-scale'
  | 'lab-cadence'
  | 'lab-inversion'
  | 'lab-interval-compare'
  | 'lab-odd-note'
  | 'lab-contour'
  | 'lab-tuning'
  | 'lab-function'
  | 'lab-extended'
  | 'lab-bass'
  | 'lab-tension'
  // Interval-training expansion: octave-spanning intervals, simultaneous
  // multi-note identification, microtonal precision, and harmonic-series ID.
  | 'lab-wide-interval'
  | 'lab-note-stack'
  | 'lab-microtuning'
  | 'lab-harmonics'
  // Audio-engineer (mixing) modes: EQ/FX listening on noise or a synthesized loop.
  | 'mix-eq-freq'
  | 'mix-eq-boostcut'
  | 'mix-filter'
  | 'mix-compression'
  | 'mix-reverb-amount'
  | 'mix-reverb-type'
  | 'mix-delay-time'
  | 'mix-pan'
  | 'mix-width'
  | 'mix-level'
  | 'mix-distortion'
  | 'mix-modulation';

// Discriminator for the unified MixData payload — one per audio-engineer mode.
export type MixEffect =
  | 'eq-freq'
  | 'eq-boostcut'
  | 'filter'
  | 'compression'
  | 'reverb-amount'
  | 'reverb-type'
  | 'delay-time'
  | 'pan'
  | 'width'
  | 'level'
  | 'distortion'
  | 'modulation';

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
    absoluteMode?: boolean;     // lab modes that present absolute pitches (no reference tone)
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
  | IntervalCompareData
  | OddNoteData
  | ContourData
  | TuningData
  | FunctionData
  | TensionData
  | NoteStackData
  | MicrotuningData
  | HarmonicData
  | MixData;

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
  degrees: number[];     // 1-7 scale degrees of the melodic shape
  fromKey: string;       // key the melody is played in, e.g. "C"
  toKey: string;         // key the user must transpose the melody into, e.g. "G"
  fromNotes: string[];   // notes actually played (in fromKey)
  toNotes: string[];     // expected answer notes (same shape, in toKey)
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

export interface IntervalCompareData {
  type: 'interval-compare';
  pairA: string[];       // two notes of the first interval
  pairB: string[];       // two notes of the second interval
  semA: number;          // semitone size of first interval
  semB: number;          // semitone size of second interval
}

export interface OddNoteData {
  type: 'odd-note';
  notes: string[];       // played scale with one altered note
  correctNotes: string[];// the in-tune scale
  wrongIndex: number;    // 0-based position of the altered note
}

export interface ContourData {
  type: 'contour';
  notes: string[];       // the melody whose shape is judged
  contour: string;       // contour code, e.g. "up", "arch"
}

export interface TuningData {
  type: 'tuning';
  note: string;          // full note, e.g. "A4"
  cents: number;         // detune in cents (+sharp, −flat, 0 in-tune)
}

export interface FunctionData {
  type: 'function';
  key: string;           // tonal center
  degree: number;        // scale degree of the target chord
  tonicNotes: string[];  // I chord, played first to establish the key
  chordNotes: string[];  // the target chord to classify
}

export interface TensionData {
  type: 'tension';
  root: string;          // chord root, full note
  baseNotes: string[];   // base chord (without the tension)
  fullNotes: string[];   // base chord + tension note
  tension: string;       // tension code, e.g. "9", "b9"
}

export interface NoteStackData {
  type: 'note-stack';
  notes: string[];       // simultaneously-sounded notes, ascending
  stackCode: string;     // interval steps from the bottom, e.g. "M3+m3"
  stackLabel: string;    // human label, e.g. "장3도+단3도 (장3화음형)"
}

export interface MicrotuningData {
  type: 'microtuning';
  lowNote: string;       // lower note of the dyad (in tune)
  highNote: string;      // upper note at equal temperament
  intervalName: string;  // e.g. "P8", "P5"
  cents: number;         // detune applied to the upper note (+sharp, −flat)
}

export interface HarmonicData {
  type: 'harmonic';
  fundamental: string;   // the played fundamental, e.g. "C2"
  partial: number;       // harmonic partial number (2 = octave, 3 = 12th, …)
  cents: number;         // 1200·log2(partial) above the fundamental
}

// Unified payload for every audio-engineer (mix-*) mode. One shape instead of
// twelve so the playback dispatch and judge stay small; `effect` selects the
// Tone.js processing chain and `params` carries its numeric/string settings.
export interface MixData {
  type: 'mix';
  effect: MixEffect;
  source: 'pink' | 'loop';   // pink noise or the synthesized groove bed
  compare: 'none' | 'ab';    // 'ab' plays bypassed → gap → processed
  params: Record<string, number | string>;
  detail: string;            // human-readable answer detail, e.g. "2 kHz · +6 dB"
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
  // Last-used difficulty level per mode, so the setup screen restores the
  // level the user practiced at (per-mode because each mode's maxLevel and
  // difficulty meaning differ). Weak-focus sessions are excluded.
  levelByMode?: Partial<Record<ModeKey, number>>;
  reducedMotion: 'system' | 'on' | 'off';
  design: DesignTheme;
  // User-defined ordering of training modes on the Home screen. Reconciled
  // against the current mode registry at read time (see resolveModeOrder).
  modeOrder?: ModeKey[];
  // Modes the user has hidden from the Home screen. They remain in the order
  // editor (so they can be un-hidden) and stay directly reachable by URL.
  hiddenModes?: ModeKey[];
}

// Visual theme. 'default' is the original classic look; g/i/j/m are the four
// designer directions (네오 브루탈리즘 / 모눈·데이터 / 카세트 / 오로라).
export type DesignTheme = 'default' | 'g' | 'i' | 'j' | 'm';

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
