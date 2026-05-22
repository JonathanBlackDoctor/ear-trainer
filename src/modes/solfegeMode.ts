import type { ChoiceOption } from '../components/ChoiceGrid';
import type { ModeKey } from '../types';

export const SOLFEGE_MODE_INFO = {
  key: 'solfege' as ModeKey,
  name: '계명 (이동도)',
  emoji: '🎼',
  description: '기준음을 듣고 계명을 맞혀보세요',
  howTo: '기준음(도)이 먼저 들리고 이어서 문제 음이 재생됩니다. 들은 음의 계명(도·레·미…)을 아래 버튼에서 선택하세요.',
  maxLevel: 3,
  defaultLevel: 1,
};

// Level 1: 7 diatonic, Level 2+: chromatic
const DIATONIC = ['도', '레', '미', '파', '솔', '라', '시'];
const CHROMATIC = ['도', '도#', '레', '레#', '미', '파', '파#', '솔', '솔#', '라', '라#', '시'];

export function getSolfegeChoices(level: number): ChoiceOption[] {
  const syllables = level <= 1 ? DIATONIC : CHROMATIC;
  return syllables.map((s) => ({
    value: s,
    label: s,
  }));
}
