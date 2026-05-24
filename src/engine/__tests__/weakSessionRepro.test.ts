import { describe, it, expect } from 'vitest';
import {
  makeIntervalQuestion, makeChordQuestion, makeSolfegeQuestion,
  makeProgressionQuestion, makeMelodyQuestion, makeTransposeQuestion,
  makeScaleQuestion, makeCadenceQuestion, makeInversionQuestion,
  makeIntervalCompareQuestion, makeOddNoteQuestion, makeContourQuestion,
  makeTuningQuestion, makeFunctionQuestion, makeExtendedQuestion,
  makeBassQuestion, makeTensionQuestion,
} from '../questionFactory';
import { itemKeysForLevel } from '../itemPool';
import { weakFocusLevel, topWeakItems } from '../weakness';
import { makeCard } from '../srs';
import { MODE_REGISTRY } from '../../modes/registry';
import { MAX_LEVEL } from '../../modes/levels';
import type { ModeKey, ModeStats, ModeSrs, StatsItem } from '../../types';

const weakItem = (): StatsItem => ({ attempts: 6, correct: 0, recent: [0, 0, 0, 0], lastSeen: Date.now() });

// Reproduce exactly what Train.tsx does for a focus=weak session: derive the
// candidate filter from the top weak items, pick the focus level, then call the
// factory the same way the generateQuestion switch does — including the real
// SRS map (so nextTarget routes through pickDue, as in the live app).
function runWeakLikeTrain(mode: ModeKey, stats: ModeStats, srs: ModeSrs) {
  const top = topWeakItems(stats, 8).filter((w) => (stats[w.key]?.attempts ?? 0) > 0);
  const weakItemKeys = new Set(top.map((w) => w.key));
  const candidateFilter = (k: string) => weakItemKeys.has(k);
  const maxLv = MODE_REGISTRY[mode]?.maxLevel ?? MAX_LEVEL;
  const level = weakFocusLevel(mode, stats, maxLv, 1);
  const sel = { lastItemKey: undefined, srs, stats, candidateFilter };

  switch (mode) {
    case 'interval': return makeIntervalQuestion(level, 'fixed', 'C', undefined, srs, stats, candidateFilter);
    case 'chord': return makeChordQuestion(level, 'fixed', 'C', false, undefined, srs, stats, candidateFilter);
    case 'solfege': return makeSolfegeQuestion(level, 'fixed', 'C', undefined, srs, stats, candidateFilter);
    case 'progression': return makeProgressionQuestion(level, 'fixed', 'C', 'diatonic');
    case 'melody': return makeMelodyQuestion(level, 'fixed', 'C');
    case 'transpose': return makeTransposeQuestion(level, 'fixed', 'C', undefined, srs, stats, candidateFilter);
    case 'lab-scale': return makeScaleQuestion(level, sel);
    case 'lab-cadence': return makeCadenceQuestion(level, sel);
    case 'lab-inversion': return makeInversionQuestion(level, sel);
    case 'lab-interval-compare': return makeIntervalCompareQuestion(level, sel);
    case 'lab-odd-note': return makeOddNoteQuestion(level, sel);
    case 'lab-contour': return makeContourQuestion(level, sel);
    case 'lab-tuning': return makeTuningQuestion(level, sel);
    case 'lab-function': return makeFunctionQuestion(level, sel);
    case 'lab-extended': return makeExtendedQuestion(level, sel);
    case 'lab-bass': return makeBassQuestion(level, sel);
    case 'lab-tension': return makeTensionQuestion(level, sel);
    default: return makeIntervalQuestion(level, 'fixed', 'C');
  }
}

const FOCUSABLE: ModeKey[] = [
  'interval', 'chord', 'solfege', 'transpose',
  'lab-scale', 'lab-cadence', 'lab-inversion', 'lab-interval-compare',
  'lab-odd-note', 'lab-contour', 'lab-tuning', 'lab-function',
  'lab-extended', 'lab-bass', 'lab-tension',
];

describe('weak session repro — no crash for any focusable mode', () => {
  for (const mode of FOCUSABLE) {
    it(`${mode}: realistic weak history (multi-level + legacy keys + SRS) produces a valid question`, () => {
      const maxLv = MODE_REGISTRY[mode]?.maxLevel ?? MAX_LEVEL;
      // Weak items recorded across the whole level ladder, plus a couple of
      // stale/legacy keys that no longer map to any current level pool.
      const stats: ModeStats = {
        '__legacy_key__': weakItem(),
        'P5': weakItem(),
      };
      const srs: ModeSrs = {};
      for (let lv = 1; lv <= maxLv; lv++) {
        for (const k of itemKeysForLevel(mode, lv).slice(0, 2)) {
          stats[k] = weakItem();
          // Half the cards overdue (due in the past), so pickDue's "due" branch fires.
          srs[k] = makeCard(0.9, Date.now() - 60_000);
        }
      }
      // Legacy keys also get cards.
      srs['P5'] = makeCard(0.9, Date.now() - 60_000);

      expect(() => {
        for (let i = 0; i < 30; i++) {
          const q = runWeakLikeTrain(mode, stats, srs);
          expect(q.itemKey).toBeTruthy();
        }
      }).not.toThrow();
    });
  }
});
