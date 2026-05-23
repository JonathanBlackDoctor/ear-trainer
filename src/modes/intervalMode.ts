import type { ChoiceOption } from '../components/ChoiceGrid';
import { INTERVAL_LEVELS, intervalLabel } from '../theory/intervals';
import { MAX_LEVEL } from './levels';
import type { ModeKey } from '../types';

export const INTERVAL_MODE_KEY: ModeKey = 'interval';

export const INTERVAL_MODE_INFO = {
  key: 'interval' as ModeKey,
  name: '음정 듣기',
  emoji: '🎵',
  description: '두 음 사이의 간격을 맞혀보세요',
  howTo: '두 음이 차례로 들립니다. 두 음 사이의 음정(장2도, 완전5도 등)을 아래 버튼에서 선택하세요.',
  theory: '음정은 두 음 사이의 높이 차이로, 반음의 개수로 정해집니다. 음정의 폭(2도·3도…)에 음질(완전·장·단·증·감)을 붙여 부르며, 같은 폭이라도 장3도(4반음)와 단3도(3반음)처럼 반음 수에 따라 느낌이 달라집니다. 음정은 멜로디와 화음을 이루는 가장 기본 단위입니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export function getIntervalChoices(level: number): ChoiceOption[] {
  const cfg = INTERVAL_LEVELS[level] ?? INTERVAL_LEVELS[1];
  return cfg.intervals.map((name) => ({
    value: name,
    label: name,
    sublabel: intervalLabel(name),
  }));
}
