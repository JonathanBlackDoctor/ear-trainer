// Schema migrations for the persisted Zustand store. The `version` argument is
// whatever zustand persisted last (0 if absent). Each migration is responsible
// for upgrading by exactly one step; we chain them in order.

import type { ModeKey } from '../types';

const MODE_KEYS: ModeKey[] = [
  'interval', 'chord', 'progression', 'melody', 'solfege',
  'transpose', 'rhythm', 'tempo', 'bpm',
];

function emptyPerMode<T extends Record<string, unknown>>(): Record<ModeKey, T> {
  const out = {} as Record<ModeKey, T>;
  for (const k of MODE_KEYS) out[k] = {} as T;
  return out;
}

// Persisted blobs are inherently loosely typed (older schemas have unknown
// shape). We accept `unknown` at the boundary and treat absent fields as
// defaults.
type AnyState = Record<string, unknown> & {
  settings?: Record<string, unknown>;
  srs?: unknown;
  stats?: unknown;
};

// v1 → v2: add `srs` per mode, add `weakSessionLength` + `reducedMotion`
// settings. Preserves all existing stats/sessions/settings.
function v1Tov2(state: AnyState | null | undefined): AnyState | null | undefined {
  if (!state) return state;
  const oldSettings = (state.settings ?? {}) as Record<string, unknown>;
  return {
    ...state,
    srs: state.srs ?? emptyPerMode(),
    settings: {
      ...oldSettings,
      weakSessionLength: oldSettings.weakSessionLength ?? 10,
      reducedMotion: oldSettings.reducedMotion ?? 'system',
    },
  };
}

// v2 → v3: reset per-mode stats and SRS. The 10-level curriculum changes
// what each itemKey means (chord qualities reorganized, solfege candidates
// per level, rhythm pattern buckets re-sliced), so cards trained on the old
// semantics would mis-schedule and weakness scores would mix incompatible
// pools. Sessions are kept as-is — SessionSummary has no level field and the
// aggregate counts remain comparable across schemas.
function v2Tov3(state: AnyState | null | undefined): AnyState | null | undefined {
  if (!state) return state;
  return {
    ...state,
    stats: emptyPerMode(),
    srs: emptyPerMode(),
  };
}

// v3 → v4: introduce gamification slice (XP, achievements, combo tracking).
// Backfill existing sessions with bestCombo=0 and xpEarned=0 so old summary
// cards continue to render without conditionals. Stats/SRS are preserved.
function v3Tov4(state: AnyState | null | undefined): AnyState | null | undefined {
  if (!state) return state;
  const sessions = Array.isArray(state.sessions) ? state.sessions : [];
  const patchedSessions = sessions.map((s) => {
    const ss = (s ?? {}) as Record<string, unknown>;
    return {
      ...ss,
      bestCombo: typeof ss.bestCombo === 'number' ? ss.bestCombo : 0,
      xpEarned:  typeof ss.xpEarned  === 'number' ? ss.xpEarned  : 0,
    };
  });
  return {
    ...state,
    sessions: patchedSessions,
    gamification: {
      totalXp: 0,
      achievements: {},
      bestComboByMode: {},
      lifetimeCorrect: 0,
      lifetimeAnswers: 0,
      perfectSessionCount: 0,
      modesEverTried: {},
      weaknessConqueredSnapshot: {},
      lightningCount: 0,
    },
  };
}

// v4 → v5: add the `design` visual-theme setting. Existing users default to
// the classic 'default' look. Everything else is preserved.
function v4Tov5(state: AnyState | null | undefined): AnyState | null | undefined {
  if (!state) return state;
  const oldSettings = (state.settings ?? {}) as Record<string, unknown>;
  return {
    ...state,
    settings: {
      ...oldSettings,
      design: oldSettings.design ?? 'default',
    },
  };
}

// v5 → v6: add the `hiddenModes` setting (empty = nothing hidden). Introduced
// alongside the audio-engineer (mix-*) modes so users can hide modes they don't
// use from Home. Stats/SRS for the new modes are filled lazily by the store's
// default maps; no reset needed.
function v5Tov6(state: AnyState | null | undefined): AnyState | null | undefined {
  if (!state) return state;
  const oldSettings = (state.settings ?? {}) as Record<string, unknown>;
  return {
    ...state,
    settings: {
      ...oldSettings,
      hiddenModes: oldSettings.hiddenModes ?? [],
    },
  };
}

export const CURRENT_SCHEMA_VERSION = 6;

export function migrate(persistedState: unknown, fromVersion: number): unknown {
  let state = persistedState as AnyState | null | undefined;
  if (fromVersion < 2) state = v1Tov2(state);
  if (fromVersion < 3) state = v2Tov3(state);
  if (fromVersion < 4) state = v3Tov4(state);
  if (fromVersion < 5) state = v4Tov5(state);
  if (fromVersion < 6) state = v5Tov6(state);
  return state;
}

/** Lenient import: accepts a v1 or v2 JSON blob and returns a v2 shape. */
export function migrateImport(data: unknown): unknown {
  const obj = (data ?? {}) as { schemaVersion?: unknown };
  const fromVersion = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1;
  return migrate(data, fromVersion);
}
