import type { ModeKey } from '../types';
import { intervalItemKeys } from '../theory/intervals';
import { chordItemKeys } from '../theory/chords';
import { solfegeItemKeys } from '../theory/solfege';
import {
  SCALE_LEVELS, CADENCE_LEVELS, INVERSION_LEVELS, COMPARE_LEVELS,
  ODD_LEVELS, CONTOUR_LEVELS, FUNCTION_LEVELS, EXTENDED_LEVELS,
  bassDegreesForLevel, TENSION_LEVELS, DEGREE_FUNCTION,
  FUNCTION_TONIC, FUNCTION_SUBDOMINANT,
  WIDE_LEVELS, NOTE_STACK_LEVELS, MICROTUNING_LEVELS, HARMONICS_LEVELS,
  centsCode,
} from '../modes/labModes';

// ─── Per-mode itemKey formatters / reverse-maps ─────────────────────────────
// These mirror the exact itemKey strings the question factories stamp, so the
// weak-focus candidate pool (and weakFocusLevel) speaks the same vocabulary as
// recorded stats. Kept here as the single source so factory + weakness logic
// never drift apart.

export const scaleKey = (name: string) => `scale_${name.replace(/\s+/g, '-')}`;

/** Harmonic-function code (T/S/D) for a scale degree. */
export function funcCode(degree: number): 'T' | 'S' | 'D' {
  const f = DEGREE_FUNCTION[degree];
  return f === FUNCTION_TONIC ? 'T' : f === FUNCTION_SUBDOMINANT ? 'S' : 'D';
}

// ─── Lab-mode level pools ───────────────────────────────────────────────────

export function scaleItemKeys(level: number): string[] {
  return (SCALE_LEVELS[level] ?? SCALE_LEVELS[1]).map(scaleKey);
}

export function cadenceItemKeys(level: number): string[] {
  return (CADENCE_LEVELS[level] ?? CADENCE_LEVELS[1]).types.map((t) => `cadence_${t}`);
}

export function inversionItemKeys(level: number): string[] {
  return (INVERSION_LEVELS[level] ?? INVERSION_LEVELS[1]).inversions.map((n) => `inv_${n}`);
}

export function compareItemKeys(level: number): string[] {
  const cfg = COMPARE_LEVELS[level] ?? COMPARE_LEVELS[1];
  return cfg.allowSame
    ? ['cmp_first', 'cmp_second', 'cmp_same']
    : ['cmp_first', 'cmp_second'];
}

/** Valid altered-note positions for the odd-note mode (8-note scale: 0..7). */
export function oddNoteItemKeys(level: number): string[] {
  const cfg = ODD_LEVELS[level] ?? ODD_LEVELS[1];
  const n = 8; // 7 diatonic notes + upper tonic
  const lo = cfg.allowEnds ? 0 : 1;
  const hi = cfg.allowEnds ? n - 1 : n - 2;
  const keys: string[] = [];
  for (let i = lo; i <= hi; i++) keys.push(`odd_${i}`);
  return keys;
}

export function contourItemKeys(level: number): string[] {
  return (CONTOUR_LEVELS[level] ?? CONTOUR_LEVELS[1]).shapes.map((s) => `contour_${s}`);
}

export function tuningItemKeys(_level: number): string[] {
  return ['tune_intune', 'tune_sharp', 'tune_flat'];
}

export function functionItemKeys(level: number): string[] {
  const cfg = FUNCTION_LEVELS[level] ?? FUNCTION_LEVELS[1];
  return [...new Set(cfg.degrees.map((d) => `func_${funcCode(d)}`))];
}

export function extendedItemKeys(level: number): string[] {
  return (EXTENDED_LEVELS[level] ?? EXTENDED_LEVELS[1]).qualities.map((q) => `ext_${q}`);
}

export function bassItemKeys(level: number): string[] {
  return bassDegreesForLevel(level).map((d) => `bass_deg${d}`);
}

export function tensionItemKeys(level: number): string[] {
  return (TENSION_LEVELS[level] ?? TENSION_LEVELS[1]).tensions.map((t) => `tension_${t}`);
}

export function wideIntervalItemKeys(level: number): string[] {
  const cfg = WIDE_LEVELS[level] ?? WIDE_LEVELS[1];
  return cfg.names.flatMap((n) => cfg.directions.map((d) => `wide_${n}_${d}`));
}

/** Note-stack items are focused by note-count (2..4), e.g. "stack_n3". */
export function noteStackItemKeys(level: number): string[] {
  const cfg = NOTE_STACK_LEVELS[level] ?? NOTE_STACK_LEVELS[1];
  return cfg.noteCounts.map((n) => `stack_n${n}`);
}

export function microtuningItemKeys(level: number): string[] {
  return (MICROTUNING_LEVELS[level] ?? MICROTUNING_LEVELS[1]).cents.map((c) => `microtune_${centsCode(c)}`);
}

export function harmonicItemKeys(level: number): string[] {
  return (HARMONICS_LEVELS[level] ?? HARMONICS_LEVELS[1]).partials.map((p) => `harmonic_${p}`);
}

// ─── Registry: modes whose per-level item pool can be enumerated ────────────
// Used by the question factories (candidate list) and by weakFocusLevel (to
// pick a level that actually contains the user's weak items). Modes absent
// here either encode the level in the item key (handled in weakness.ts) or
// can't be focused at the item level.
const POOL_BY_MODE: Partial<Record<ModeKey, (level: number) => string[]>> = {
  interval: intervalItemKeys,
  chord: chordItemKeys,
  solfege: solfegeItemKeys,
  'lab-scale': scaleItemKeys,
  'lab-cadence': cadenceItemKeys,
  'lab-inversion': inversionItemKeys,
  'lab-interval-compare': compareItemKeys,
  'lab-odd-note': oddNoteItemKeys,
  'lab-contour': contourItemKeys,
  'lab-tuning': tuningItemKeys,
  'lab-function': functionItemKeys,
  'lab-extended': extendedItemKeys,
  'lab-bass': bassItemKeys,
  'lab-tension': tensionItemKeys,
  'lab-wide-interval': wideIntervalItemKeys,
  'lab-note-stack': noteStackItemKeys,
  'lab-microtuning': microtuningItemKeys,
  'lab-harmonics': harmonicItemKeys,
};

/** Enumerate the itemKeys a mode can produce at a level, or [] if not poolable. */
export function itemKeysForLevel(mode: ModeKey, level: number): string[] {
  return POOL_BY_MODE[mode]?.(level) ?? [];
}
