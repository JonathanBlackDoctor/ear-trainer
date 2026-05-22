import type { ChoiceOption } from '../components/ChoiceGrid';
import { SOLFEGE_LEVELS } from '../theory/solfege';
import { MAX_LEVEL } from './levels';
import type { ModeKey } from '../types';

export const SOLFEGE_MODE_INFO = {
  key: 'solfege' as ModeKey,
  name: '계명 (이동도)',
  emoji: '🎼',
  description: '기준음을 듣고 계명을 맞혀보세요',
  howTo: '기준음(도)이 먼저 들리고 이어서 문제 음이 재생됩니다. 들은 음의 계명(도·레·미…)을 아래 버튼에서 선택하세요.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export function getSolfegeChoices(level: number): ChoiceOption[] {
  const cfg = SOLFEGE_LEVELS[level] ?? SOLFEGE_LEVELS[1];
  return cfg.candidates.map((s) => ({
    value: s,
    label: s,
  }));
}
