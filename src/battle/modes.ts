import type { ModeKey } from '../types';
import { DEFAULT_MODE_ORDER, MODE_REGISTRY } from '../modes/registry';

// Battle v1 supports only single-tap "choice grid" modes — the answer is one
// string, judged by the existing engine/judge.ts, which makes head-to-head
// speed racing clean and reuse trivial. Modes needing piano/tap/slider/
// multi-step input (melody, progression, transpose, rhythm, tempo, bpm, and
// the multi-select note-stack) are excluded for now.
const EXCLUDED: ReadonlySet<ModeKey> = new Set<ModeKey>([
  'melody', 'progression', 'transpose', 'rhythm', 'tempo', 'bpm',
  'lab-note-stack',
]);

/** Ordered list of modes available in battle (follows the Home grid order). */
export const BATTLE_MODES: ModeKey[] = DEFAULT_MODE_ORDER.filter((m) => !EXCLUDED.has(m));

export function isBattleMode(mode: string): mode is ModeKey {
  return (BATTLE_MODES as string[]).includes(mode);
}

export function maxLevelFor(mode: ModeKey): number {
  return MODE_REGISTRY[mode]?.maxLevel ?? 10;
}
