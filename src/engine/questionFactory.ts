import { Note } from 'tonal';
import type { Question, ChordStep, ProgressionAnswer, ModeSrs, ModeStats } from '../types';
import {
  INTERVAL_LEVELS,
  type IntervalDirection,
  randomNote,
  pickRandom,
} from '../theory/intervals';
import { CHORD_LEVELS, buildChord } from '../theory/chords';
import {
  PROGRESSION_LEVELS,
  COMMON_KEYS,
  randomProgressionFromConfig,
  randomPraiseProgression,
  getScaleNotes,
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
  candidateFilter?: (key: string) => boolean
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
export function makeTransposeQuestion(
  level: number,
  _keyMode: 'fixed' | 'random',
  fixedKey: string,
  lastItemKey?: string,
  srs?: ModeSrs,
  stats?: ModeStats,
  candidateFilter?: (key: string) => boolean
): Question {
  const cfg = TRANSPOSE_LEVELS[level] ?? TRANSPOSE_LEVELS[1];
  const key = cfg.keyPool.length <= 1
    ? (cfg.keyPool[0] ?? fixedKey)
    : pickRandom(cfg.keyPool);

  const allItemKeys = cfg.intervals.flatMap((n) => cfg.directions.map((d) => `${n}_${d}`));
  const filteredKeys = candidateFilter ? allItemKeys.filter(candidateFilter) : allItemKeys;
  const itemKeys = filteredKeys.length > 0 ? filteredKeys : allItemKeys;
  const chosenItemKey = nextTarget(itemKeys, srs, stats, lastItemKey);
  const [intervalName, direction] = chosenItemKey.split('_') as [string, IntervalDirection];

  // Anchor the root on the tonic of the picked key — that's the whole point of
  // transposition practice: same interval, different starting pitch.
  const rootMidi = Note.midi(key + '4') ?? 60;
  const rootNote = Note.fromMidi(rootMidi) ?? 'C4';
  const semitones = getIntervalSemitones(intervalName);
  const secondMidi = rootMidi + (direction === 'down' ? -semitones : semitones);
  const secondNote = Note.fromMidi(secondMidi) ?? 'C4';

  return {
    id: genId(),
    mode: 'transpose',
    level,
    itemKey: chosenItemKey,
    data: { type: 'interval', notes: [rootNote, secondNote], direction, intervalName },
    answer: intervalName,
    context: { key },
  };
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
