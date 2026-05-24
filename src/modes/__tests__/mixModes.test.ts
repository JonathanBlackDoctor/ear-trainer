import { describe, it, expect } from 'vitest';
import { MIX_MODE_INFOS, getMixChoices, buildMix } from '../mixModes';
import { makeMixQuestion } from '../../engine/questionFactory';
import { judge } from '../../engine/judge';
import type { MixData, MixEffect, ModeKey } from '../../types';

const MIX_KEYS = MIX_MODE_INFOS.map((m) => m.key as ModeKey);
const effectOf = (k: ModeKey) => k.replace(/^mix-/, '') as MixEffect;

describe('mixModes — every mode × level produces a valid, judgeable question', () => {
  for (const key of MIX_KEYS) {
    for (let level = 1; level <= 10; level++) {
      it(`${key} Lv${level}`, () => {
        const choices = getMixChoices(effectOf(key), level);
        expect(choices.length).toBeGreaterThanOrEqual(2);

        const q = makeMixQuestion(key, level, {});
        expect(q.mode).toBe(key);
        expect(q.level).toBe(level);
        expect(q.itemKey).toBeTruthy();
        expect(q.context.absoluteMode).toBe(true);

        const data = q.data as MixData;
        expect(data.type).toBe('mix');
        expect(data.effect).toBe(effectOf(key));
        expect(Object.keys(data.params).length).toBeGreaterThan(0);
        expect(data.detail).toBeTruthy();

        // The answer must be one of the presented choices.
        const values = choices.map((c) => c.value);
        expect(values).toContain(q.answer);

        // Correct answer judges correct; a different choice judges wrong.
        const right = judge(q, q.answer as string);
        expect(right.correct).toBe(true);
        expect(right.details?.kind).toBe('mix');

        const other = values.find((v) => v !== q.answer);
        if (other) expect(judge(q, other).correct).toBe(false);
      });
    }
  }
});

describe('mixModes — buildMix output is self-consistent', () => {
  for (const key of MIX_KEYS) {
    it(`${key} build params match source/compare contract`, () => {
      const effect = effectOf(key);
      for (const c of getMixChoices(effect, 1)) {
        const b = buildMix(effect, 1, c.value);
        expect(['pink', 'loop']).toContain(b.source);
        expect(['none', 'ab']).toContain(b.compare);
        expect(b.detail.length).toBeGreaterThan(0);
      }
    });
  }
});
