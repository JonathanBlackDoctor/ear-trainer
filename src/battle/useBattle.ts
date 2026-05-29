import { createContext, useContext } from 'react';
import type { BattleConfig } from './types';

// Battle action API exposed by BattleProvider. Kept in its own module (not in
// the provider component file) so the provider file only exports a component —
// satisfies react-refresh/only-export-components and keeps fast-refresh working.
export interface BattleApi {
  startBattle: (config: BattleConfig) => void;
  submitAnswer: (value: string) => void;
  leaveBattle: () => void;
  voteRematch: () => void;
}

export const BattleContext = createContext<BattleApi | null>(null);

export function useBattle(): BattleApi {
  const api = useContext(BattleContext);
  if (!api) throw new Error('useBattle must be used within BattleProvider');
  return api;
}
