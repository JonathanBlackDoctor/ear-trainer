import type { ModeKey } from '../types';
import { INTERVAL_LEVELS, type IntervalDirection } from '../theory/intervals';
import { CHORD_LEVELS } from '../theory/chords';
import { SOLFEGE_LEVELS } from '../theory/solfege';
import { PROGRESSION_LEVELS, COMMON_KEYS } from '../theory/progressions';

/** Single source of truth for the per-mode level count. */
export const MAX_LEVEL = 10;

// ─── Melody ────────────────────────────────────────────────────────────────────
export interface MelodyLevelConfig {
  label: string;
  noteCount: number;
  maxJump: number;          // max scale-degree distance between consecutive notes
  keyMode: 'fixed' | 'random';
  scaleOctaves: 1 | 2;      // 1 = one octave (7 notes); 2 = two octaves (14 notes)
}

export const MELODY_LEVELS: Record<number, MelodyLevelConfig> = {
  1:  { label: '3음 · 인접만',     noteCount: 3, maxJump: 1, keyMode: 'fixed',  scaleOctaves: 1 },
  2:  { label: '4음 · 인접만',     noteCount: 4, maxJump: 1, keyMode: 'fixed',  scaleOctaves: 1 },
  3:  { label: '4음 · 도약 2',     noteCount: 4, maxJump: 2, keyMode: 'fixed',  scaleOctaves: 1 },
  4:  { label: '5음 · 도약 2',     noteCount: 5, maxJump: 2, keyMode: 'fixed',  scaleOctaves: 1 },
  5:  { label: '6음 · 도약 2',     noteCount: 6, maxJump: 2, keyMode: 'fixed',  scaleOctaves: 1 },
  6:  { label: '6음 · 도약 3',     noteCount: 6, maxJump: 3, keyMode: 'fixed',  scaleOctaves: 1 },
  7:  { label: '7음 · 도약 3',     noteCount: 7, maxJump: 3, keyMode: 'fixed',  scaleOctaves: 1 },
  8:  { label: '8음 · 도약 3',     noteCount: 8, maxJump: 3, keyMode: 'fixed',  scaleOctaves: 1 },
  9:  { label: '+ 2옥타브 음역',   noteCount: 8, maxJump: 4, keyMode: 'fixed',  scaleOctaves: 2 },
  10: { label: '+ 랜덤 키',        noteCount: 8, maxJump: 4, keyMode: 'random', scaleOctaves: 2 },
};

// ─── Transpose ────────────────────────────────────────────────────────────────
export interface TransposeLevelConfig {
  label: string;
  intervals: string[];
  directions: IntervalDirection[];
  keyPool: string[];        // length 1 = fixed; longer = random per question
}

const TR_CORE_4    = ['P5', 'P4', 'M3', 'm3'];
const TR_CORE_5    = [...TR_CORE_4, 'P8'];
const TR_PLUS_2    = [...TR_CORE_5, 'M2', 'm2'];
const TR_PLUS_6    = [...TR_PLUS_2, 'M6', 'm6'];
const TR_PLUS_A4   = [...TR_PLUS_6, 'A4'];
const TR_ALL_12    = [...TR_PLUS_A4, 'M7', 'm7'];

const KEYS_SMALL  = ['C', 'G', 'F'];
const KEYS_MID    = ['C', 'G', 'D', 'F', 'Bb'];
const KEYS_LARGE  = ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb'];
const KEYS_FULL12 = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

export const TRANSPOSE_LEVELS: Record<number, TransposeLevelConfig> = {
  1:  { label: '기본 4음정 · C장조',           intervals: TR_CORE_4,  directions: ['up', 'harmonic'],         keyPool: ['C']        },
  2:  { label: '+ P8',                          intervals: TR_CORE_5,  directions: ['up', 'harmonic'],         keyPool: ['C']        },
  3:  { label: '+ 하행',                        intervals: TR_CORE_5,  directions: ['up', 'down', 'harmonic'], keyPool: ['C']        },
  4:  { label: '+ 키 3개 (C·G·F)',              intervals: TR_CORE_5,  directions: ['up', 'down', 'harmonic'], keyPool: KEYS_SMALL   },
  5:  { label: '+ 2도 추가',                    intervals: TR_PLUS_2,  directions: ['up', 'down', 'harmonic'], keyPool: KEYS_SMALL   },
  6:  { label: '+ 6도 + 키 5개',                intervals: TR_PLUS_6,  directions: ['up', 'down', 'harmonic'], keyPool: KEYS_MID     },
  7:  { label: '+ 트라이톤 + 키 7개',           intervals: TR_PLUS_A4, directions: ['up', 'down', 'harmonic'], keyPool: KEYS_LARGE   },
  8:  { label: '+ 7도 (전음정) · 8개 키',       intervals: TR_ALL_12,  directions: ['up', 'down', 'harmonic'], keyPool: COMMON_KEYS  },
  9:  { label: '+ 12개 키 전체',                intervals: TR_ALL_12,  directions: ['up', 'down', 'harmonic'], keyPool: KEYS_FULL12  },
  10: { label: '+ 화성만 (전 12키)',            intervals: TR_ALL_12,  directions: ['harmonic'],               keyPool: KEYS_FULL12  },
};

// ─── Rhythm ────────────────────────────────────────────────────────────────────
export interface RhythmPattern {
  beats: number[];          // 16th-note positions
  duration: number;         // total 16ths
}

export interface RhythmLevelConfig {
  label: string;
  patterns: RhythmPattern[];
  bpm: number;
}

export const RHYTHM_LEVELS: Record<number, RhythmLevelConfig> = {
  1:  { label: '기본 4분음표',       bpm: 70,  patterns: [
        { beats: [0, 4, 8, 12], duration: 16 },
        { beats: [0, 8],         duration: 16 },
      ] },
  2:  { label: '+ 3분할 패턴',       bpm: 80,  patterns: [
        { beats: [0, 4, 8],      duration: 12 },
        { beats: [0, 4, 12],     duration: 16 },
      ] },
  3:  { label: '+ 빠른 템포',        bpm: 90,  patterns: [
        { beats: [0, 4, 8, 12],  duration: 16 },
        { beats: [0, 4, 8],      duration: 12 },
        { beats: [0, 4, 12],     duration: 16 },
      ] },
  4:  { label: '+ 약한 싱코페이션',  bpm: 90,  patterns: [
        { beats: [0, 2, 4, 8, 10, 12], duration: 16 },
        { beats: [0, 4, 6, 8, 12],     duration: 16 },
        { beats: [0, 2, 8, 10],        duration: 16 },
      ] },
  5:  { label: '+ 붙임줄/점음표',     bpm: 95,  patterns: [
        { beats: [0, 4, 6, 10, 12],    duration: 16 },
        { beats: [0, 2, 6, 8, 14],     duration: 16 },
        { beats: [0, 4, 10, 12],       duration: 16 },
      ] },
  6:  { label: '+ 16분음표 시작',     bpm: 100, patterns: [
        { beats: [0, 1, 4, 6, 8, 9, 12, 14], duration: 16 },
        { beats: [0, 3, 4, 8, 11, 12],       duration: 16 },
      ] },
  7:  { label: '+ 셋잇단 느낌',       bpm: 100, patterns: [
        { beats: [0, 2, 5, 8, 10, 13],       duration: 16 },
      ] },
  8:  { label: '+ 강한 싱코페이션',   bpm: 105, patterns: [
        { beats: [0, 3, 6, 8, 11, 14],          duration: 16 },
        { beats: [0, 1, 2, 8, 10, 12, 13, 14],  duration: 16 },
      ] },
  9:  { label: '+ 16분 묶음',         bpm: 110, patterns: [
        { beats: [0, 3, 5, 8, 10, 11, 13, 15],      duration: 16 },
        { beats: [0, 1, 3, 5, 8, 9, 11, 13, 14],    duration: 16 },
      ] },
  10: { label: '+ 16분 최대 밀도',    bpm: 115, patterns: [
        { beats: [0, 2, 3, 6, 8, 11, 13, 14],      duration: 16 },
        { beats: [0, 1, 4, 5, 7, 8, 11, 12, 15],   duration: 16 },
      ] },
};

// ─── Tempo Hold ────────────────────────────────────────────────────────────────
export interface TempoLevelConfig {
  label: string;
  bpmRange: [number, number];   // identical low/high = fixed BPM
  countInBeats: number;
  holdBeats: number;
}

export const TEMPO_LEVELS: Record<number, TempoLevelConfig> = {
  1:  { label: '80 BPM · 4박 유지',          bpmRange: [80, 80],   countInBeats: 4, holdBeats: 4  },
  2:  { label: '90 BPM',                       bpmRange: [90, 90],   countInBeats: 4, holdBeats: 4  },
  3:  { label: '100 BPM',                      bpmRange: [100, 100], countInBeats: 4, holdBeats: 4  },
  4:  { label: '60~100 BPM 랜덤',              bpmRange: [60, 100],  countInBeats: 4, holdBeats: 4  },
  5:  { label: '60~120 BPM',                   bpmRange: [60, 120],  countInBeats: 4, holdBeats: 4  },
  6:  { label: '+ 6박 유지',                    bpmRange: [60, 120],  countInBeats: 4, holdBeats: 6  },
  7:  { label: '+ 8박 유지',                    bpmRange: [60, 120],  countInBeats: 4, holdBeats: 8  },
  8:  { label: '60~140 · 카운트인 2박',         bpmRange: [60, 140],  countInBeats: 2, holdBeats: 8  },
  9:  { label: '50~160 BPM',                   bpmRange: [50, 160],  countInBeats: 2, holdBeats: 8  },
  10: { label: '40~180 · 12박 유지',           bpmRange: [40, 180],  countInBeats: 2, holdBeats: 12 },
};

// ─── BPM Guess ─────────────────────────────────────────────────────────────────
export interface BpmLevelConfig {
  label: string;
  inputMode: 'choice' | 'slider';
  bpmRange: [number, number];
  bpmStep: number;             // grid resolution for the answer
  choiceSpacing?: number;      // gap between adjacent choices (only when inputMode === 'choice')
}

export const BPM_LEVELS: Record<number, BpmLevelConfig> = {
  1:  { label: '4지선다 (60·80·100·120)', inputMode: 'choice', bpmRange: [60, 120],  bpmStep: 20, choiceSpacing: 20 },
  2:  { label: '4지선다 · 간격 20',         inputMode: 'choice', bpmRange: [60, 120],  bpmStep: 10, choiceSpacing: 20 },
  3:  { label: '4지선다 · 간격 10',         inputMode: 'choice', bpmRange: [60, 120],  bpmStep: 10, choiceSpacing: 10 },
  4:  { label: '50~140 · 간격 10',          inputMode: 'choice', bpmRange: [50, 140],  bpmStep: 5,  choiceSpacing: 10 },
  5:  { label: '50~140 · 간격 5',           inputMode: 'choice', bpmRange: [50, 140],  bpmStep: 5,  choiceSpacing: 5  },
  6:  { label: '50~160 · 간격 5',           inputMode: 'choice', bpmRange: [50, 160],  bpmStep: 2,  choiceSpacing: 5  },
  7:  { label: '슬라이더 · 50~170',          inputMode: 'slider', bpmRange: [50, 170],  bpmStep: 1 },
  8:  { label: '슬라이더 · 40~180',          inputMode: 'slider', bpmRange: [40, 180],  bpmStep: 1 },
  9:  { label: '슬라이더 · 30~200',          inputMode: 'slider', bpmRange: [30, 200],  bpmStep: 1 },
  10: { label: '슬라이더 · 30~220',          inputMode: 'slider', bpmRange: [30, 220],  bpmStep: 1 },
};

// ─── Aggregate helpers ─────────────────────────────────────────────────────────
export function getLevelLabel(modeKey: ModeKey, level: number): string {
  switch (modeKey) {
    case 'interval':    return INTERVAL_LEVELS[level]?.label    ?? '';
    case 'chord':       return CHORD_LEVELS[level]?.label       ?? '';
    case 'solfege':     return SOLFEGE_LEVELS[level]?.label     ?? '';
    case 'progression': return PROGRESSION_LEVELS[level]?.label ?? '';
    case 'melody':      return MELODY_LEVELS[level]?.label      ?? '';
    case 'transpose':   return TRANSPOSE_LEVELS[level]?.label   ?? '';
    case 'rhythm':      return RHYTHM_LEVELS[level]?.label      ?? '';
    case 'tempo':       return TEMPO_LEVELS[level]?.label       ?? '';
    case 'bpm':         return BPM_LEVELS[level]?.label         ?? '';
    default:            return '';
  }
}
