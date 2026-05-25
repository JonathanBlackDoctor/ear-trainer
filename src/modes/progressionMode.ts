import { MAX_LEVEL } from './levels';
import type { ModeKey } from '../types';

export const PROGRESSION_MODE_INFO = {
  key: 'progression' as ModeKey,
  name: '코드 진행',
  emoji: '🎸',
  description: '코드 진행을 듣고 도수를 맞혀보세요',
  howTo: '조성(키)을 알려준 뒤 코드 진행이 들립니다. 각 코드의 도수(I, IV, V…)를 순서대로 입력하세요.',
  theory: '코드 진행은 조성 안에서 화음이 이어지는 흐름으로, 음계의 각 음 위에 세운 화음을 로마 숫자 도수(I·ii·V…)로 표기합니다. 도수는 조가 바뀌어도 변하지 않아 진행의 구조를 한눈에 보여 주며, I(으뜸)→V(딸림)→I 처럼 긴장과 해결을 만들어 음악을 앞으로 끌고 갑니다. 대중음악의 수많은 곡이 몇 가지 정형화된 진행을 공유합니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const MELODY_MODE_INFO = {
  key: 'melody' as ModeKey,
  name: '멜로디 받아적기',
  emoji: '🎶',
  description: '멜로디를 듣고 건반으로 입력하세요',
  howTo: '짧은 멜로디가 들립니다. 화면의 피아노 건반에서 들은 음을 순서대로 눌러 입력하세요.',
  theory: '받아적기(딕테이션)는 들은 소리를 음표로 옮겨 적는 훈련으로, 음높이(음정)와 길이(리듬)를 동시에 인지해야 합니다. 한 음씩 이전 음과의 음정 관계를 따라가며 선율의 윤곽을 머릿속에 그리는 것이 핵심이며, 작곡·편곡과 귀로 곡을 따는 능력의 토대가 됩니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const TRANSPOSE_MODE_INFO = {
  key: 'transpose' as ModeKey,
  name: '조옮김 연습',
  emoji: '🔄',
  description: '한 조에서 들은 멜로디를 다른 조로 옮겨서 연주하기',
  howTo: '먼저 원래 조성의 으뜸음과 짧은 멜로디가 들립니다. 이어서 옮길 조성의 으뜸음이 들립니다. 같은 멜로디 모양을 새 조성으로 옮겨 피아노 건반으로 입력하세요. (옥타브는 달라도 정답으로 인정됩니다.)',
  theory: '조옮김(이조)은 멜로디 전체를 일정한 음정만큼 위나 아래로 옮겨 다른 조성에서 연주하는 것입니다. 음들 사이의 상대적 음정 관계는 그대로 유지되고 절대 음높이만 바뀌므로, 멜로디를 음이름이 아닌 음정 패턴으로 기억하는 이동도식 사고를 길러 줍니다. 반주의 키를 바꾸거나 악기·성부에 맞게 음역을 옮길 때 쓰입니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const RHYTHM_MODE_INFO = {
  key: 'rhythm' as ModeKey,
  name: '리듬 받아치기',
  emoji: '🥁',
  description: '들은 리듬을 탭으로 따라쳐 보세요',
  howTo: '리듬 패턴이 먼저 들립니다. 이어서 화면의 탭 버튼을 눌러 같은 리듬으로 따라치세요.',
  theory: '리듬은 음과 쉼이 시간 위에 배열된 패턴으로, 음악의 시간적 뼈대를 이룹니다. 일정한 박(비트)이 박자(예: 4/4)로 묶이고, 그 위에서 음표의 길고 짧음이 리듬형을 만듭니다. 박을 쪼개거나(당김음·셋잇단음표) 강세를 옮기면 같은 음높이라도 전혀 다른 느낌이 됩니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const TEMPO_MODE_INFO = {
  key: 'tempo' as ModeKey,
  name: '템포 유지',
  emoji: '⏱️',
  description: '메트로놈을 듣고 같은 빠르기로 이어 치세요',
  howTo: '메트로놈이 몇 박 들린 뒤 멈춥니다. 같은 빠르기를 유지하며 탭 버튼으로 박을 이어 치세요.',
  theory: '템포는 음악이 진행하는 빠르기로, 보통 분당 박 수(BPM)로 나타냅니다. 외부 소리가 멈춰도 일정한 빠르기를 유지하려면 마음속에서 박을 꾸준히 세는 "내적 박(internal pulse)" 감각이 필요합니다. 합주에서 흔들리지 않는 박 감각은 정확한 연주의 바탕이 됩니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export const BPM_MODE_INFO = {
  key: 'bpm' as ModeKey,
  name: 'BPM 맞히기',
  emoji: '🎯',
  description: '들려주는 메트로놈의 빠르기(BPM)를 맞혀보세요',
  howTo: '메트로놈이 일정한 빠르기로 들립니다. 슬라이더로 들은 빠르기(BPM)를 추정해 맞혀보세요.',
  theory: 'BPM(beats per minute)은 1분 동안 울리는 박의 수로 빠르기를 수치화한 단위입니다. 60 BPM은 1초에 한 박, 120 BPM은 1초에 두 박으로, 숫자가 클수록 빠릅니다. 들은 빠르기를 구체적인 숫자로 가늠하는 감각은 메트로놈 설정이나 DJ·프로듀싱에서 곡의 속도를 맞출 때 유용합니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

const DEGREE_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/**
 * Render a scale degree + chord quality as a label, consistently across the
 * choice buttons, input chips, feedback table and the "correct answer" line.
 * Minor qualities lower-case the roman / add "m" to the number; diminished
 * qualities get a "°" instead. This is the single source of truth so the
 * notations never drift apart (e.g. vii° showing as a bare "vii").
 */
export function formatDegree(
  degree: number,
  quality: string,
  notation: 'roman' | 'number'
): string {
  const isDim = quality === 'dim' || quality === 'm7b5';
  const isMinor = quality === 'm' || quality === 'm7';
  if (notation === 'number') {
    return `${degree}${isDim ? '°' : isMinor ? 'm' : ''}`;
  }
  const r = DEGREE_ROMAN[degree] ?? String(degree);
  const base = isDim || isMinor ? r.toLowerCase() : r;
  return `${base}${isDim ? '°' : ''}`;
}

// Degree choice options for progression input
export function getDegreeChoices(notation: 'roman' | 'number') {
  const entries = [
    { degree: 1, quality: 'M'   },
    { degree: 2, quality: 'm'   },
    { degree: 3, quality: 'm'   },
    { degree: 4, quality: 'M'   },
    { degree: 5, quality: '7'   },
    { degree: 6, quality: 'm'   },
    { degree: 7, quality: 'dim' },
  ];
  return entries.map((e) => ({
    value: `${e.degree}_${e.quality}`,
    label: formatDegree(e.degree, e.quality, notation),
    degree: e.degree,
    quality: e.quality,
  }));
}
