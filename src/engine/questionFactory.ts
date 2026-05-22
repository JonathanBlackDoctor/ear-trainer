import { Note, Scale } from 'tonal';
import type { Question, ChordStep, ProgressionAnswer, ModeKey, ModeSrs, ModeStats } from '../types';
import { INTERVAL_LEVELS, type IntervalDirection, randomNote, pickRandom } from '../theory/intervals';
import { CHORD_LEVELS, buildChord } from '../theory/chords';
import { COMMON_KEYS, randomDiatonicProgression, randomPraiseProgression, degreeToNote, getScaleNotes } from '../theory/progressions';
import { semitoneToSolfege } from '../theory/solfege';
import { transposeNote } from '../theory/transpose';
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
  keyMode: 'fixed' | 'random',
  fixedKey: string,
  lastItemKey?: string,
  srs?: ModeSrs,
  stats?: ModeStats,
  candidateFilter?: (key: string) => boolean
): Question {
  const intervals = INTERVAL_LEVELS[level] ?? INTERVAL_LEVELS[1];
  const directions: IntervalDirection[] = level >= 2
    ? ['up', 'down', 'harmonic']
    : ['up', 'harmonic'];
  // Build all itemKey candidates as `${name}_${direction}` so SRS can pick the
  // most overdue. Apply caller-supplied filter (e.g. weak-only sessions).
  const allItemKeys = intervals.flatMap((n) => directions.map((d) => `${n}_${d}`));
  const filteredKeys = candidateFilter
    ? allItemKeys.filter(candidateFilter)
    : allItemKeys;
  const itemKeys = filteredKeys.length > 0 ? filteredKeys : allItemKeys;
  const chosenItemKey = nextTarget(itemKeys, srs, stats, lastItemKey);
  const [intervalName, direction] = chosenItemKey.split('_') as [string, IntervalDirection];

  // Pick a root note that keeps both notes in range
  const rootNote = randomNote('C3', 'G4');
  const semitones = getIntervalSemitones(intervalName);
  const secondMidi = (Note.midi(rootNote) ?? 60) + (direction === 'down' ? -semitones : semitones);
  const secondNote = Note.fromMidi(secondMidi) ?? 'C4';

  const notes = direction === 'down' ? [rootNote, secondNote] : [rootNote, secondNote];
  const itemKey = chosenItemKey;

  return {
    id: genId(),
    mode: 'interval',
    level,
    itemKey,
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
  keyMode: 'fixed' | 'random',
  fixedKey: string,
  arpeggio: boolean,
  lastItemKey?: string,
  srs?: ModeSrs,
  stats?: ModeStats,
  candidateFilter?: (key: string) => boolean
): Question {
  const qualities = CHORD_LEVELS[level] ?? CHORD_LEVELS[1];
  const inversions = level >= 4 ? [0, 1] : [0];
  const allItemKeys = qualities.flatMap((q) => inversions.map((inv) => `${q}_inv${inv}`));
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
    data: { type: 'chord', notes, root: rootNote, quality, inversion, arpeggio },
    answer: quality,
    context: { key: fixedKey },
  };
}

// ─── Progression ───────────────────────────────────────────────────────────────
export function makeProgressionQuestion(
  level: number,
  keyMode: 'fixed' | 'random',
  fixedKey: string,
  source: 'diatonic' | 'praise'
): Question {
  const key = randomKey(keyMode, fixedKey);
  const length = level <= 1 ? 2 : level <= 2 ? 3 : 4;

  const steps: ChordStep[] = source === 'praise'
    ? randomPraiseProgression(key)
    : randomDiatonicProgression(length as 2|3|4, key);

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
    data: { type: 'progression', chords: steps, key, source },
    answer,
    context: { key, referenceToneNote: key + '4' },
  };
}

// ─── Melody ────────────────────────────────────────────────────────────────────
export function makeMelodyQuestion(
  level: number,
  keyMode: 'fixed' | 'random',
  fixedKey: string
): Question {
  const key = level >= 3 ? randomKey(keyMode, fixedKey) : fixedKey;
  const scaleNotes = getScaleNotes(key, 4);

  const noteCount = level <= 1 ? pickRandom([3, 4]) : level <= 2 ? pickRandom([5, 6]) : pickRandom([7, 8]);
  const melody: string[] = [];
  for (let i = 0; i < noteCount; i++) {
    if (melody.length === 0) {
      melody.push(scaleNotes[0]); // start on tonic
    } else {
      const prev = melody[melody.length - 1];
      const prevIdx = scaleNotes.indexOf(prev.replace(/\d/, '').concat(prev.replace(/[A-Za-z#b]/, '') || '4').trim());
      const maxJump = level <= 1 ? 1 : level <= 2 ? 2 : 4;
      const candidateIndices: number[] = [];
      for (let j = Math.max(0, prevIdx - maxJump); j <= Math.min(6, prevIdx + maxJump); j++) {
        if (j !== prevIdx) candidateIndices.push(j);
      }
      const idx = candidateIndices.length > 0
        ? pickRandom(candidateIndices)
        : Math.floor(Math.random() * 7);
      melody.push(scaleNotes[idx] ?? scaleNotes[0]);
    }
  }

  // Build proper chromatic melody notes from scale
  const finalMelody = buildMelodyNotes(melody.length, key, level);

  return {
    id: genId(),
    mode: 'melody',
    level,
    itemKey: `melody_lv${level}`,
    data: { type: 'melody', notes: finalMelody, key },
    answer: finalMelody,
    context: { key, referenceToneNote: key + '4' },
  };
}

function buildMelodyNotes(count: number, key: string, level: number): string[] {
  const scale = getScaleNotes(key, 4);
  const notes: string[] = [];
  const maxJump = level <= 1 ? 1 : level <= 2 ? 2 : 3;

  let prevIdx = 0; // start on tonic
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      notes.push(scale[0]);
      continue;
    }
    const lo = Math.max(0, prevIdx - maxJump);
    const hi = Math.min(6, prevIdx + maxJump);
    const candidates = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k)
      .filter((j) => j !== prevIdx);
    const idx = candidates.length > 0 ? pickRandom(candidates) : prevIdx;
    notes.push(scale[idx]);
    prevIdx = idx;
  }
  return notes;
}

// ─── Solfege ───────────────────────────────────────────────────────────────────
export function makeSolfegeQuestion(
  level: number,
  keyMode: 'fixed' | 'random',
  fixedKey: string,
  lastItemKey?: string,
  srs?: ModeSrs,
  stats?: ModeStats,
  candidateFilter?: (key: string) => boolean
): Question {
  const key = level >= 3 ? randomKey(keyMode, fixedKey) : fixedKey;
  const scale = getScaleNotes(key, 4);

  // Level 1: diatonic only; Level 2+: include chromatic.
  const noteCandidates = level <= 1 ? scale : [
    ...scale,
    ...[1, 3, 6, 8, 10].map((st) => {
      const midi = (Note.midi(scale[0]) ?? 60) + st;
      return Note.fromMidi(midi) ?? scale[0];
    }),
  ];

  // Build itemKey-indexed pool so SRS can pick by syllable. Itemkey →
  // representative note, then we let SRS select among unique itemKeys.
  const keyToNote = new Map<string, string>();
  for (const n of noteCandidates) {
    const noteMidi = Note.midi(n) ?? 60;
    const tonicMidi = Note.midi(key + '4') ?? 60;
    const semis = ((noteMidi - tonicMidi) % 12 + 12) % 12;
    const ik = `solfege_${semitoneToSolfege(semis)}`;
    if (!keyToNote.has(ik)) keyToNote.set(ik, n);
  }
  const allItemKeys = Array.from(keyToNote.keys());
  const filtered = candidateFilter ? allItemKeys.filter(candidateFilter) : allItemKeys;
  const itemKeys = filtered.length > 0 ? filtered : allItemKeys;
  const itemKey = nextTarget(itemKeys, srs, stats, lastItemKey);
  const note = keyToNote.get(itemKey) ?? noteCandidates[0];

  const tonicMidi = Note.midi(key + '4') ?? 60;
  const noteMidi = Note.midi(note) ?? 60;
  const semitones = ((noteMidi - tonicMidi) % 12 + 12) % 12;
  const solfegeAnswer = semitoneToSolfege(semitones);

  return {
    id: genId(),
    mode: 'solfege',
    level,
    itemKey,
    data: { type: 'solfege', note, solfege: solfegeAnswer, key },
    answer: solfegeAnswer,
    context: { key, referenceToneNote: key + '4' },
  };
}

// ─── Rhythm ────────────────────────────────────────────────────────────────────
interface RhythmPattern {
  beats: number[];  // beat positions in 16th notes
  duration: number; // total length in 16th notes
}

const RHYTHM_PATTERNS: Record<number, RhythmPattern[]> = {
  1: [
    { beats: [0, 4, 8, 12], duration: 16 },
    { beats: [0, 8], duration: 16 },
    { beats: [0, 4, 8], duration: 12 },
    { beats: [0, 4, 12], duration: 16 },
  ],
  2: [
    { beats: [0, 2, 4, 8, 10, 12], duration: 16 },
    { beats: [0, 4, 6, 8, 12], duration: 16 },
    { beats: [0, 2, 8, 10], duration: 16 },
    { beats: [0, 4, 6, 10, 12], duration: 16 },     // 붙임줄 느낌
    { beats: [0, 2, 6, 8, 14], duration: 16 },      // 8분 + 점음표
    { beats: [0, 4, 10, 12], duration: 16 },        // 당김음 시작
  ],
  3: [
    { beats: [0, 1, 4, 6, 8, 9, 12, 14], duration: 16 },
    { beats: [0, 3, 4, 8, 11, 12], duration: 16 },
    { beats: [0, 2, 5, 8, 10, 13], duration: 16 },  // 셋잇단 느낌 (5,13 = off-grid)
    { beats: [0, 3, 6, 8, 11, 14], duration: 16 },  // 싱코페이션
    { beats: [0, 1, 2, 8, 10, 12, 13, 14], duration: 16 }, // 16분 묶음
  ],
  4: [
    { beats: [0, 3, 5, 8, 10, 11, 13, 15], duration: 16 },  // 강한 싱코페이션
    { beats: [0, 1, 3, 5, 8, 9, 11, 13, 14], duration: 16 }, // 16분 + 셋잇단 혼합
    { beats: [0, 2, 3, 6, 8, 11, 13, 14], duration: 16 },   // 당김음 풍성
    { beats: [0, 1, 4, 5, 7, 8, 11, 12, 15], duration: 16 }, // 빠른 16분
  ],
};

export function makeRhythmQuestion(level: number): Question {
  const patterns = RHYTHM_PATTERNS[level] ?? RHYTHM_PATTERNS[1];
  const pattern = pickRandom(patterns);
  const bpm = level <= 1 ? 80 : level <= 2 ? 90 : level <= 3 ? 100 : 110;
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
  let bpm: number;
  let countInBeats: number;
  let holdBeats: number;
  if (level <= 1) {
    bpm = 90;
    countInBeats = 4;
    holdBeats = 4;
  } else if (level <= 2) {
    bpm = 60 + Math.floor(Math.random() * 61); // 60~120
    countInBeats = 4;
    holdBeats = 8;
  } else {
    bpm = 60 + Math.floor(Math.random() * 81); // 60~140
    countInBeats = 2;
    holdBeats = 8;
  }

  return {
    id: genId(),
    mode: 'tempo',
    level,
    itemKey: `tempo_lv${level}`,
    data: { type: 'tempo', bpm, countInBeats, holdBeats },
    answer: bpm,
    context: { key: 'C' },
  };
}

// ─── BPM Guess ─────────────────────────────────────────────────────────────────
export function makeBpmQuestion(level: number): Question {
  const beats = 8;
  let bpm: number;
  let inputMode: 'choice' | 'slider';
  let choices: number[] | undefined;

  if (level <= 1) {
    inputMode = 'choice';
    choices = [60, 80, 100, 120];
    bpm = pickRandom(choices);
  } else if (level <= 2) {
    inputMode = 'choice';
    const base = 60 + Math.floor(Math.random() * 7) * 10; // 60~120
    bpm = base;
    // 4지선다: 정답 + 인접 BPM 3개 (간격 10)
    const pool = [base - 20, base - 10, base, base + 10, base + 20].filter(
      (b) => b >= 40 && b <= 160
    );
    while (pool.length > 4) pool.pop();
    choices = shuffle(pool);
  } else {
    inputMode = 'slider';
    bpm = 50 + Math.floor(Math.random() * 121); // 50~170
  }

  return {
    id: genId(),
    mode: 'bpm',
    level,
    itemKey: `bpm_lv${level}`,
    data: { type: 'bpm', bpm, beats, inputMode, choices },
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
