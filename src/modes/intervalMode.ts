import type { ChoiceOption } from '../components/ChoiceGrid';
import { INTERVAL_LEVELS, intervalLabel } from '../theory/intervals';
import type { ModeKey } from '../types';

export const INTERVAL_MODE_KEY: ModeKey = 'interval';

export const INTERVAL_MODE_INFO = {
  key: 'interval' as ModeKey,
  name: '음정 듣기',
  emoji: '🎵',
  description: '두 음 사이의 간격을 맞혀보세요',
  howTo: '두 음이 차례로 들립니다. 두 음 사이의 음정(장2도, 완전5도 등)을 아래 버튼에서 선택하세요.',
  maxLevel: 3,
  defaultLevel: 1,
};

export function getIntervalChoices(level: number): ChoiceOption[] {
  const intervals = INTERVAL_LEVELS[level] ?? INTERVAL_LEVELS[1];
  return intervals.map((name) => ({
    value: name,
    label: name,
    sublabel: intervalLabel(name),
  }));
}
