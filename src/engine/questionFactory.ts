import { Note, Scale } from 'tonal';
import type { Question, ChordStep, ProgressionAnswer, ModeSrs, ModeStats, ModeKey, MixEffect } from '../types';
import { getMixChoices, buildMix } from '../modes/mixModes';
import {
  INTERVAL_LEVELS,
  type IntervalDirection,
  randomNote,
  pickRandom,
  intervalItemKeys,
} from '../theory/intervals';
import { CHORD_LEVELS, buildChord, chordLabel, chordItemKeys } from '../theory/chords';
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
  SCALE_LEVELS, SCALE_DESCENDING_PROB, CADENCE_PATTERNS, CADENCE_LEVELS,
  INVERSION_LEVELS, INVERSION_SEVENTHS,
  COMPARE_FIRST, COMPARE_SECOND, COMPARE_SAME, COMPARE_LEVELS,
  ODD_LEVELS, CONTOUR_LEVELS, CONTOUR_LABEL,
  TUNING_IN_TUNE, TUNING_SHARP, TUNING_FLAT, TUNING_CENTS,
  DEGREE_FUNCTION, FUNCTION_LEVELS,
  EXTENDED_LEVELS, BASS_LEVELS,
  TENSION_SEMITONES, TENSION_LABEL, TENSION_LEVELS,
} from '../modes/labModes';
import {
  scaleItemKeys, scaleKey, cadenceItemKeys, inversionItemKeys,
  compareItemKeys, oddNoteItemKeys, contourItemKeys, tuningItemKeys,
  functionItemKeys, funcCode, extendedItemKeys, bassItemKeys, bassOf,
  tensionItemKeys,
} from './itemPool';

/** Per-question selection context shared by every item-focusable factory. */
export interface SelectOpts {
  lastItemKey?: string;
  srs?: ModeSrs;
  stats?: ModeStats;
  candidateFilter?: (key: string) => boolean;
}

/**
 * Choose the next itemKey from a level's pool, honouring the weak-focus
 * candidate filter and SRS/weakness ordering. Falls back to the full pool when
 * the filter would leave nothing (e.g. no recorded weakness yet).
 */
function selectItemKey(allKeys: string[], opts?: SelectOpts): string {
  const filter = opts?.candidateFilter;
  const filtered = filter ? allKeys.filter(filter) : allKeys;
  const keys = filtered.length > 0 ? filtered : allKeys;
  return nextTarget(keys, opts?.srs, opts?.stats, opts?.lastItemKey);
}

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
  const allItemKeys = intervalItemKeys(level);
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
    P1:0, m2:1, M2:2, m3:3, M3:4, P4:5, A4:6, P5:7, m6:8, M6:9, m7:10, M7:11, P8:12,
    m9:13, M9:14, P11:17, M13:21, P15:24,
  };
  return map[name] ?? 0;
}

// Higher levels randomize the register so chord quality / inversion / bass /
// function must be identified regardless of where the chord sits — an
// essence-preserving difficulty lever for the chord-ID family of modes.
function registerRange(level: number): [string, string] {
  if (level >= 9) return ['A1', 'C5'];
  if (level >= 7) return ['G2', 'A4'];
  return ['C3', 'G4'];
}
function registerOctave(level: number): number {
  if (level >= 9) return pickRandom([2, 3, 4]);
  if (level >= 7) return pickRandom([2, 3]);
  return 3;
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
  const allItemKeys = chordItemKeys(level);
  const filtered = candidateFilter ? allItemKeys.filter(candidateFilter) : allItemKeys;
  const itemKeys = filtered.length > 0 ? filtered : allItemKeys;
  const itemKey = nextTarget(itemKeys, srs, stats, lastItemKey);
  const [quality, invStr] = itemKey.split('_inv');
  const inversion = parseInt(invStr, 10) || 0;

  const rootNote = randomNote(...registerRange(level));
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
    ? randomPraiseProgression(key, 3, cfg)
    : randomProgressionFromConfig(cfg, key);

  const answer: ProgressionAnswer[] = steps.map((s) => ({
    degree: s.degree,
    quality: s.quality,
  }));

  // Level is suffixed so weakFocusLevel can target the user's weakest
  // progression level (the exact degree-shape space is too combinatorial to
  // filter on directly).
  const itemKey = `prog_${steps.map((s) => s.degree).join('-')}__lv${level}`;

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

function buildExtendedScale(tonic: string, octaves: 1 | 2 | 3): string[] {
  const notes = getScaleNotes(tonic, 4);
  if (octaves >= 2) notes.push(...getScaleNotes(tonic, 5));
  if (octaves >= 3) notes.push(...getScaleNotes(tonic, 6));
  return notes;
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

  // Choose an octave for the played note. With jitter j, pick uniformly from −j..+j.
  const baseOctave = 4;
  const j = cfg.octaveJitter;
  const octave = j === 0
    ? baseOctave
    : baseOctave + (Math.floor(Math.random() * (2 * j + 1)) - j);
  const tonicMidi = Note.midi(key + octave) ?? 60;
  const note = Note.fromMidi(tonicMidi + semis) ?? key + octave;

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
  'locrian': 'locrian',
};

export function makeScaleQuestion(level: number, opts?: SelectOpts): Question {
  const choices = SCALE_LEVELS[level] ?? SCALE_LEVELS[1];
  const itemKey = selectItemKey(scaleItemKeys(level), opts);
  const scaleName = choices.find((n) => scaleKey(n) === itemKey) ?? choices[0];
  const tonic = pickRandom(COMMON_KEYS);
  const tonalName = SCALE_TONAL_NAMES[scaleName] ?? 'major';
  const scaleNotes = Scale.get(`${tonic}4 ${tonalName}`).notes;
  // Add upper tonic (octave above) so it sounds like a complete scale
  const upper = Note.transpose(tonic + '4', '8P');
  const fullNotes = [...scaleNotes, upper];
  // Descending playback at the top tiers, increasingly often, adds difficulty.
  const direction: 'up' | 'down' =
    Math.random() < (SCALE_DESCENDING_PROB[level] ?? 0) ? 'down' : 'up';
  const notes = direction === 'up' ? fullNotes : [...fullNotes].reverse();

  return {
    id: genId(),
    mode: 'lab-scale',
    level,
    itemKey,
    data: { type: 'scale', tonic, scaleName, notes, direction },
    answer: scaleName,
    context: { key: tonic, absoluteMode: true },
  };
}

// ─── Lab: Cadence ─────────────────────────────────────────────────────────────
export function makeCadenceQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = CADENCE_LEVELS[level] ?? CADENCE_LEVELS[1];
  const itemKey = selectItemKey(cadenceItemKeys(level), opts);
  const cadenceType = itemKey.slice('cadence_'.length);
  const key = pickRandom(cfg.keys);
  const pattern = CADENCE_PATTERNS[cadenceType];
  const chords = buildProgressionSteps(pattern, key, 3);

  return {
    id: genId(),
    mode: 'lab-cadence',
    level,
    itemKey,
    data: { type: 'cadence', cadenceType, key, chords },
    answer: cadenceType,
    context: { key, referenceToneNote: key + '4' },
  };
}

// ─── Lab: Chord Inversion ─────────────────────────────────────────────────────
export function makeInversionQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = INVERSION_LEVELS[level] ?? INVERSION_LEVELS[1];
  const itemKey = selectItemKey(inversionItemKeys(level), opts);
  const inv = Number(itemKey.slice('inv_'.length));
  // A 3rd inversion only exists for 7th chords, so force one in that case.
  const sevenths = cfg.qualities.filter((q) => INVERSION_SEVENTHS.includes(q));
  const quality = inv === 3
    ? (sevenths.length > 0 ? pickRandom(sevenths) : 'dominant7')
    : pickRandom(cfg.qualities);
  const rootNote = randomNote(...registerRange(level));
  const notes = buildChord(rootNote, quality, inv);

  return {
    id: genId(),
    mode: 'lab-inversion',
    level,
    itemKey,
    data: { type: 'chord', notes, root: rootNote, quality, inversion: inv, arpeggio: false },
    answer: String(inv),
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Interval Compare ──────────────────────────────────────────────────
export function makeIntervalCompareQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = COMPARE_LEVELS[level] ?? COMPARE_LEVELS[1];
  const itemKey = selectItemKey(compareItemKeys(level), opts);
  const code = itemKey.slice('cmp_'.length); // 'first' | 'second' | 'same'
  const pick = () => 1 + Math.floor(Math.random() * 12); // 1..12 semitones
  let semA = pick();
  let semB = pick();
  if (code === 'same') {
    semB = semA;
  } else {
    // minGap >= 1 guarantees semA !== semB, then orient so the requested side wins.
    while (Math.abs(semA - semB) < cfg.minGap) semB = pick();
    if (code === 'first' && semA < semB) [semA, semB] = [semB, semA];
    if (code === 'second' && semA > semB) [semA, semB] = [semB, semA];
  }
  const noteUp = (root: string, semis: number): string[] =>
    [root, Note.fromMidi((Note.midi(root) ?? 60) + semis) ?? root];
  const pairA = noteUp(randomNote(cfg.low, cfg.high), semA);
  const pairB = noteUp(randomNote(cfg.low, cfg.high), semB);
  const answer =
    semA === semB ? COMPARE_SAME : semA > semB ? COMPARE_FIRST : COMPARE_SECOND;

  return {
    id: genId(),
    mode: 'lab-interval-compare',
    level,
    itemKey,
    data: { type: 'interval-compare', pairA, pairB, semA, semB },
    answer,
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Odd Note ──────────────────────────────────────────────────────────
export function makeOddNoteQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = ODD_LEVELS[level] ?? ODD_LEVELS[1];
  const tonic = pickRandom(COMMON_KEYS);
  const scaleType = pickRandom(cfg.scales);
  const base = Scale.get(`${tonic}4 ${scaleType}`).notes;
  const upper = Note.transpose(tonic + '4', '8P');
  let correctNotes = [...base, upper]; // 8 notes incl. upper tonic
  const n = correctNotes.length;

  // itemKey encodes the *displayed* (post-flip) altered position. Decide the
  // descending flip first, then alter the pre-flip slot that lands there.
  const itemKey = selectItemKey(oddNoteItemKeys(level), opts);
  const targetAlt = Number(itemKey.slice('odd_'.length));
  const descending = cfg.descending && Math.random() < 0.5;
  const preIndex = descending ? n - 1 - targetAlt : targetAlt;

  const dir = Math.random() < 0.5 ? 1 : -1;
  let notes = [...correctNotes];
  notes[preIndex] = Note.fromMidi((Note.midi(correctNotes[preIndex]) ?? 60) + dir) ?? correctNotes[preIndex];
  let altIndex = preIndex;

  if (descending) {
    notes = [...notes].reverse();
    correctNotes = [...correctNotes].reverse();
    altIndex = n - 1 - altIndex; // === targetAlt
  }

  return {
    id: genId(),
    mode: 'lab-odd-note',
    level,
    itemKey,
    data: { type: 'odd-note', notes, correctNotes, wrongIndex: altIndex },
    answer: `${altIndex + 1}번`,
    context: { key: tonic, absoluteMode: true },
  };
}

// ─── Lab: Melodic Contour ───────────────────────────────────────────────────
const CONTOUR_DEGREES_5: Record<string, number[]> = {
  'up': [0, 1, 2, 3, 4],
  'down': [4, 3, 2, 1, 0],
  'arch': [0, 2, 4, 2, 0],
  'inv-arch': [4, 2, 0, 2, 4],
  'wave': [0, 2, 1, 3, 2],
};
const CONTOUR_DEGREES_7: Record<string, number[]> = {
  'up': [0, 1, 2, 3, 4, 5, 6],
  'down': [6, 5, 4, 3, 2, 1, 0],
  'arch': [0, 1, 3, 6, 3, 1, 0],
  'inv-arch': [6, 5, 3, 0, 3, 5, 6],
  'wave': [0, 2, 1, 3, 2, 4, 3],
};
const CONTOUR_DEGREES_9: Record<string, number[]> = {
  'up': [0, 1, 2, 3, 4, 5, 6, 7, 8],
  'down': [8, 7, 6, 5, 4, 3, 2, 1, 0],
  'arch': [0, 1, 3, 5, 8, 5, 3, 1, 0],
  'inv-arch': [8, 7, 5, 3, 0, 3, 5, 7, 8],
  'wave': [0, 2, 1, 4, 3, 6, 5, 7, 6],
};

export function makeContourQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = CONTOUR_LEVELS[level] ?? CONTOUR_LEVELS[1];
  const itemKey = selectItemKey(contourItemKeys(level), opts);
  const contour = itemKey.slice('contour_'.length);
  const tonic = pickRandom(COMMON_KEYS);
  // Length 9 spans two octaves; shorter shapes fit in one octave + upper tonic.
  const ext = cfg.length === 9
    ? [...getScaleNotes(tonic, 4), ...getScaleNotes(tonic, 5), Note.transpose(tonic + '5', '8P')]
    : [...getScaleNotes(tonic, 4), Note.transpose(tonic + '4', '8P')];
  const degreeTable = cfg.length === 9 ? CONTOUR_DEGREES_9
    : cfg.length === 7 ? CONTOUR_DEGREES_7 : CONTOUR_DEGREES_5;
  const pattern = degreeTable[contour] ?? CONTOUR_DEGREES_5['up'];
  // Jitter shifts the whole shape off the tonic so it can't be read by "starts on do".
  const offset = cfg.jitter ? Math.floor(Math.random() * 2) : 0;
  const maxIdx = ext.length - 1;
  const notes = pattern.map((i) => ext[Math.min(maxIdx, i + offset)] ?? ext[0]);

  return {
    id: genId(),
    mode: 'lab-contour',
    level,
    itemKey,
    data: { type: 'contour', notes, contour },
    answer: CONTOUR_LABEL[contour],
    context: { key: tonic, absoluteMode: true },
  };
}

// ─── Lab: Tuning (intonation) ───────────────────────────────────────────────
export function makeTuningQuestion(level: number, opts?: SelectOpts): Question {
  const note = randomNote('C4', 'C5');
  const mags = TUNING_CENTS[level] ?? TUNING_CENTS[1];
  const itemKey = selectItemKey(tuningItemKeys(level), opts);
  const code = itemKey.slice('tune_'.length); // 'intune' | 'sharp' | 'flat'
  let cents = 0;
  let answer = TUNING_IN_TUNE;
  if (code === 'sharp') { cents = pickRandom(mags); answer = TUNING_SHARP; }
  else if (code === 'flat') { cents = -pickRandom(mags); answer = TUNING_FLAT; }

  return {
    id: genId(),
    mode: 'lab-tuning',
    level,
    itemKey,
    data: { type: 'tuning', note, cents },
    answer,
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Harmonic Function (T/S/D) ─────────────────────────────────────────
const DIATONIC_QUALITIES = ['major', 'minor', 'minor', 'major', 'dominant7', 'minor', 'dim'];

export function makeFunctionQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = FUNCTION_LEVELS[level] ?? FUNCTION_LEVELS[1];
  const itemKey = selectItemKey(functionItemKeys(level), opts);
  const code = itemKey.slice('func_'.length); // 'T' | 'S' | 'D'
  const matching = cfg.degrees.filter((d) => funcCode(d) === code);
  const degree = pickRandom(matching.length > 0 ? matching : cfg.degrees);
  const key = cfg.randomKey ? pickRandom(COMMON_KEYS) : 'C';
  const tonicStep = buildProgressionSteps([[1, 'major']], key, 3)[0];
  const quality = DIATONIC_QUALITIES[(degree - 1) % 7];
  const targetStep = buildProgressionSteps([[degree, quality]], key, registerOctave(level))[0];
  const func = DEGREE_FUNCTION[degree];

  return {
    id: genId(),
    mode: 'lab-function',
    level,
    itemKey,
    data: { type: 'function', key, degree, tonicNotes: tonicStep.notes, chordNotes: targetStep.notes },
    answer: func,
    context: { key },
  };
}

// ─── Lab: Extended Chords ───────────────────────────────────────────────────
export function makeExtendedQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = EXTENDED_LEVELS[level] ?? EXTENDED_LEVELS[1];
  const itemKey = selectItemKey(extendedItemKeys(level), opts);
  const quality = itemKey.slice('ext_'.length);
  const inversion = pickRandom(cfg.inversions);
  const rootNote = randomNote(...registerRange(level));
  const notes = buildChord(rootNote, quality, inversion);

  return {
    id: genId(),
    mode: 'lab-extended',
    level,
    itemKey,
    data: { type: 'chord', notes, root: rootNote, quality, inversion, arpeggio: cfg.arpeggio },
    answer: chordLabel(quality),
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Bass (lowest note) ────────────────────────────────────────────────
export function makeBassQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = BASS_LEVELS[level] ?? BASS_LEVELS[1];
  const itemKey = selectItemKey(bassItemKeys(level), opts);
  const targetBass = itemKey.slice('bass_'.length);
  // Gather every (root, quality, inversion) whose lowest note is the target.
  const combos: Array<{ root: string; quality: string; inversion: number }> = [];
  for (const root of cfg.roots)
    for (const q of cfg.qualities)
      for (const inv of cfg.inversions)
        if (bassOf(root, q, inv) === targetBass) combos.push({ root, quality: q, inversion: inv });
  const chosen = combos.length > 0
    ? pickRandom(combos)
    : { root: pickRandom(cfg.roots), quality: pickRandom(cfg.qualities), inversion: pickRandom(cfg.inversions) };
  const rootNote = chosen.root + registerOctave(level);
  const notes = buildChord(rootNote, chosen.quality, chosen.inversion);
  const bass = Note.pitchClass(notes[0]);

  return {
    id: genId(),
    mode: 'lab-bass',
    level,
    itemKey: `bass_${bass}`,
    data: { type: 'chord', notes, root: rootNote, quality: chosen.quality, inversion: chosen.inversion, arpeggio: false },
    answer: bass,
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Lab: Tension ───────────────────────────────────────────────────────────
export function makeTensionQuestion(level: number, opts?: SelectOpts): Question {
  const cfg = TENSION_LEVELS[level] ?? TENSION_LEVELS[1];
  const itemKey = selectItemKey(tensionItemKeys(level), opts);
  const code = itemKey.slice('tension_'.length);
  const base = pickRandom(cfg.bases);
  const rootNote = randomNote(...registerRange(level));
  const baseNotes = buildChord(rootNote, base, 0);
  const semis = TENSION_SEMITONES[code] ?? 14;
  const tensionNote = Note.fromMidi((Note.midi(rootNote) ?? 60) + semis) ?? rootNote;
  const fullNotes = [...baseNotes, tensionNote];

  return {
    id: genId(),
    mode: 'lab-tension',
    level,
    itemKey,
    data: { type: 'tension', root: rootNote, baseNotes, fullNotes, tension: code },
    answer: TENSION_LABEL[code],
    context: { key: 'C', absoluteMode: true },
  };
}

// ─── Audio-engineer (mix) modes ─────────────────────────────────────────────
export function makeMixQuestion(mode: ModeKey, level: number, opts?: SelectOpts): Question {
  const effect = mode.replace(/^mix-/, '') as MixEffect;
  const choices = getMixChoices(effect, level);
  const itemKeys = choices.map((c) => `${effect}_${c.value}`);
  const itemKey = selectItemKey(itemKeys, opts);
  const value = itemKey.slice(effect.length + 1);
  const build = buildMix(effect, level, value);

  return {
    id: genId(),
    mode,
    level,
    itemKey,
    data: {
      type: 'mix',
      effect,
      source: build.source,
      compare: build.compare,
      params: build.params,
      detail: build.detail,
    },
    answer: value,
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
