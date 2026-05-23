import { MAX_LEVEL } from './levels';
import type { ModeKey } from '../types';

export const PROGRESSION_MODE_INFO = {
  key: 'progression' as ModeKey,
  name: '코드 진행',
  emoji: '🎸',
  description: '코드 진행을 듣고 도수를 맞혀보세요',
  howTo: '조성(키)을 알려준 뒤 코드 진행이 들립니다. 각 코드의 도수(I, IV, V…)를 순서대로 입력하세요.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const MELODY_MODE_INFO = {
  key: 'melody' as ModeKey,
  name: '멜로디 받아적기',
  emoji: '🎶',
  description: '멜로디를 듣고 건반으로 입력하세요',
  howTo: '짧은 멜로디가 들립니다. 화면의 피아노 건반에서 들은 음을 순서대로 눌러 입력하세요.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const TRANSPOSE_MODE_INFO = {
  key: 'transpose' as ModeKey,
  name: '조옮김 연습',
  emoji: '🔄',
  description: '한 조에서 들은 멜로디를 다른 조로 옮겨서 연주하기',
  howTo: '먼저 원래 조성의 으뜸음과 짧은 멜로디가 들립니다. 이어서 옮길 조성의 으뜸음이 들립니다. 같은 멜로디 모양을 새 조성으로 옮겨 피아노 건반으로 입력하세요. (옥타브는 달라도 정답으로 인정됩니다.)',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const RHYTHM_MODE_INFO = {
  key: 'rhythm' as ModeKey,
  name: '리듬 받아치기',
  emoji: '🥁',
  description: '들은 리듬을 탭으로 따라쳐 보세요',
  howTo: '리듬 패턴이 먼저 들립니다. 이어서 화면의 탭 버튼을 눌러 같은 리듬으로 따라치세요.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const TEMPO_MODE_INFO = {
  key: 'tempo' as ModeKey,
  name: '템포 유지',
  emoji: '⏱️',
  description: '메트로놈을 듣고 같은 빠르기로 이어 치세요',
  howTo: '메트로놈이 몇 박 들린 뒤 멈춥니다. 같은 빠르기를 유지하며 탭 버튼으로 박을 이어 치세요.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const BPM_MODE_INFO = {
  key: 'bpm' as ModeKey,
  name: 'BPM 맞히기',
  emoji: '🎯',
  description: '들려주는 메트로놈의 빠르기(BPM)를 맞혀보세요',
  howTo: '메트로놈이 일정한 빠르기로 들립니다. 슬라이더로 들은 빠르기(BPM)를 추정해 맞혀보세요.',
  maxLevel: MAX_LEVEL,
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
