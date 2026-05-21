import type { ChoiceOption } from '../components/ChoiceGrid';
import { CHORD_LEVELS, chordLabel } from '../theory/chords';
import type { ModeKey } from '../types';

export const CHORD_MODE_INFO = {
  key: 'chord' as ModeKey,
  name: '코드 듣기',
  emoji: '🎹',
  description: '코드의 종류를 맞혀보세요',
  maxLevel: 4,
  defaultLevel: 1,
};

export function getChordChoices(level: number): ChoiceOption[] {
  const qualities = CHORD_LEVELS[level] ?? CHORD_LEVELS[1];
  // Deduplicate (level 4 has same qualities as level 3)
  const unique = [...new Set(qualities)];
  return unique.map((q) => ({
    value: q,
    label: q === 'major' ? '장화음' : q === 'minor' ? '단화음'
         : q === 'dim' ? '감화음' : q === 'aug' ? '증화음'
         : q === 'sus4' ? 'Sus4' : q === 'major7' ? 'Major7'
         : q === 'dominant7' ? 'Dom7' : q === 'minor7' ? 'Minor7'
         : q === 'm7b5' ? '반감(ø7)' : q,
    sublabel: chordLabel(q).split('(')[1]?.replace(')', '') ?? '',
  }));
}
