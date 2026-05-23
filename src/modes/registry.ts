import type { ModeKey } from '../types';
import { INTERVAL_MODE_INFO } from './intervalMode';
import { CHORD_MODE_INFO } from './chordMode';
import { SOLFEGE_MODE_INFO } from './solfegeMode';
import {
  PROGRESSION_MODE_INFO, MELODY_MODE_INFO, TRANSPOSE_MODE_INFO,
  RHYTHM_MODE_INFO, TEMPO_MODE_INFO, BPM_MODE_INFO,
} from './progressionMode';
import {
  LAB_SCALE_MODE_INFO, LAB_CADENCE_MODE_INFO, LAB_INVERSION_MODE_INFO,
  LAB_INTERVAL_COMPARE_MODE_INFO, LAB_ODD_NOTE_MODE_INFO, LAB_CONTOUR_MODE_INFO,
  LAB_TUNING_MODE_INFO, LAB_FUNCTION_MODE_INFO, LAB_EXTENDED_MODE_INFO,
  LAB_BASS_MODE_INFO, LAB_TENSION_MODE_INFO,
} from './labModes';

export interface ModeInfo {
  key: ModeKey;
  name: string;
  emoji: string;
  description: string;
  howTo?: string;
  maxLevel: number;
  defaultLevel: number;
}

// Single source of truth for every trainable mode. Order here is the default
// presentation order on Home; users can override it via settings.modeOrder.
const MODE_LIST: ModeInfo[] = [
  SOLFEGE_MODE_INFO,
  INTERVAL_MODE_INFO,
  CHORD_MODE_INFO,
  PROGRESSION_MODE_INFO,
  MELODY_MODE_INFO,
  TRANSPOSE_MODE_INFO,
  RHYTHM_MODE_INFO,
  TEMPO_MODE_INFO,
  BPM_MODE_INFO,
  LAB_SCALE_MODE_INFO,
  LAB_CADENCE_MODE_INFO,
  LAB_INVERSION_MODE_INFO,
  LAB_INTERVAL_COMPARE_MODE_INFO,
  LAB_ODD_NOTE_MODE_INFO,
  LAB_CONTOUR_MODE_INFO,
  LAB_TUNING_MODE_INFO,
  LAB_FUNCTION_MODE_INFO,
  LAB_EXTENDED_MODE_INFO,
  LAB_BASS_MODE_INFO,
  LAB_TENSION_MODE_INFO,
];

export const MODE_REGISTRY: Record<ModeKey, ModeInfo> = Object.fromEntries(
  MODE_LIST.map((m) => [m.key, m]),
) as Record<ModeKey, ModeInfo>;

export const DEFAULT_MODE_ORDER: ModeKey[] = MODE_LIST.map((m) => m.key);

// Color accent (mode-card ::before) per mode. Lab modes reuse the closest
// existing palette so they blend with the original cards.
export const MODE_ACCENT_CLASS: Record<ModeKey, string> = {
  solfege: 'accent-solfege',
  interval: 'accent-interval',
  chord: 'accent-chord',
  progression: 'accent-progression',
  melody: 'accent-melody',
  transpose: 'accent-transpose',
  rhythm: 'accent-rhythm',
  tempo: 'accent-tempo',
  bpm: 'accent-bpm',
  'lab-scale': 'accent-solfege',
  'lab-cadence': 'accent-progression',
  'lab-inversion': 'accent-chord',
  'lab-interval-compare': 'accent-interval',
  'lab-odd-note': 'accent-melody',
  'lab-contour': 'accent-melody',
  'lab-tuning': 'accent-solfege',
  'lab-function': 'accent-progression',
  'lab-extended': 'accent-chord',
  'lab-bass': 'accent-chord',
  'lab-tension': 'accent-chord',
};

/**
 * Reconcile a (possibly stale) saved order against the current registry:
 * drop unknown/removed keys, then append any modes the saved list is missing
 * in their default position. Always returns the full set of current modes.
 */
export function resolveModeOrder(saved?: ModeKey[]): ModeKey[] {
  const valid = (saved ?? []).filter((k) => k in MODE_REGISTRY);
  const seen = new Set(valid);
  const missing = DEFAULT_MODE_ORDER.filter((k) => !seen.has(k));
  return [...valid, ...missing];
}
