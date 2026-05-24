import type { ChoiceOption } from '../components/ChoiceGrid';
import { CHORD_LEVELS, chordLabel } from '../theory/chords';
import { MAX_LEVEL } from './levels';
import type { ModeKey } from '../types';

export const CHORD_MODE_INFO = {
  key: 'chord' as ModeKey,
  name: '코드 듣기',
  emoji: '🎹',
  description: '코드의 종류를 맞혀보세요',
  howTo: '한 코드의 구성음이 동시 또는 분산으로 들립니다. 코드의 종류(메이저, 마이너, dim, 7 등)를 아래 버튼에서 선택하세요.',
  theory: '코드(화음)는 세 개 이상의 음을 동시에 쌓은 것으로, 근음 위에 3도씩 음을 올려 만듭니다. 3음의 장·단3도 조합이 장(밝음)·단(어두움)·증·감의 성격을 결정하고, 여기에 7음을 더하면 7화음(메이저7·도미넌트7 등)이 되어 더 풍부한 색을 냅니다. 코드의 음색을 구분하는 능력은 화성 청음의 핵심입니다.',
  maxLevel: MAX_LEVEL,
  defaultLevel: 1,
};

export function getChordChoices(level: number): ChoiceOption[] {
  const cfg = CHORD_LEVELS[level] ?? CHORD_LEVELS[1];
  // Deduplicate (later levels may repeat qualities across inversions).
  const unique = [...new Set(cfg.qualities)];
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
