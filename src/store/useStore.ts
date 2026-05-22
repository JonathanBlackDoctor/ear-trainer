import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings,
  ModeStats,
  SessionSummary,
  ModeKey,
  SessionResult,
  ModeSrs,
} from '../types';
import { CURRENT_SCHEMA_VERSION, migrate, migrateImport } from './migrate';
import { ensureCard, updateCard } from '../engine/srs';

interface Store {
  settings: AppSettings;
  stats: Record<ModeKey, ModeStats>;
  sessions: SessionSummary[];
  customPatterns: string[][];
  srs: Record<ModeKey, ModeSrs>;

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Stats / SRS
  recordResult: (result: SessionResult) => void;
  addSession: (summary: SessionSummary) => void;

  // Export / Import
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

const defaultSettings: AppSettings = {
  notation: 'number',
  solfegeMode: 'movable',
  referenceTone: 'perQuestion',
  keyMode: 'random',
  fixedKey: 'C',
  difficultyMode: 'adaptive',
  questionsPerSession: 10,
  showStaffFeedback: true,
  weakSessionLength: 10,
  reducedMotion: 'system',
};

const emptyModeStats = (): ModeStats => ({});
const emptyModeSrs = (): ModeSrs => ({});

const defaultStats = (): Record<ModeKey, ModeStats> => ({
  interval: emptyModeStats(),
  chord: emptyModeStats(),
  progression: emptyModeStats(),
  melody: emptyModeStats(),
  solfege: emptyModeStats(),
  transpose: emptyModeStats(),
  rhythm: emptyModeStats(),
  tempo: emptyModeStats(),
  bpm: emptyModeStats(),
  lab: emptyModeStats(),
  'lab-scale': emptyModeStats(),
  'lab-cadence': emptyModeStats(),
  'lab-key': emptyModeStats(),
  'lab-inversion': emptyModeStats(),
});

const defaultSrs = (): Record<ModeKey, ModeSrs> => ({
  interval: emptyModeSrs(),
  chord: emptyModeSrs(),
  progression: emptyModeSrs(),
  melody: emptyModeSrs(),
  solfege: emptyModeSrs(),
  transpose: emptyModeSrs(),
  rhythm: emptyModeSrs(),
  tempo: emptyModeSrs(),
  bpm: emptyModeSrs(),
  lab: emptyModeSrs(),
  'lab-scale': emptyModeSrs(),
  'lab-cadence': emptyModeSrs(),
  'lab-key': emptyModeSrs(),
  'lab-inversion': emptyModeSrs(),
});

const RECENT_WINDOW = 8;
const SESSION_CAP = 200;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      stats: defaultStats(),
      sessions: [],
      customPatterns: [],
      srs: defaultSrs(),

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      recordResult: (result) => {
        set((s) => {
          // Stats update (rolling 8-window)
          const modeStats = { ...s.stats[result.mode] };
          const existing = modeStats[result.itemKey] ?? {
            attempts: 0, correct: 0, recent: [], lastSeen: 0,
          };
          const recent = [
            ...existing.recent.slice(-(RECENT_WINDOW - 1)),
            result.correct ? 1 : 0,
          ];
          modeStats[result.itemKey] = {
            attempts: existing.attempts + 1,
            correct: existing.correct + (result.correct ? 1 : 0),
            recent,
            lastSeen: Date.now(),
          };

          // SRS update — uses the freshly-updated stats so a newly-created
          // card seeds its ease from the latest weakness score.
          const modeSrs = { ...s.srs[result.mode] };
          const card = ensureCard(modeSrs, modeStats, result.itemKey);
          modeSrs[result.itemKey] = updateCard(card, result.correct ? 1 : 0);

          return {
            stats: { ...s.stats, [result.mode]: modeStats },
            srs: { ...s.srs, [result.mode]: modeSrs },
          };
        });
      },

      addSession: (summary) => {
        set((s) => {
          const sessions = [summary, ...s.sessions].slice(0, SESSION_CAP);
          return { sessions };
        });
      },

      exportData: () => {
        const { settings, stats, sessions, customPatterns, srs } = get();
        return JSON.stringify(
          { schemaVersion: CURRENT_SCHEMA_VERSION, settings, stats, sessions, customPatterns, srs },
          null,
          2
        );
      },

      importData: (json) => {
        try {
          const raw = JSON.parse(json);
          if (typeof raw !== 'object' || raw === null) return false;
          const data = migrateImport(raw) as Partial<{
            settings: Partial<AppSettings>;
            stats: Record<ModeKey, ModeStats>;
            sessions: SessionSummary[];
            customPatterns: string[][];
            srs: Record<ModeKey, ModeSrs>;
          }>;
          set({
            settings: { ...defaultSettings, ...(data.settings ?? {}) },
            stats: { ...defaultStats(), ...(data.stats ?? {}) },
            sessions: data.sessions ?? [],
            customPatterns: data.customPatterns ?? [],
            srs: { ...defaultSrs(), ...(data.srs ?? {}) },
          });
          return true;
        } catch {
          return false;
        }
      },

      resetData: () => {
        set({ stats: defaultStats(), sessions: [], srs: defaultSrs() });
      },
    }),
    {
      name: 'eartrainer_state_v1',
      version: CURRENT_SCHEMA_VERSION,
      migrate: (persistedState, version) => migrate(persistedState, version),
    }
  )
);
