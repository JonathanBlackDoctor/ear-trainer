import type { ModeKey, MixEffect } from '../types';
import { INTERVAL_LEVELS } from '../theory/intervals';
import { CHORD_LEVELS } from '../theory/chords';
import { SOLFEGE_LEVELS } from '../theory/solfege';
import { PROGRESSION_LEVELS } from '../theory/progressions';
import { getLabLevelLabel } from './labModes';
import { getMixLevelLabel } from './mixModes';

/** Single source of truth for the per-mode level count. */
export const MAX_LEVEL = 10;

// ─── Melody ────────────────────────────────────────────────────────────────────
export interface MelodyLevelConfig {
  label: string;
  noteCount: number;
  maxJump: number;          // max scale-degree distance between consecutive notes
  keyMode: 'fixed' | 'random';
  scaleOctaves: 1 | 2 | 3;  // 1 = one octave (7 notes); 2 = 14 notes; 3 = 21 notes
}

export const MELODY_LEVELS: Record<number, MelodyLevelConfig> = {
  1:  { label: '3음 · 인접만',     noteCount: 3,  maxJump: 1, keyMode: 'fixed',  scaleOctaves: 1 },
  2:  { label: '4음 · 인접만',     noteCount: 4,  maxJump: 1, keyMode: 'fixed',  scaleOctaves: 1 },
  3:  { label: '4음 · 도약 2',     noteCount: 4,  maxJump: 2, keyMode: 'fixed',  scaleOctaves: 1 },
  4:  { label: '5음 · 도약 2',     noteCount: 5,  maxJump: 2, keyMode: 'fixed',  scaleOctaves: 1 },
  5:  { label: '6음 · 도약 2',     noteCount: 6,  maxJump: 2, keyMode: 'fixed',  scaleOctaves: 1 },
  6:  { label: '6음 · 도약 3',     noteCount: 6,  maxJump: 3, keyMode: 'fixed',  scaleOctaves: 1 },
  7:  { label: '7음 · 도약 3 · 2옥타브', noteCount: 7,  maxJump: 3, keyMode: 'fixed',  scaleOctaves: 2 },
  8:  { label: '8음 · 도약 4',     noteCount: 8,  maxJump: 4, keyMode: 'fixed',  scaleOctaves: 2 },
  9:  { label: '9음 · 도약 5',     noteCount: 9,  maxJump: 5, keyMode: 'fixed',  scaleOctaves: 2 },
  10: { label: '+ 3옥타브 · 랜덤 키', noteCount: 10, maxJump: 6, keyMode: 'random', scaleOctaves: 3 },
};

// ─── Transpose ────────────────────────────────────────────────────────────────
// A "transposition" question plays a short melody in one key (fromKey), then
// asks the user to *transpose* it into a different key (toKey): they hear the
// new key's tonic and re-enter the same melodic shape on the piano, shifted to
// that key. This is the actual move-the-do skill — distinct from melody
// dictation (reproduce the same notes) because the answer notes differ from
// what was played. Every level uses ≥2 keys so a real key change always
// happens.
export interface TransposeLevelConfig {
  label: string;
  noteCount: number;        // melody length (2..5)
  degreePool: number[];     // allowed scale degrees (1..7)
  maxJump: number;          // max scale-degree distance between adjacent notes
  keyPool: string[];        // fromKey and toKey are drawn (distinct) from here
}

const DEG_TRIAD      = [1, 3, 5];
const DEG_PENTA      = [1, 2, 3, 5, 6];
const DEG_DIA_5      = [1, 2, 3, 4, 5];
const DEG_DIA_7      = [1, 2, 3, 4, 5, 6, 7];

const KEYS_SMALL   = ['C', 'G', 'F'];
const KEYS_MID     = ['C', 'G', 'D', 'F', 'Bb'];
const KEYS_LARGE   = ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb', 'E'];
const KEYS_FULL12  = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

export const TRANSPOSE_LEVELS: Record<number, TransposeLevelConfig> = {
  1:  { label: '2음 · 도·미·솔 · 키 3개',       noteCount: 2, degreePool: DEG_TRIAD, maxJump: 4, keyPool: KEYS_SMALL  },
  2:  { label: '3음 · 도·미·솔 · 키 3개',       noteCount: 3, degreePool: DEG_TRIAD, maxJump: 4, keyPool: KEYS_SMALL  },
  3:  { label: '3음 · 펜타토닉 (1·2·3·5·6)',    noteCount: 3, degreePool: DEG_PENTA, maxJump: 4, keyPool: KEYS_SMALL  },
  4:  { label: '3음 · 다이아토닉 5음 (1~5)',    noteCount: 3, degreePool: DEG_DIA_5, maxJump: 3, keyPool: KEYS_MID    },
  5:  { label: '4음 · 다이아토닉 5음',          noteCount: 4, degreePool: DEG_DIA_5, maxJump: 3, keyPool: KEYS_MID    },
  6:  { label: '3음 · 전 7도 · 키 5개',         noteCount: 3, degreePool: DEG_DIA_7, maxJump: 3, keyPool: KEYS_MID    },
  7:  { label: '4음 · 전 7도 · 키 5개',         noteCount: 4, degreePool: DEG_DIA_7, maxJump: 3, keyPool: KEYS_MID    },
  8:  { label: '4음 · 전 7도 · 키 8개',         noteCount: 4, degreePool: DEG_DIA_7, maxJump: 3, keyPool: KEYS_LARGE  },
  9:  { label: '5음 · 도약 4 · 키 8개',         noteCount: 5, degreePool: DEG_DIA_7, maxJump: 4, keyPool: KEYS_LARGE  },
  10: { label: '6음 · 도약 5 · 12개 키 전체',   noteCount: 6, degreePool: DEG_DIA_7, maxJump: 5, keyPool: KEYS_FULL12 },
};

// ─── Rhythm ────────────────────────────────────────────────────────────────────
export interface RhythmPattern {
  beats: number[];          // 16th-note positions
  duration: number;         // total 16ths
}

// Rhythm questions are generated procedurally from per-level constraints rather
// than drawn from a small fixed pool, so the same pattern doesn't keep repeating
// within a level. `positions` is the set of allowed onset slots (16th-note grid,
// always includes the downbeat 0); `onsets` is the [min, max] number of taps
// (including the downbeat).
export interface RhythmLevelConfig {
  label: string;
  bpm: number;
  length: number;           // total length in 16ths (16 = 1 bar, 32 = 2 bars)
  positions: number[];      // allowed onset positions (must include 0)
  onsets: [number, number]; // [min, max] number of onsets, downbeat included
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const QUARTERS = [0, 4, 8, 12];
const EIGHTHS = [0, 2, 4, 6, 8, 10, 12, 14];
const SIXTEENTHS = range(16);
const SIXTEENTHS_2BAR = range(32);
// Lopsided grid that avoids landing squarely on every quarter — gives a
// triplet/swung feel on the 16th-note grid.
const TRIPLET_FEEL = [0, 2, 3, 5, 6, 8, 10, 11, 13, 14];

export const RHYTHM_LEVELS: Record<number, RhythmLevelConfig> = {
  1:  { label: '기본 4분음표',           bpm: 70,  length: 16, positions: QUARTERS,        onsets: [2, 4] },
  2:  { label: '+ 3분할 패턴',           bpm: 80,  length: 16, positions: QUARTERS,        onsets: [3, 3] },
  3:  { label: '+ 빠른 템포',            bpm: 90,  length: 16, positions: QUARTERS,        onsets: [3, 4] },
  4:  { label: '+ 약한 싱코페이션',      bpm: 90,  length: 16, positions: [0, 2, 4, 8, 10, 12], onsets: [4, 6] },
  5:  { label: '+ 붙임줄/점음표',         bpm: 95,  length: 16, positions: EIGHTHS,         onsets: [4, 6] },
  6:  { label: '+ 16분음표 시작',         bpm: 105, length: 16, positions: SIXTEENTHS,      onsets: [6, 8] },
  7:  { label: '+ 셋잇단 느낌',           bpm: 110, length: 16, positions: TRIPLET_FEEL,     onsets: [6, 6] },
  8:  { label: '+ 강한 싱코페이션',       bpm: 120, length: 16, positions: SIXTEENTHS,      onsets: [7, 9] },
  9:  { label: '+ 16분 묶음',             bpm: 135, length: 16, positions: SIXTEENTHS,      onsets: [8, 10] },
  10: { label: '+ 2마디 · 16분 최대 밀도', bpm: 150, length: 32, positions: SIXTEENTHS_2BAR, onsets: [10, 16] },
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
  8:  { label: '50~150 · 카운트인 2박',         bpmRange: [50, 150],  countInBeats: 2, holdBeats: 8  },
  9:  { label: '40~170 · 10박 유지',           bpmRange: [40, 170],  countInBeats: 2, holdBeats: 10 },
  10: { label: '30~200 · 카운트인 1박 · 16박 유지', bpmRange: [30, 200], countInBeats: 1, holdBeats: 16 },
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
  6:  { label: '50~160 · 간격 4',           inputMode: 'choice', bpmRange: [50, 160],  bpmStep: 2,  choiceSpacing: 4  },
  7:  { label: '슬라이더 · 50~170',          inputMode: 'slider', bpmRange: [50, 170],  bpmStep: 1 },
  8:  { label: '슬라이더 · 30~200',          inputMode: 'slider', bpmRange: [30, 200],  bpmStep: 1 },
  9:  { label: '슬라이더 · 20~220',          inputMode: 'slider', bpmRange: [20, 220],  bpmStep: 1 },
  10: { label: '슬라이더 · 20~240',          inputMode: 'slider', bpmRange: [20, 240],  bpmStep: 1 },
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
    default:
      if (modeKey.startsWith('mix-')) {
        return getMixLevelLabel(modeKey.replace(/^mix-/, '') as MixEffect, level);
      }
      return getLabLevelLabel(modeKey, level);
  }
}
