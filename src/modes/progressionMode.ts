import type { ModeKey } from '../types';

export const PROGRESSION_MODE_INFO = {
  key: 'progression' as ModeKey,
  name: '코드 진행',
  emoji: '🎸',
  description: '코드 진행을 듣고 도수를 맞혀보세요',
  maxLevel: 4,
  defaultLevel: 1,
};

export const MELODY_MODE_INFO = {
  key: 'melody' as ModeKey,
  name: '멜로디 받아적기',
  emoji: '🎶',
  description: '멜로디를 듣고 건반으로 입력하세요',
  maxLevel: 3,
  defaultLevel: 1,
};

export const TRANSPOSE_MODE_INFO = {
  key: 'transpose' as ModeKey,
  name: '조옮김 연습',
  emoji: '🔄',
  description: '다른 조로 들어도 같은 도수/계명을 인식하세요',
  maxLevel: 2,
  defaultLevel: 1,
};

export const RHYTHM_MODE_INFO = {
  key: 'rhythm' as ModeKey,
  name: '리듬 받아치기',
  emoji: '🥁',
  description: '들은 리듬을 탭으로 따라쳐 보세요',
  maxLevel: 3,
  defaultLevel: 1,
};

// Degree choice options for progression input
export function getDegreeChoices(notation: 'roman' | 'number') {
  const entries = [
    { degree: 1, roman: 'I',    num: '1', quality: 'M' },
    { degree: 2, roman: 'ii',   num: '2m', quality: 'm' },
    { degree: 3, roman: 'iii',  num: '3m', quality: 'm' },
    { degree: 4, roman: 'IV',   num: '4', quality: 'M' },
    { degree: 5, roman: 'V',    num: '5', quality: '7' },
    { degree: 6, roman: 'vi',   num: '6m', quality: 'm' },
    { degree: 7, roman: 'vii°', num: '7°', quality: 'dim' },
  ];
  return entries.map((e) => ({
    value: `${e.degree}_${e.quality}`,
    label: notation === 'roman' ? e.roman : e.num,
    degree: e.degree,
    quality: e.quality,
  }));
}
