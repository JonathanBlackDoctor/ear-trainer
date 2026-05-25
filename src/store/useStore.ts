import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings,
  ModeStats,
  SessionSummary,
  ModeKey,
  SessionResult,
  ModeSrs,
  GamificationState,
  AchievementUnlock,
} from '../types';
import { CURRENT_SCHEMA_VERSION, migrate, migrateImport } from './migrate';
import { ensureCard, updateCard } from '../engine/srs';
import { DEFAULT_MODE_ORDER } from '../modes/registry';
import { evaluateAchievements, ACHIEVEMENTS_BY_ID } from '../engine/achievements';
import { toast } from './useToast';

interface Store {
  settings: AppSettings;
  stats: Record<ModeKey, ModeStats>;
  sessions: SessionSummary[];
  customPatterns: string[][];
  srs: Record<ModeKey, ModeSrs>;
  gamification: GamificationState;

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Stats / SRS / Gamification
  // Returns newly-unlocked achievement IDs from this result (callers can show
  // the full unlock list at session end without re-evaluating).
  recordResult: (result: SessionResult, comboAtAnswer: number) => string[];
  addSession: (summary: SessionSummary, sessionResults: SessionResult[]) => string[];

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
  levelByMode: {},
  reducedMotion: 'system',
  design: 'default',
  modeOrder: DEFAULT_MODE_ORDER,
  hiddenModes: [],
};

// Stats and SRS maps cover every registered mode. Building them from
// DEFAULT_MODE_ORDER (instead of a hand-maintained literal) means newly added
// modes are included automatically and the two maps can never drift.
const defaultStats = (): Record<ModeKey, ModeStats> =>
  Object.fromEntries(DEFAULT_MODE_ORDER.map((k) => [k, {}])) as Record<ModeKey, ModeStats>;

const defaultSrs = (): Record<ModeKey, ModeSrs> =>
  Object.fromEntries(DEFAULT_MODE_ORDER.map((k) => [k, {}])) as Record<ModeKey, ModeSrs>;

const defaultGamification = (): GamificationState => ({
  totalXp: 0,
  achievements: {},
  bestComboByMode: {},
  lifetimeCorrect: 0,
  lifetimeAnswers: 0,
  perfectSessionCount: 0,
  modesEverTried: {},
  weaknessConqueredSnapshot: {},
  lightningCount: 0,
});

const RECENT_WINDOW = 8;
const SESSION_CAP = 200;

// A "weak" item is one whose lifetime accuracy has ever dropped below this.
// Used to gate the weakness_conquered achievement: only items that were once
// genuinely struggling count.
const WEAKNESS_THRESHOLD = 0.5;
const WEAKNESS_MIN_ATTEMPTS = 8;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      stats: defaultStats(),
      sessions: [],
      customPatterns: [],
      srs: defaultSrs(),
      gamification: defaultGamification(),

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      recordResult: (result, comboAtAnswer) => {
        let unlockedIds: string[] = [];
        set((s) => {
          // ── Stats update (rolling 8-window) ────────────────────────────────
          const modeStats = { ...s.stats[result.mode] };
          const existing = modeStats[result.itemKey] ?? {
            attempts: 0, correct: 0, recent: [], lastSeen: 0,
          };
          const recent = [
            ...existing.recent.slice(-(RECENT_WINDOW - 1)),
            result.correct ? 1 : 0,
          ];
          const newAttempts = existing.attempts + 1;
          const newCorrect = existing.correct + (result.correct ? 1 : 0);
          modeStats[result.itemKey] = {
            attempts: newAttempts,
            correct: newCorrect,
            recent,
            lastSeen: Date.now(),
          };

          // ── SRS update ─────────────────────────────────────────────────────
          const modeSrs = { ...s.srs[result.mode] };
          const card = ensureCard(modeSrs, modeStats, result.itemKey);
          modeSrs[result.itemKey] = updateCard(card, result.correct ? 1 : 0);

          // ── Gamification slice update ──────────────────────────────────────
          const g = s.gamification;
          const wasCorrect = result.correct && !result.skipped;
          const lifetimeCorrect = g.lifetimeCorrect + (wasCorrect ? 1 : 0);
          const lifetimeAnswers = g.lifetimeAnswers + 1;
          const totalXp = g.totalXp + (result.xpEarned || 0);
          const modesEverTried = { ...g.modesEverTried, [result.mode]: true };

          // Lightning: count lifetime <1s correct answers.
          const isLightning = wasCorrect && result.timeTaken > 0 && result.timeTaken < 1000;
          const lightningCount = g.lightningCount + (isLightning ? 1 : 0);

          // Weakness-conquered tracking:
          //   - If this item has ever been "weak" (lifetime accuracy <0.5 with
          //     >=8 attempts), record its current accuracy in the snapshot.
          //   - On subsequent updates, only store the running best so the
          //     achievement fires when accuracy crosses 0.9.
          const snapshot = { ...g.weaknessConqueredSnapshot };
          const accuracy = newAttempts > 0 ? newCorrect / newAttempts : 0;
          const snapKey = `${result.mode}:${result.itemKey}`;
          const wasWeak =
            newAttempts >= WEAKNESS_MIN_ATTEMPTS && accuracy < WEAKNESS_THRESHOLD;
          if (wasWeak || snapKey in snapshot) {
            const prev = snapshot[snapKey] ?? 0;
            snapshot[snapKey] = Math.max(prev, accuracy);
          }

          const newG: GamificationState = {
            ...g,
            totalXp,
            lifetimeCorrect,
            lifetimeAnswers,
            modesEverTried,
            weaknessConqueredSnapshot: snapshot,
            lightningCount,
          };

          // Evaluate achievements against the freshly-updated state. We must
          // pass `newG` (not the closure's `g`) — checks like `correct_10`
          // and `combo_3` reference fields we just bumped.
          const newStats = { ...s.stats, [result.mode]: modeStats };
          const ids = evaluateAchievements({
            state: newG,
            stats: newStats,
            lastResult: result,
            comboAtAnswer,
          });
          unlockedIds = ids;
          const achievements = { ...newG.achievements };
          const now = Date.now();
          for (const id of ids) {
            achievements[id] = { unlockedAt: now } as AchievementUnlock;
          }

          return {
            stats: newStats,
            srs: { ...s.srs, [result.mode]: modeSrs },
            gamification: { ...newG, achievements },
          };
        });

        // Fire toasts outside the setter so toast state isn't mutated mid-update.
        for (const id of unlockedIds) {
          const def = ACHIEVEMENTS_BY_ID[id];
          if (def) toast.success(`🏆 ${def.emoji} ${def.name} 달성!`, 4000);
        }
        return unlockedIds;
      },

      addSession: (summary, sessionResults) => {
        let unlockedIds: string[] = [];
        set((s) => {
          const sessions = [summary, ...s.sessions].slice(0, SESSION_CAP);

          const g = s.gamification;
          const isPerfect = summary.total > 0 && summary.correct === summary.total;
          const perfectSessionCount = g.perfectSessionCount + (isPerfect ? 1 : 0);

          const prevBest = g.bestComboByMode[summary.mode] ?? 0;
          const bestComboByMode = {
            ...g.bestComboByMode,
            [summary.mode]: Math.max(prevBest, summary.bestCombo),
          };

          const newG: GamificationState = {
            ...g,
            perfectSessionCount,
            bestComboByMode,
            modesEverTried: { ...g.modesEverTried, [summary.mode]: true },
          };

          // Re-evaluate session-scoped achievements (perfect_session*, quick_draw,
          // try_all_modes). Combo / volume already fired during recordResult.
          const ids = evaluateAchievements({
            state: newG,
            stats: s.stats,
            sessionResults,
          });
          unlockedIds = ids;
          const achievements = { ...newG.achievements };
          const now = Date.now();
          for (const id of ids) {
            achievements[id] = { unlockedAt: now } as AchievementUnlock;
          }

          return {
            sessions,
            gamification: { ...newG, achievements },
          };
        });

        for (const id of unlockedIds) {
          const def = ACHIEVEMENTS_BY_ID[id];
          if (def) toast.success(`🏆 ${def.emoji} ${def.name} 달성!`, 4000);
        }
        return unlockedIds;
      },

      exportData: () => {
        const { settings, stats, sessions, customPatterns, srs, gamification } = get();
        return JSON.stringify(
          {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            settings, stats, sessions, customPatterns, srs, gamification,
          },
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
            gamification: Partial<GamificationState>;
          }>;
          set({
            settings: { ...defaultSettings, ...(data.settings ?? {}) },
            stats: { ...defaultStats(), ...(data.stats ?? {}) },
            sessions: data.sessions ?? [],
            customPatterns: data.customPatterns ?? [],
            srs: { ...defaultSrs(), ...(data.srs ?? {}) },
            gamification: { ...defaultGamification(), ...(data.gamification ?? {}) },
          });
          return true;
        } catch {
          return false;
        }
      },

      resetData: () => {
        set({
          stats: defaultStats(),
          sessions: [],
          srs: defaultSrs(),
          gamification: defaultGamification(),
        });
      },
    }),
    {
      name: 'eartrainer_state_v1',
      version: CURRENT_SCHEMA_VERSION,
      migrate: (persistedState, version) => migrate(persistedState, version),
    }
  )
);
