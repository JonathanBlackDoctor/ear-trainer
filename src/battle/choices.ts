import type { ModeKey, MixData } from '../types';
import type { ChoiceOption } from '../components/ChoiceGrid';
import { getIntervalChoices } from '../modes/intervalMode';
import { getChordChoices } from '../modes/chordMode';
import { getSolfegeChoices } from '../modes/solfegeMode';
import {
  getScaleChoices, getCadenceChoices, getInversionChoices,
  getIntervalCompareChoices, getOddNoteChoices, getContourChoices, getTuningChoices,
  getFunctionChoices, getExtendedChoices, getBassChoices, getTensionChoices,
  getWideIntervalChoices, getNoteStackChoices, getMicrotuningChoices, getHarmonicsChoices,
} from '../modes/labModes';
import { getMixChoices } from '../modes/mixModes';

// Choice options for a battle question, mirroring Train.tsx's getChoiceOptions
// but limited to the battle-supported (single-tap) modes.
export function getBattleChoices(mode: ModeKey, level: number): ChoiceOption[] {
  if (mode === 'interval') return getIntervalChoices(level);
  if (mode === 'chord') return getChordChoices(level);
  if (mode === 'solfege') return getSolfegeChoices(level);
  if (mode === 'lab-scale') return getScaleChoices(level);
  if (mode === 'lab-cadence') return getCadenceChoices(level);
  if (mode === 'lab-inversion') return getInversionChoices(level);
  if (mode === 'lab-interval-compare') return getIntervalCompareChoices(level);
  if (mode === 'lab-odd-note') return getOddNoteChoices();
  if (mode === 'lab-contour') return getContourChoices(level);
  if (mode === 'lab-tuning') return getTuningChoices();
  if (mode === 'lab-function') return getFunctionChoices();
  if (mode === 'lab-extended') return getExtendedChoices(level);
  if (mode === 'lab-bass') return getBassChoices(level);
  if (mode === 'lab-tension') return getTensionChoices(level);
  if (mode === 'lab-wide-interval') return getWideIntervalChoices(level);
  if (mode === 'lab-note-stack') return getNoteStackChoices(level);
  if (mode === 'lab-microtuning') return getMicrotuningChoices(level);
  if (mode === 'lab-harmonics') return getHarmonicsChoices(level);
  if (mode.startsWith('mix-')) return getMixChoices(mode.replace(/^mix-/, '') as MixData['effect'], level);
  return [];
}
