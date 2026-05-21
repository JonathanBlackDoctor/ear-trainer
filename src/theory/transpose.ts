import { Note, transpose, Interval } from 'tonal';
import { COMMON_KEYS } from './progressions';

/** Transpose a note by semitones */
export function transposeNote(note: string, semitones: number): string {
  const interval = semitones >= 0
    ? Interval.fromSemitones(semitones)
    : Interval.fromSemitones(semitones);
  return transpose(note, interval ?? '') ?? note;
}

/** Get a different key (for transposition exercises) */
export function randomDifferentKey(currentKey: string): string {
  const others = COMMON_KEYS.filter((k) => k !== currentKey);
  return others[Math.floor(Math.random() * others.length)] ?? 'G';
}

/** Get nearby keys (adjacent in circle of 5ths) */
export function nearbyKeys(key: string): string[] {
  const circle = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
  const idx = circle.indexOf(key);
  if (idx === -1) return [key];
  const prev = circle[(idx - 1 + 12) % 12];
  const next = circle[(idx + 1) % 12];
  return [prev, next];
}

/** Semitone distance between two keys */
export function keySemitones(fromKey: string, toKey: string): number {
  const fromMidi = Note.midi(fromKey + '4') ?? 60;
  const toMidi = Note.midi(toKey + '4') ?? 60;
  return ((toMidi - fromMidi) % 12 + 12) % 12;
}
