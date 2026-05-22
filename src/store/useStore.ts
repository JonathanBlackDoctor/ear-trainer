import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings,
  ModeStats,
  SessionSummary,
  StatsItem,
  ModeKey,
  SessionResult,
} from '../types';

interface Store {
  settings: AppSettings;
  stats: Record<ModeKey, ModeStats>;
  sessions: SessionSummary[];
  customPatterns: string[][];

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Stats
  recordResult: (result: SessionResult) => void;
  getItem: (mode: ModeKey, itemKey: string) => StatsItem;
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
};

const emptyModeStats = (): ModeStats => ({});

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
});

const defaultItem = (): StatsItem => ({
  attempts: 0,
  correct: 0,
  recent: [],
  lastSeen: 0,
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

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      recordResult: (result) => {
        set((s) => {
          const modeStats = { ...s.stats[result.mode] };
          const existing = modeStats[result.itemKey] ?? defaultItem();
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
          return {
            stats: { ...s.stats, [result.mode]: modeStats },
          };
        });
      },

      getItem: (mode, itemKey) => {
        const s = get();
        return s.stats[mode]?.[itemKey] ?? defaultItem();
      },

      addSession: (summary) => {
        set((s) => {
          const sessions = [summary, ...s.sessions].slice(0, SESSION_CAP);
          return { sessions };
        });
      },

      exportData: () => {
        const { settings, stats, sessions, customPatterns } = get();
        return JSON.stringify(
          { schemaVersion: 1, settings, stats, sessions, customPatterns },
          null,
          2
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.schemaVersion) return false;
          set({
            settings: { ...defaultSettings, ...(data.settings ?? {}) },
            stats: { ...defaultStats(), ...(data.stats ?? {}) },
            sessions: data.sessions ?? [],
            customPatterns: data.customPatterns ?? [],
          });
          return true;
        } catch {
          return false;
        }
      },

      resetData: () => {
        set({ stats: defaultStats(), sessions: [] });
      },
    }),
    {
      name: 'eartrainer_state_v1',
    }
  )
);
