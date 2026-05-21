import { Note, Scale, transpose } from 'tonal';

// Movable-do solfege syllables (major scale = 12 chromatic steps from tonic)
const MOVABLE_DO: Record<number, string> = {
  0:  '도',
  1:  '도#/레b',
  2:  '레',
  3:  '레#/미b',
  4:  '미',
  5:  '파',
  6:  '파#/솔b',
  7:  '솔',
  8:  '솔#/라b',
  9:  '라',
  10: '라#/시b',
  11: '시',
};

export const DIATONIC_SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'];
export const CHROMATIC_SOLFEGE = Object.values(MOVABLE_DO);

/** Get solfege syllable for a note given a tonic (movable-do) */
export function noteToSolfege(note: string, tonic: string): string {
  const noteMidi = Note.midi(note);
  const tonicMidi = Note.midi(tonic + '0'); // use octave 0 for relative calc
  if (noteMidi == null) return '?';

  // Tonic MIDI without octave
  const tonicPc = Note.pitchClass(tonic);
  const tonicMidi0 = Note.midi(tonicPc + '4') ?? 60;
  const noteMidi4 = Note.midi(Note.pitchClass(note) + '4') ?? 60;

  const semitones = ((noteMidi4 - tonicMidi0) % 12 + 12) % 12;
  return MOVABLE_DO[semitones] ?? '?';
}

/** Simple single-syllable solfege (without sharps/flats) */
export const SIMPLE_SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'];

// Map semitone offset to simple solfege
const SEMITONE_TO_SIMPLE: Record<number, string> = {
  0: '도', 2: '레', 4: '미', 5: '파', 7: '솔', 9: '라', 11: '시',
  // chromatic
  1: '도#', 3: '레#', 6: '파#', 8: '솔#', 10: '라#',
};

export function semitoneToSolfege(semitones: number): string {
  return SEMITONE_TO_SIMPLE[((semitones % 12) + 12) % 12] ?? '?';
}

/** Get the major scale notes of a tonic in octave 4 */
export function getMajorScale(tonic: string, octave = 4): string[] {
  const scale = Scale.get(`${tonic}${octave} major`);
  return scale.notes;
}

/** Convert semitone offset from tonic to diatonic degree label (for display) */
export function semitoneToDegreeName(semitones: number, notation: 'roman' | 'number'): string {
  const diatonic: Record<number, [string, string]> = {
    0:  ['I',  '1'],
    2:  ['II', '2'],
    4:  ['III','3'],
    5:  ['IV', '4'],
    7:  ['V',  '5'],
    9:  ['VI', '6'],
    11: ['VII','7'],
  };
  const entry = diatonic[((semitones % 12) + 12) % 12];
  if (!entry) return '?';
  return notation === 'roman' ? entry[0] : entry[1];
}
