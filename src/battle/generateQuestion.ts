import type { ModeKey, Question } from '../types';
import {
  makeIntervalQuestion, makeChordQuestion, makeSolfegeQuestion,
  makeScaleQuestion, makeCadenceQuestion, makeInversionQuestion,
  makeIntervalCompareQuestion, makeOddNoteQuestion, makeContourQuestion,
  makeTuningQuestion, makeFunctionQuestion, makeExtendedQuestion,
  makeBassQuestion, makeTensionQuestion, makeMixQuestion,
  makeWideIntervalQuestion, makeNoteStackQuestion,
  makeMicrotuningQuestion, makeHarmonicQuestion,
} from '../engine/questionFactory';

// Central question dispatcher for battles. Mirrors the choice-mode branches of
// Train.tsx's inline switch, but without SRS/weakness/stats input: battle
// questions are pure random (no per-player state) so both clients face an
// equivalent difficulty, and the host's generated payloads are broadcast to the
// guest verbatim (Decision 3B). Only battle-supported (choice) modes appear here.
export function generateBattleQuestion(mode: ModeKey, level: number): Question {
  switch (mode) {
    case 'interval': return makeIntervalQuestion(level, 'random', 'C');
    case 'chord': return makeChordQuestion(level, 'random', 'C', false);
    case 'solfege': return makeSolfegeQuestion(level, 'random', 'C');
    case 'lab-scale': return makeScaleQuestion(level, {});
    case 'lab-cadence': return makeCadenceQuestion(level, {});
    case 'lab-inversion': return makeInversionQuestion(level, {});
    case 'lab-interval-compare': return makeIntervalCompareQuestion(level, {});
    case 'lab-odd-note': return makeOddNoteQuestion(level, {});
    case 'lab-contour': return makeContourQuestion(level, {});
    case 'lab-tuning': return makeTuningQuestion(level, {});
    case 'lab-function': return makeFunctionQuestion(level, {});
    case 'lab-extended': return makeExtendedQuestion(level, {});
    case 'lab-bass': return makeBassQuestion(level, {});
    case 'lab-tension': return makeTensionQuestion(level, {});
    case 'lab-wide-interval': return makeWideIntervalQuestion(level, {});
    case 'lab-note-stack': return makeNoteStackQuestion(level, {});
    case 'lab-microtuning': return makeMicrotuningQuestion(level, {});
    case 'lab-harmonics': return makeHarmonicQuestion(level, {});
    case 'mix-eq-freq':
    case 'mix-eq-boostcut':
    case 'mix-filter':
    case 'mix-compression':
    case 'mix-reverb-amount':
    case 'mix-reverb-type':
    case 'mix-delay-time':
    case 'mix-pan':
    case 'mix-width':
    case 'mix-level':
    case 'mix-distortion':
    case 'mix-modulation':
      return makeMixQuestion(mode, level, {});
    default:
      // Battle modes are gated by BATTLE_MODES, so this is unreachable; fall
      // back to an interval question rather than throwing.
      return makeIntervalQuestion(level, 'random', 'C');
  }
}

/** Generate the full ordered question set for one battle. */
export function generateBattleQuestions(mode: ModeKey, level: number, count: number): Question[] {
  const out: Question[] = [];
  for (let i = 0; i < count; i++) out.push(generateBattleQuestion(mode, level));
  return out;
}
