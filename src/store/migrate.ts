// Schema migrations for the persisted Zustand store. The `version` argument is
// whatever zustand persisted last (0 if absent). Each migration is responsible
// for upgrading by exactly one step; we chain them in order.

import type { ModeKey } from '../types';

const MODE_KEYS: ModeKey[] = [
  'interval', 'chord', 'progression', 'melody', 'solfege',
  'transpose', 'rhythm', 'tempo', 'bpm',
];

function emptySrs(): Record<ModeKey, Record<string, never>> {
  const out = {} as Record<ModeKey, Record<string, never>>;
  for (const k of MODE_KEYS) out[k] = {};
  return out;
}

// Persisted blobs are inherently loosely typed (older schemas have unknown
// shape). We accept `unknown` at the boundary and treat absent fields as
// defaults.
type AnyState = Record<string, unknown> & {
  settings?: Record<string, unknown>;
  srs?: unknown;
};

// v1 → v2: add `srs` per mode, add `weakSessionLength` + `reducedMotion`
// settings. Preserves all existing stats/sessions/settings.
function v1Tov2(state: AnyState | null | undefined): AnyState | null | undefined {
  if (!state) return state;
  const oldSettings = (state.settings ?? {}) as Record<string, unknown>;
  return {
    ...state,
    srs: state.srs ?? emptySrs(),
    settings: {
      ...oldSettings,
      weakSessionLength: oldSettings.weakSessionLength ?? 10,
      reducedMotion: oldSettings.reducedMotion ?? 'system',
    },
  };
}

export const CURRENT_SCHEMA_VERSION = 2;

export function migrate(persistedState: unknown, fromVersion: number): unknown {
  let state = persistedState as AnyState | null | undefined;
  if (fromVersion < 2) state = v1Tov2(state);
  return state;
}

/** Lenient import: accepts a v1 or v2 JSON blob and returns a v2 shape. */
export function migrateImport(data: unknown): unknown {
  const obj = (data ?? {}) as { schemaVersion?: unknown };
  const fromVersion = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1;
  return migrate(data, fromVersion);
}
