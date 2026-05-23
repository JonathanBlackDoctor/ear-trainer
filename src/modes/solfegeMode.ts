import type { ChoiceOption } from '../components/ChoiceGrid';
import { SOLFEGE_LEVELS, solfegeToSemitone } from '../theory/solfege';
import { MAX_LEVEL } from './levels';
import type { ModeKey } from '../types';

export const SOLFEGE_MODE_INFO = {
  key: 'solfege' as ModeKey,
  name: '계명 (이동도)',
  emoji: '🎼',
  description: '기준음을 듣고 계명을 맞혀보세요',
  howTo: '기준음(도)이 먼저 들리고 이어서 문제 음이 재생됩니다. 들은 음의 계명(도·레·미…)을 아래 버튼에서 선택하세요.',
  theory: '이동도법(이동 도)은 조성의 으뜸음을 언제나 "도"로 삼아, 음을 절대 음높이가 아닌 음계 안의 상대적 위치로 듣는 방법입니다. 같은 멜로디라면 어느 조에서 연주해도 계명이 같아, 음들 사이의 관계와 긴장·해결의 흐름을 익히기에 좋습니다. 절대음감 모드를 켜면 기준음 없이 음이름(C·D·E…) 자체를 맞히는 절대음 훈련으로 바뀝니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export function getSolfegeChoices(level: number): ChoiceOption[] {
  const cfg = SOLFEGE_LEVELS[level] ?? SOLFEGE_LEVELS[1];
  return [...cfg.candidates]
    .sort((a, b) => solfegeToSemitone(a) - solfegeToSemitone(b))
    .map((s) => ({
      value: s,
      label: s,
    }));
}

// Absolute-pitch mode: identify by note name (C/D/E…) without a reference tone.
const NOTE_NAMES_DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTE_NAMES_CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getNoteNameChoices(level: number): ChoiceOption[] {
  const names = level <= 1 ? NOTE_NAMES_DIATONIC : NOTE_NAMES_CHROMATIC;
  return names.map((n) => ({ value: n, label: n }));
}
