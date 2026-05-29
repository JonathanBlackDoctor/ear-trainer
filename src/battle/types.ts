import type { ModeKey, Question } from '../types';

// ─── Battle domain types ──────────────────────────────────────────────────────

export interface PlayerInfo {
  id: string;
  nick: string;
  joinedAt: number; // used to deterministically pick the host (earliest = host)
}

export interface BattleConfig {
  mode: ModeKey;
  level: number;
  questionCount: number;
  perQuestionMs: number;
}

/** Per-player authoritative final tally, broadcast when a player completes. */
export interface PlayerDone {
  playerId: string;
  score: number;
  correctMs: number; // sum of answer times on correct answers (tie-breaker)
  correct: number;   // number of correct answers
}

export interface BattleResults {
  players: PlayerInfo[];
  done: Record<string, PlayerDone>;
  winnerId: string | null; // null = draw
  byForfeit: boolean;
}

export const DEFAULT_BATTLE_CONFIG: Omit<BattleConfig, 'mode'> = {
  level: 1,
  questionCount: 5,
  perQuestionMs: 10_000,
};

export const QUESTION_COUNT_OPTIONS = [5, 7, 10] as const;
export const COUNTDOWN_MS = 3_000;

// ─── Wire protocol ─────────────────────────────────────────────────────────────
// Discriminated union of every message that crosses the transport. Versioned so
// future changes can be detected. `__from` is stamped by the transport layer.

export type BattleMessage =
  // Host → room: locks config, ships every question (3B broadcast sync), and
  // sets a synchronized start time so both clients begin together.
  | { t: 'start'; v: 1; config: BattleConfig; startAt: number; questions: Question[] }
  // Live, best-effort opponent progress + scoreboard.
  | { t: 'progress'; playerId: string; index: number }
  | { t: 'answer'; playerId: string; index: number; correct: boolean; points: number; ms: number }
  // Authoritative per-player final tally (both clients compute the winner once
  // they hold a `done` from every roster member).
  | { t: 'done'; done: PlayerDone }
  // Rematch handshake; both players must send within the window.
  | { t: 'rematch'; playerId: string }
  | { t: 'bye'; playerId: string; reason: 'left' | 'timeout' };
