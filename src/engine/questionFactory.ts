import { Note, Scale } from 'tonal';
import type { Question, ChordStep, ProgressionAnswer, ModeSrs, ModeStats } from '../types';
import {
  INTERVAL_LEVELS,
  type IntervalDirection,
  randomNote,
  pickRandom,
} from '../theory/intervals';
import { CHORD_LEVELS, buildChord, chordLabel } from '../theory/chords';
import {
  PROGRESSION_LEVELS,
  COMMON_KEYS,
  randomProgressionFromConfig,
  randomPraiseProgression,
  getScaleNotes,
  buildProgressionSteps,
} from '../theory/progressions';
import {
  SOLFEGE_LEVELS,
  semitoneToSolfege,
  solfegeToSemitone,
} from '../theory/solfege';
import {
  MELODY_LEVELS,
  TRANSPOSE_LEVELS,
  RHYTHM_LEVELS,
  TEMPO_LEVELS,
  BPM_LEVELS,
} from '../modes/levels';
import { pickDue } from './srs';
import {
  SCALE_LEVELS, CADENCE_PATTERNS, CADENCE_LEVELS, KEY_LEVELS, INVERSION_LEVELS,
  COMPARE_FIRST, COMPARE_SECOND, COMPARE_SAME,
  CONTOUR_LEVELS, CONTOUR_LABEL,
  TUNING_IN_TUNE, TUNING_SHARP, TUNING_FLAT, TUNING_CENTS,
  DEGREE_FUNCTION, FUNCTION_LEVELS, FUNCTION_TONIC, FUNCTION_SUBDOMINANT,
  EXTENDED_LEVELS, BASS_LEVELS,
  TENSION_SEMITONES, TENSION_LABEL, TENSION_LEVELS,
} from '../modes/labModes';

/** SRS-aware target picker. Falls back to a random item when SRS is empty. */
export function nextTarget(
  candidates: string[],
  srs: ModeSrs | undefined,
  stats: ModeStats | undefined,
  lastKey?: string
): string {
  if (candidates.length === 0) return '';
  if (!srs || !stats) return pickRandom(candidates);
  return pickDue(srs, stats, candidates, Date.now(), lastKey);
}

function randomKey(keyMode: 'fixed' | 'random', fixedKey: string): string {
  if (keyMode === 'fixed') return fixedKey;
  return pickRandom(COMMON_KEYS);
}

// UUID polyfill for browser
function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Interval ─────────────────────────────────────────────────────────────────
export function makeIntervalQuestion(
  level: number,
  _keyMode: 'fixed' | 'random',
  fixedKey: string,
  lastItemKey?: string,
  srs?: ModeSrs,
  stats?: ModeStats,
  candidateFilter?: (key: string) => boolean
): Question {
  const cfg = INTERVAL_LEVELS[level] ?? INTERVAL_LEVELS[1];
  const allItemKeys = cfg.intervals.flatMap((n) => cfg.directions.map((d) => `${n}_${d}`));
  const filteredKeys = candidateFilter
    ? allItemKeys.filter(candidateFilter)
    : allItemKeys;
  const itemKeys = filteredKeys.length > 0 ? filteredKeys : allItemKeys;
  const chosenItemKey = nextTarget(itemKeys, srs, stats, lastItemKey);
  const [intervalName, direction] = chosenItemKey.split('_') as [string, IntervalDirection];

  const rootNote = randomNote(cfg.noteRangeLow, cfg.noteRangeHigh);
  const semitones = getIntervalSemitones(intervalName);
  const secondMidi = (Note.midi(rootNote) ?? 60) + (direction === 'down' ? -semitones : semitones);
  const secondNote = Note.fromMidi(secondMidi) ?? 'C4';

  const notes = [rootNote, secondNote];

  return {
    id: genId(),
    mode: 'interval',
    level,
    itemKey: chosenItemKey,
    data: { type: 'interval', notes, direction, intervalName },
    answer: intervalName,
    context: { key: fixedKey },
  };
}

function getIntervalSemitones(name: string): number {
  const map: Record<string, number> = {
    P1:0, m2:1, M2:2, m3:3, M3:4, P4:5, A4:6, P5:7, m6:8, M6:9, m7:10, M7:11, P8:12
  };
  return map[name] ?? 0;
}

// ─── Chord ─────────────────────────────────────────────────────────────────────
export function makeChordQuestion(
  level: number,
  _keyMode: 'fixed' | 'random',
  fixedKey: string,
  _arpeggioOverride: boolean,
  lastItemKey?: string,
  srs?: ModeSrs,
  stats?: ModeStats,
  candidateFilter?: (key: string) => boolean
): Question {
  const cfg = CHORD_LEVELS[level] ?? CHORD_LEVELS[1];
  const allItemKeys = cfg.qualities.flatMap((q) => cfg.inversions.map((inv) => `${q}_inv${inv}`));
  const filtered = candidateFilter ? allItemKeys.filter(candidateFilter) : allItemKeys;
  const itemKeys = filtered.length > 0 ? filtered : allItemKeys;
  const itemKey = nextTarget(itemKeys, srs, stats, lastItemKey);
  const [quality, invStr] = itemKey.split('_inv');
  const inversion = parseInt(invStr, 10) || 0;

  const rootNote = randomNote('C3', 'G4');
  const notes = buildChord(rootNote, quality, inversion);

  return {
    id: genId(),
    mode: 'chord',
    level,
    itemKey,
    data: { type: 'chord', notes, root: rootNote, quality, inversion, arpeggio: cfg.arpeggio },
    answer: quality,
    context: { key: fixedKey },
  };
}

// ─── Progression ───────────────────────────────────────────────────────────────
export function makeProgressionQuestion(
  level: number,
  _keyMode: 'fixed' | 'random',
  fixedKey: string,
  source: 'diatonic' | 'praise'
): Question {
  const cfg = PROGRESSION_LEVELS[level] ?? PROGRESSION_LEVELS[1];
  const key = cfg.keyMode === 'random' ? pickRandom(COMMON_KEYS) : fixedKey;

  const steps: ChordStep[] = source === 'praise'
    ? randomPraiseProgression(key)
    : randomProgressionFromConfig(cfg, key);

  const answer: ProgressionAnswer[] = steps.map((s) => ({
    degree: s.degree,
    quality: s.quality,
  }));

  const itemKey = `prog_${steps.map((s) => s.degree).join('-')}`;

  return {
    id: genId(),
    mode: 'progression',
    level,
    itemKey,
    data: { type: 'progression', chords: steps, key, source, playback: cfg.playback },
    answer,
    context: { key, referenceToneNote: key + '4' },
  };
}

// ─── Melody ────────────────────────────────────────────────────────────────────
export function makeMelodyQuestion(
  level: number,
  _keyMode: 'fixed' | 'random',
  fixedKey: string
): Question {
  const cfg = MELODY_LEVELS[level] ?? MELODY_LEVELS[1];
  const key = cfg.keyMode === 'random' ? pickRandom(COMMON_KEYS) : fixedKey;
  const scale = buildExtendedScale(key, cfg.scaleOctaves);
  const lastIdx = scale.length - 1;

  const notes: string[] = [scale[0]]; // start on tonic
  let prevIdx = 0;
  for (let i = 1; i < cfg.noteCount; i++) {
    const lo = Math.max(0, prevIdx - cfg.maxJump);
    const hi = Math.min(lastIdx, prevIdx + cfg.maxJump);
    const candidates: number[] = [];
    for (let j = lo; j <= hi; j++) if (j !== prevIdx) candidates.push(j);
    const idx = candidates.length > 0 ? pickRandom(candidates) : prevIdx;
    notes.push(scale[idx]);
    prevIdx = idx;
  }

  return {
    id: genId(),
    mode: 'melody',
    level,
    itemKey: `melody_lv${level}`,
    data: { type: 'melody', notes, key },
    answer: notes,
    context: { key, referenceToneNote: key + '4' },
  };
}

function buildExtendedScale(tonic: string, octaves: 1 | 2): string[] {
  const oct1 = getScaleNotes(tonic, 4);
  if (octaves === 1) return oct1;
  // For 2-octave span we use octave 4 + the first 7 notes of octave 5.
  const oct2 = getScaleNotes(tonic, 5);
  return [...oct1, ...oct2];
}

// ─── Solfege ───────────────────────────────────────────────────────────────────
export function makeSolfegeQuestion(
  level: number,
  _keyMode: 'fixed' | 'random',
  fixedKey: string,
  lastItemKey?: string,
  srs?: ModeSrs,
  stats?: ModeStats,
  candidateFilter?: (key: string) => boolean,
  absoluteMode = false,
): Question {
  const cfg = SOLFEGE_LEVELS[level] ?? SOLFEGE_LEVELS[1];
  const key = cfg.keyMode === 'random' ? pickRandom(cfg.keyPool) : fixedKey;

  // Build itemKey-indexed pool from the candidate syllables.
  const keyToSemis = new Map<string, number>();
  for (const syl of cfg.candidates) {
    const semis = solfegeToSemitone(syl);
    if (semis < 0) continue;
    keyToSemis.set(`solfege_${syl}`, semis);
  }
  const allItemKeys = Array.from(keyToSemis.keys());
  const filtered = candidateFilter ? allItemKeys.filter(candidateFilter) : allItemKeys;
  const itemKeys = filtered.length > 0 ? filtered : allItemKeys;
  const itemKey = nextTarget(itemKeys, srs, stats, lastItemKey);
  const semis = keyToSemis.get(itemKey) ?? 0;
  const solfegeAnswer = semitoneToSolfege(semis);

  // Choose an octave for the played note. With jitter, randomly ±1 octave.
  const baseOctave = 4;
  const octave = cfg.octaveJitter === 0
    ? baseOctave
    : baseOctave + (Math.random() < 0.5 ? -1 : Math.random() < 0.5 ? 0 : 1);
  const tonicMidi = Note.midi(key + octave) ?? 60;
  const note = Note.fromMidi(tonicMidi + semis) ?? key + octave;

  // Absolute-pitch mode: answer is the note-name pitch class (C, D, E…) and
  // no reference tone is supplied. itemKey is namespaced so stats don't mix
  // with relative-do solfege.
  if (absoluteMode) {
    const pc = Note.pitchClass(note);
    return {
      id: genId(),
      mode: 'solfege',
      level,
      itemKey: `abs_${pc}`,
      data: { type: 'solfege', note, solfege: pc, key },
      answer: pc,
      context: { key, absoluteMode: true },
    };
  }

  return {
    id: genId(),
    mode: 'solfege',
    level,
    itemKey,
    data: { type: 'solfege', note, solfege: solfegeAnswer, key },
    answer: solfegeAnswer,
    context: cfg.suppressReferenceTone
      ? { key }
      : { key, referenceToneNote: key + '4' },
  };
}

// ─── Transpose ─────────────────────────────────────────────────────────────────
// Plays a short melody in fromKey, then asks the user to transpose it into a
// different toKey — they hear the new key's tonic and re-enter the same shape
// shifted to that key. Answer is the toKey notes (compared by pitch class, so
// octave doesn't matter). This is genuine transposition, distinct from melody
// dictation where the answer is just the notes that were played.
export function makeTransposeQuestion(
  level: number,
  _keyMode: 'fixed' | 'random',
  fixedKey: string,
  _lastItemKey?: string,
  _srs?: ModeSrs,
  _stats?: ModeStats,
  _candidateFilter?: (key: string) => boolean
): Question {
  const cfg = TRANSPOSE_LEVELS[level] ?? TRANSPOSE_LEVELS[1];

  // Pick two distinct keys. Fall back gracefully if the pool is tiny.
  const fromKey = pickRandom(cfg.keyPool) || fixedKey;
  const others = cfg.keyPool.filter((k) => k !== fromKey);
  const toKey = (others.length > 0 ? pickRandom(others) : fromKey);

  const pool = cfg.degreePool;
  const degrees: number[] = [pickRandom(pool)];
  for (let i = 1; i < cfg.noteCount; i++) {
    const prev = degrees[i - 1];
    const candidates = pool.filter((d) => d !== prev && Math.abs(d - prev) <= cfg.maxJump);
    degrees.push(candidates.length > 0 ? pickRandom(candidates) : pickRandom(pool));
  }

  const notesInKey = (tonic: string): string[] => {
    const tonicMidi = Note.midi(tonic + '4') ?? 60;
    return degrees.map((d) => Note.fromMidi(tonicMidi + degreeToSemitones(d)) ?? tonic + '4');
  };
  const fromNotes = notesInKey(fromKey);
  const toNotes = notesInKey(toKey);

  return {
    id: genId(),
    mode: 'transpose',
    level,
    itemKey: `transpose_lv${level}`,
    data: { type: 'transpose', degrees, fromKey, toKey, fromNotes, toNotes },
    answer: toNotes,
    // Reference tone for the manual button is the *target* key tonic — that's
    // what the user needs while entering their answer.
    context: { key: toKey, referenceToneNote: toKey + '4' },
  };
}

// Major-scale degree (1..7) → semitones above tonic.
function degreeToSemitones(degree: number): number {
  const map: Record<number, number> = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };
  return map[degree] ?? 0;
}

// ─── Rhythm ────────────────────────────────────────────────────────────────────
export function makeRhythmQuestion(level: number): Question {
  const cfg = RHYTHM_LEVELS[level] ?? RHYTHM_LEVELS[1];
  const pattern = pickRandom(cfg.patterns);
  const bpm = cfg.bpm;
  const sixteenthMs = (60_000 / bpm) / 4;

  const beatTimes = pattern.beats.map((b) => b * sixteenthMs);

  return {
    id: genId(),
    mode: 'rhythm',
    level,
    itemKey: `rhythm_lv${level}`,
    data: {
      type: 'rhythm',
      pattern: pattern.beats.map((time, i) => ({
        time,
        duration: i < pattern.beats.length - 1
          ? pattern.beats[i + 1] - time
          : 4,
      })),
      bpm,
    },
    answer: beatTimes,
    context: { key: 'C' },
  };
}

// ─── Tempo Hold ────────────────────────────────────────────────────────────────
export function makeTempoQuestion(level: number): Question {
  const cfg = TEMPO_LEVELS[level] ?? TEMPO_LEVELS[1];
  const [lo, hi] = cfg.bpmRange;
  const bpm = lo === hi ? lo : lo + Math.floor(Math.random() * (hi - lo + 1));

  return {
    id: genId(),
    mode: 'tempo',
    level,
    itemKey: `tempo_lv${level}`,
    data: { type: 'tempo', bpm, countInBeats: cfg.countInBeats, holdBeats: cfg.holdBeats },
    answer: bpm,
    context: { key: 'C' },
  };
}

// ─── BPM Guess ─────────────────────────────────────────────────────────────────
export function makeBpmQuestion(level: number): Question {
  const cfg = BPM_LEVELS[level] ?? BPM_LEVELS[1];
  const beats = 8;
  const [lo, hi] = cfg.bpmRange;

  let bpm: number;
  let choices: number[] | undefined;

  if (cfg.inputMode === 'choice') {
    const spacing = cfg.choiceSpacing ?? cfg.bpmStep;
    // Enumerate all answer slots on the spacing grid within the BPM range.
    const slots: number[] = [];
    for (let b = lo; b <= hi; b += spacing) slots.push(b);
    bpm = slots[Math.floor(Math.random() * slots.length)];
    // Pick the 3 slots closest to the answer as distractors; if the range
    // can't supply 3, the choice list shrinks rather than padding with bogus
    // values.
    const distractors = slots
      .filter((s) => s !== bpm)
      .sort((a, b2) => Math.abs(a - bpm) - Math.abs(b2 - bpm))
      .slice(0, 3);
    choices = shuffle([bpm, ...distractors]);
  } else {
    // Slider mode: free-form integer in range.
    bpm = lo + Math.floor(Math.random() * (hi - lo + 1));
  }

  return {
    id: genId(),
    mode: 'bpm',
    level,
    itemKey: `bpm_lv${level}`,
    data: {
      type: 'bpm', bpm, beats, inputMode: cfg.inputMode, choices,
      sliderRange: cfg.inputMode === 'slider' ? cfg.bpmRange : undefined,
    },
    answer: bpm,
    context: { key: 'C' },
  };
}

// ─── Lab: Scale ───────────────────────────────────────────────────────────────
const SCALE_TONAL_NAMES: Record<string, string> = {
  'major': 'major',
  'natural minor': 'minor',
  'harmonic minor': 'harmonic minor',
  'melodic minor': 'melodic minor',
  'dorian': 'dorian',
  'phrygian': 'phrygian',
  'lydian': 'lydian',
  'mixolydian': 'mixolydian',
};

export function makeScaleQuestion(level: number): Question {
  const choices = SCALE_LEVELS[level] ?? SCALE_LEVELS[1];
  const scaleName = pickRandom(choices);
  const tonic = pickRandom(COMMON_KEYS);
  const tonalName = SCALE_TONAL_NAMES[scaleName] ?? 'major';
  const scaleNotes = Scale.get(`${tonic}4 ${tonalName}`).notes;
  // Add upper tonic (octave above) so it sounds like a complete scale
  const upper = Note.transpose(tonic + '4', '8P');
  const fullNotes = [...scaleNotes, upper];
  const direction: 'up' | 'down' = level >= 3 && Math.random() < 0.5 ? 'down' : 'up';
  const notes = direction === 'up' ? fullNotes : [...fullNotes].reverse();

  return {
    id: genId(),
    mode: 'lab-scale',
    level,
    itemKey: `scale_${scaleName.replace(/\s+/g, '-')}`,
    data: { type: 'scale', tonic, scaleName, notes, direction },
    answer: scaleName,
    context: { key: tonic, absoluteMode: true },
  };
}

// ─── Lab: Cadence ─────────────────────────────────────────────────────────────
export function makeCadenceQuestion(
  level: number,
  keyMode: 'fixed' | 'random',
  fixedKey: string,
): Question {
  const choices = CADENCE_LEVELS[level] ?? CADENCE_LEVELS[1];
  const cadenceType = pickRandom(choices);
  const key = randomKey(keyMode, fixedKey);
  const pattern = CADENCE_PATTERNS[cadenceType];
  const chords = buildProgressionSteps(pattern, key, 3);

  return {
    id: genId(),
    mode: 'lab-cadence',
    level,
    itemKey: `cadence_${cadenceType}`,
    data: { type: 'cadence', cadenceType, key, chords },
    answer: cadenceType,
    context: { key, referenceToneNote: key + '4' },
  };
}

// ─── Lab: Key Identification ──────────────────────────────────────────────────
export function makeKeyIdQuestion(level: number): Question {
  const choices = KEY_LEVELS[level] ?? KEY_LEVELS[1];
  const key = pickRandom(choices);
  // Always I-IV-V-I in the chosen key.
  const pattern: Array<[number, string]> = [
    [1, 'major'], [4, 'major'], [5, 'dominant7'], [1, 'major'],
  ];
  const steps = buildProgressionSteps(pattern, key, 3);
  const chords = steps.map((s) => s.notes);

  return {
    id: genId(),
    mode: 'lab-key',
    level,
    itemKey: `key_${key}`,
    data: { type: 'key-id', key, mode: 'major', chords },
    answer: key,
    context: { key, absoluteMode: true },
  };
}

// ─── Lab: Chord Inversion ─────────────────────────────────────────────────────
export function makeInversionQuestion(level: number): Question {
  const inversions = INVERSION_LEVELS[level] ?? INVERSION_LEVELS[1];
  const inv = pickRandom(inversions);
  // Use a triad for Lv1, possibly 7th for Lv2 with 3rd inversion
  const useSeventh = level >= 2 && inv === 3;
  const quality = useSeventh ? 'dominant7' : pickRandom(['major', 'minor']);
  const rootNote = randomNote('C3', 'E4');
  const notes = buildChord(rootNote, quality, inv);

  return {
    id: genId(),
    mode: 'lab-inversion',
    level,
    itemKey: `inv_${inv}`,
    data: { type: 'chord', notes, root: rootNote, quality, inversion: inv, arpeggio: false },
    answer: String(inv),
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Interval Compare ──────────────────────────────────────────────────
export function makeIntervalCompareQuestion(level: number): Question {
  const allowSame = level >= 2;
  const pick = () => 1 + Math.floor(Math.random() * 12); // 1..12 semitones
  const semA = pick();
  let semB = pick();
  if (allowSame && Math.random() < 0.25) {
    semB = semA;
  } else {
    const minGap = level >= 2 ? 1 : 3;
    while (Math.abs(semA - semB) < minGap) semB = pick();
  }
  const noteUp = (root: string, semis: number): string[] =>
    [root, Note.fromMidi((Note.midi(root) ?? 60) + semis) ?? root];
  const pairA = noteUp(randomNote('C4', 'C5'), semA);
  const pairB = noteUp(randomNote('C4', 'C5'), semB);
  const answer =
    semA === semB ? COMPARE_SAME : semA > semB ? COMPARE_FIRST : COMPARE_SECOND;
  const code = semA === semB ? 'same' : semA > semB ? 'first' : 'second';

  return {
    id: genId(),
    mode: 'lab-interval-compare',
    level,
    itemKey: `cmp_${code}`,
    data: { type: 'interval-compare', pairA, pairB, semA, semB },
    answer,
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Odd Note ──────────────────────────────────────────────────────────
export function makeOddNoteQuestion(level: number): Question {
  const tonic = pickRandom(COMMON_KEYS);
  const scaleType = level >= 2 && Math.random() < 0.5 ? 'minor' : 'major';
  const base = Scale.get(`${tonic}4 ${scaleType}`).notes;
  const upper = Note.transpose(tonic + '4', '8P');
  const correctNotes = [...base, upper]; // 8 notes incl. upper tonic
  // Alter an interior note (never first/last) by ±1 semitone.
  const wrongIndex = 1 + Math.floor(Math.random() * (correctNotes.length - 2));
  const dir = Math.random() < 0.5 ? 1 : -1;
  const altered =
    Note.fromMidi((Note.midi(correctNotes[wrongIndex]) ?? 60) + dir) ?? correctNotes[wrongIndex];
  const notes = [...correctNotes];
  notes[wrongIndex] = altered;

  return {
    id: genId(),
    mode: 'lab-odd-note',
    level,
    itemKey: `odd_${wrongIndex}`,
    data: { type: 'odd-note', notes, correctNotes, wrongIndex },
    answer: `${wrongIndex + 1}번`,
    context: { key: tonic, absoluteMode: true },
  };
}

// ─── Lab: Melodic Contour ───────────────────────────────────────────────────
const CONTOUR_DEGREES: Record<string, number[]> = {
  'up': [0, 1, 2, 3, 4],
  'down': [4, 3, 2, 1, 0],
  'arch': [0, 2, 4, 2, 0],
  'inv-arch': [4, 2, 0, 2, 4],
  'wave': [0, 2, 1, 3, 2],
};

export function makeContourQuestion(level: number): Question {
  const choices = CONTOUR_LEVELS[level] ?? CONTOUR_LEVELS[1];
  const contour = pickRandom(choices);
  const tonic = pickRandom(COMMON_KEYS);
  const scale = getScaleNotes(tonic, 4);
  const upper = Note.transpose(tonic + '4', '8P');
  const ext = [...scale, upper];
  const notes = (CONTOUR_DEGREES[contour] ?? CONTOUR_DEGREES['up']).map((i) => ext[i] ?? ext[0]);

  return {
    id: genId(),
    mode: 'lab-contour',
    level,
    itemKey: `contour_${contour}`,
    data: { type: 'contour', notes, contour },
    answer: CONTOUR_LABEL[contour],
    context: { key: tonic, absoluteMode: true },
  };
}

// ─── Lab: Tuning (intonation) ───────────────────────────────────────────────
export function makeTuningQuestion(level: number): Question {
  const note = randomNote('C4', 'C5');
  const mags = TUNING_CENTS[level] ?? TUNING_CENTS[1];
  const r = Math.random();
  let cents: number;
  let answer: string;
  if (r < 0.34) {
    cents = 0;
    answer = TUNING_IN_TUNE;
  } else if (r < 0.67) {
    cents = pickRandom(mags);
    answer = TUNING_SHARP;
  } else {
    cents = -pickRandom(mags);
    answer = TUNING_FLAT;
  }
  const code = cents === 0 ? 'intune' : cents > 0 ? 'sharp' : 'flat';

  return {
    id: genId(),
    mode: 'lab-tuning',
    level,
    itemKey: `tune_${code}`,
    data: { type: 'tuning', note, cents },
    answer,
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Harmonic Function (T/S/D) ─────────────────────────────────────────
const DIATONIC_QUALITIES = ['major', 'minor', 'minor', 'major', 'dominant7', 'minor', 'dim'];

export function makeFunctionQuestion(level: number): Question {
  const degrees = FUNCTION_LEVELS[level] ?? FUNCTION_LEVELS[1];
  const degree = pickRandom(degrees);
  const key = pickRandom(COMMON_KEYS);
  const tonicStep = buildProgressionSteps([[1, 'major']], key, 3)[0];
  const quality = DIATONIC_QUALITIES[(degree - 1) % 7];
  const targetStep = buildProgressionSteps([[degree, quality]], key, 3)[0];
  const func = DEGREE_FUNCTION[degree];
  const code = func === FUNCTION_TONIC ? 'T' : func === FUNCTION_SUBDOMINANT ? 'S' : 'D';

  return {
    id: genId(),
    mode: 'lab-function',
    level,
    itemKey: `func_${code}`,
    data: { type: 'function', key, degree, tonicNotes: tonicStep.notes, chordNotes: targetStep.notes },
    answer: func,
    context: { key },
  };
}

// ─── Lab: Extended Chords ───────────────────────────────────────────────────
export function makeExtendedQuestion(level: number): Question {
  const qualities = EXTENDED_LEVELS[level] ?? EXTENDED_LEVELS[1];
  const quality = pickRandom(qualities);
  const rootNote = randomNote('C3', 'F4');
  const notes = buildChord(rootNote, quality, 0);
  const arpeggio = level >= 2 && Math.random() < 0.4;

  return {
    id: genId(),
    mode: 'lab-extended',
    level,
    itemKey: `ext_${quality}`,
    data: { type: 'chord', notes, root: rootNote, quality, inversion: 0, arpeggio },
    answer: chordLabel(quality),
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Bass (lowest note) ────────────────────────────────────────────────
export function makeBassQuestion(level: number): Question {
  const cfg = BASS_LEVELS[level] ?? BASS_LEVELS[1];
  const rootNote = pickRandom(cfg.roots) + '3';
  const quality = pickRandom(cfg.qualities);
  const inversion = pickRandom(cfg.inversions);
  const notes = buildChord(rootNote, quality, inversion);
  const bass = Note.pitchClass(notes[0]);

  return {
    id: genId(),
    mode: 'lab-bass',
    level,
    itemKey: `bass_${bass}`,
    data: { type: 'chord', notes, root: rootNote, quality, inversion, arpeggio: false },
    answer: bass,
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Tension ───────────────────────────────────────────────────────────
export function makeTensionQuestion(level: number): Question {
  const tensions = TENSION_LEVELS[level] ?? TENSION_LEVELS[1];
  const code = pickRandom(tensions);
  const rootNote = randomNote('C3', 'E4');
  const baseNotes = buildChord(rootNote, 'dominant7', 0);
  const semis = TENSION_SEMITONES[code] ?? 14;
  const tensionNote = Note.fromMidi((Note.midi(rootNote) ?? 60) + semis) ?? rootNote;
  const fullNotes = [...baseNotes, tensionNote];

  return {
    id: genId(),
    mode: 'lab-tension',
    level,
    itemKey: `tension_${code}`,
    data: { type: 'tension', root: rootNote, baseNotes, fullNotes, tension: code },
    answer: TENSION_LABEL[code],
    context: { key: 'C', absoluteMode: true },
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
