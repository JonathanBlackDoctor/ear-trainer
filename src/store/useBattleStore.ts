import { create } from 'zustand';
import type { Question } from '../types';
import type { BattleConfig, BattleResults, PlayerDone, PlayerInfo } from '../battle/types';
import { buildResults, pickHostId, scoreAnswer } from '../battle/battleMachine';

// Ephemeral, NON-persisted battle state. Kept fully separate from the main
// useStore (which is localStorage-backed) so the offline single-player
// experience and its migration pipeline are completely untouched.

export type BattlePhase =
  | 'idle'        // not in a battle
  | 'connecting'  // joining the channel
  | 'lobby'       // waiting for opponent / host to start
  | 'countdown'   // synchronized lead-in
  | 'question'    // answering the current question
  | 'feedback'    // brief per-question result
  | 'finished'    // self done, waiting for opponent's final tally
  | 'results'     // winner decided
  | 'error';

interface BattleState {
  phase: BattlePhase;
  roomId: string;
  selfId: string;
  hostId: string | null;
  roster: PlayerInfo[];
  config: BattleConfig | null;
  questions: Question[];
  startAt: number;
  index: number;
  questionStart: number;
  // Live scoreboard (best-effort, from answer broadcasts).
  scores: Record<string, number>;
  progress: Record<string, number>;
  // Self per-question feedback.
  selfAnswered: boolean;
  selfFeedback: { correct: boolean; correctAnswer: unknown; points: number } | null;
  // Self running tally.
  selfScore: number;
  selfCorrectMs: number;
  selfCorrect: number;
  // Authoritative per-player finals.
  done: Record<string, PlayerDone>;
  results: BattleResults | null;
  rematchVotes: Record<string, boolean>;
  error: string | null;
}

interface BattleActions {
  init: (selfId: string, roomId: string) => void;
  reset: () => void;
  setPhase: (phase: BattlePhase) => void;
  setError: (msg: string) => void;
  setRoster: (roster: PlayerInfo[]) => void;
  isHost: () => boolean;
  /** Apply the host's start payload (host applies it locally too). */
  applyStart: (config: BattleConfig, startAt: number, questions: Question[]) => void;
  beginQuestions: () => void;
  /** Record the local player's answer to the current question. */
  recordSelfAnswer: (correct: boolean, correctAnswer: unknown, ms: number) => PlayerDone | null;
  advance: () => boolean; // returns true if a next question exists
  finishSelf: () => PlayerDone;
  // Inbound messages.
  applyAnswerMsg: (playerId: string, index: number, points: number) => void;
  applyProgress: (playerId: string, index: number) => void;
  applyDone: (done: PlayerDone) => void;
  applyRematch: (playerId: string) => void;
  applyBye: (playerId: string) => void;
  voteRematch: () => void;
  maybeFinalize: () => void;
}

const initialState = (selfId = '', roomId = ''): BattleState => ({
  phase: 'idle',
  roomId,
  selfId,
  hostId: null,
  roster: [],
  config: null,
  questions: [],
  startAt: 0,
  index: 0,
  questionStart: 0,
  scores: {},
  progress: {},
  selfAnswered: false,
  selfFeedback: null,
  selfScore: 0,
  selfCorrectMs: 0,
  selfCorrect: 0,
  done: {},
  results: null,
  rematchVotes: {},
  error: null,
});

export const useBattleStore = create<BattleState & BattleActions>((set, get) => ({
  ...initialState(),

  init: (selfId, roomId) => set({ ...initialState(selfId, roomId), phase: 'connecting' }),
  reset: () => set(initialState()),
  setPhase: (phase) => set({ phase }),
  setError: (msg) => set({ phase: 'error', error: msg }),

  setRoster: (roster) => {
    set({ roster, hostId: pickHostId(roster) });
    // If we're mid-battle and the opponent vanished, end by forfeit.
    const st = get();
    const active = ['countdown', 'question', 'feedback', 'finished'].includes(st.phase);
    if (active && roster.length < 2 && st.config) {
      const selfDone: PlayerDone =
        st.done[st.selfId] ?? {
          playerId: st.selfId, score: st.selfScore,
          correctMs: st.selfCorrectMs, correct: st.selfCorrect,
        };
      set({
        results: buildResults(st.roster.length ? st.roster : roster, { [st.selfId]: selfDone }, true),
        phase: 'results',
      });
    }
  },

  isHost: () => {
    const { hostId, selfId } = get();
    return hostId !== null && hostId === selfId;
  },

  applyStart: (config, startAt, questions) => set((st) => ({
    config, startAt, questions,
    phase: 'countdown',
    index: 0,
    questionStart: 0,
    scores: {},
    progress: {},
    selfAnswered: false,
    selfFeedback: null,
    selfScore: 0,
    selfCorrectMs: 0,
    selfCorrect: 0,
    done: {},
    results: null,
    rematchVotes: {},
    error: null,
    roster: st.roster,
  })),

  beginQuestions: () => set({ phase: 'question', index: 0, questionStart: Date.now(), selfAnswered: false, selfFeedback: null }),

  recordSelfAnswer: (correct, correctAnswer, ms) => {
    const st = get();
    if (st.selfAnswered || !st.config) return null;
    const points = scoreAnswer(correct, ms, st.config.perQuestionMs);
    const selfScore = st.selfScore + points;
    const selfCorrect = st.selfCorrect + (correct ? 1 : 0);
    const selfCorrectMs = st.selfCorrectMs + (correct ? ms : 0);
    set({
      selfAnswered: true,
      selfFeedback: { correct, correctAnswer, points },
      phase: 'feedback',
      selfScore, selfCorrect, selfCorrectMs,
      scores: { ...st.scores, [st.selfId]: selfScore },
      progress: { ...st.progress, [st.selfId]: st.index + 1 },
    });
    return { playerId: st.selfId, score: selfScore, correctMs: selfCorrectMs, correct: selfCorrect };
  },

  advance: () => {
    const st = get();
    if (!st.config) return false;
    const next = st.index + 1;
    if (next >= st.config.questionCount) return false;
    set({ index: next, questionStart: Date.now(), selfAnswered: false, selfFeedback: null, phase: 'question' });
    return true;
  },

  finishSelf: () => {
    const st = get();
    const done: PlayerDone = {
      playerId: st.selfId, score: st.selfScore,
      correctMs: st.selfCorrectMs, correct: st.selfCorrect,
    };
    set({ phase: 'finished', done: { ...st.done, [st.selfId]: done } });
    get().maybeFinalize();
    return done;
  },

  applyAnswerMsg: (playerId, index, points) => set((st) => ({
    scores: { ...st.scores, [playerId]: (st.scores[playerId] ?? 0) + points },
    progress: { ...st.progress, [playerId]: index + 1 },
  })),

  applyProgress: (playerId, index) => set((st) => ({
    progress: { ...st.progress, [playerId]: Math.max(st.progress[playerId] ?? 0, index) },
  })),

  applyDone: (done) => {
    set((st) => ({ done: { ...st.done, [done.playerId]: done } }));
    get().maybeFinalize();
  },

  maybeFinalize: () => {
    const st = get();
    if (st.results) return;
    if (st.roster.length === 0) return;
    const haveAll = st.roster.every((p) => st.done[p.id]);
    if (haveAll && Object.keys(st.done).length >= st.roster.length) {
      set({ results: buildResults(st.roster, st.done, false), phase: 'results' });
    }
  },

  applyRematch: (playerId) => set((st) => ({
    rematchVotes: { ...st.rematchVotes, [playerId]: true },
  })),

  applyBye: (playerId) => {
    const st = get();
    const remaining = st.roster.filter((p) => p.id !== playerId);
    get().setRoster(remaining);
  },

  voteRematch: () => set((st) => ({
    rematchVotes: { ...st.rematchVotes, [st.selfId]: true },
  })),
}));
