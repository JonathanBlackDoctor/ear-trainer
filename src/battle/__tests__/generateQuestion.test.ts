import { describe, it, expect } from 'vitest';
import { generateBattleQuestion, generateBattleQuestions } from '../generateQuestion';
import { BATTLE_MODES, maxLevelFor } from '../modes';
import { judge } from '../../engine/judge';

describe('generateBattleQuestion', () => {
  it('produces a valid question for every battle mode at low and high levels', () => {
    for (const mode of BATTLE_MODES) {
      for (const level of [1, Math.min(3, maxLevelFor(mode)), maxLevelFor(mode)]) {
        const q = generateBattleQuestion(mode, level);
        expect(q, `mode=${mode} level=${level}`).toBeTruthy();
        expect(q.id, `mode=${mode}`).toBeTruthy();
        expect(q.mode, `mode=${mode}`).toBe(mode);
        expect(q.answer, `mode=${mode}`).toBeDefined();
        expect(q.data, `mode=${mode}`).toBeTruthy();
      }
    }
  });

  it('generates the requested number of questions', () => {
    const qs = generateBattleQuestions('interval', 1, 5);
    expect(qs).toHaveLength(5);
  });

  it('judges the canonical answer as correct for single-string choice modes', () => {
    for (const mode of ['interval', 'chord', 'solfege'] as const) {
      const q = generateBattleQuestion(mode, 1);
      // The stored answer is what a correct choice submits.
      const result = judge(q, q.answer as never);
      expect(result.correct, `mode=${mode} answer=${String(q.answer)}`).toBe(true);
    }
  });
});
