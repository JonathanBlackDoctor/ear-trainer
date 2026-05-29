import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { judge } from '../engine/judge';
import { startAudio, stopAllAudio } from '../audio/piano';
import { playBattleQuestion } from '../audio/playBattleQuestion';
import { useBattleStore } from '../store/useBattleStore';
import { createTransport } from '../net/transport';
import type { BattleTransport } from '../net/transport';
import { getNick, getPlayerId, defaultNick } from '../net/identity';
import { generateBattleQuestions } from './generateQuestion';
import { scoreAnswer } from './battleMachine';
import { COUNTDOWN_MS, type BattleConfig } from './types';
import { BattleContext, type BattleApi } from './useBattle';

const FEEDBACK_MS = 1400;

export function BattleProvider() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const transportRef = useRef<BattleTransport | null>(null);
  const connectedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const addTimer = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  // ─── Connect once on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || connectedRef.current) return;
    connectedRef.current = true;
    const store = useBattleStore.getState();
    const selfId = getPlayerId();
    const nick = getNick() || defaultNick();
    store.init(selfId, roomId);

    let disposed = false;
    let offMsg = () => {};
    let offPresence = () => {};

    (async () => {
      try {
        await startAudio().catch(() => {});
        const transport = await createTransport(selfId);
        if (disposed) { transport.disconnect(); return; }
        transportRef.current = transport;

        offMsg = transport.on((msg) => {
          const s = useBattleStore.getState();
          switch (msg.t) {
            case 'start': s.applyStart(msg.config, msg.startAt, msg.questions); break;
            case 'answer': s.applyAnswerMsg(msg.playerId, msg.index, msg.points); break;
            case 'progress': s.applyProgress(msg.playerId, msg.index); break;
            case 'done': s.applyDone(msg.done); break;
            case 'rematch': s.applyRematch(msg.playerId); break;
            case 'bye': s.applyBye(msg.playerId); break;
          }
        });
        offPresence = transport.onPresence((roster) => {
          useBattleStore.getState().setRoster(roster);
        });

        await transport.connect(roomId, { id: selfId, nick, joinedAt: Date.now() });
        if (disposed) { transport.disconnect(); return; }
        useBattleStore.getState().setPhase('lobby');
      } catch (e) {
        if (!disposed) useBattleStore.getState().setError((e as Error)?.message ?? '연결 실패');
      }
    })();

    return () => {
      disposed = true;
      offMsg(); offPresence();
      clearTimers();
      stopAllAudio();
      transportRef.current?.disconnect();
      transportRef.current = null;
      connectedRef.current = false;
      useBattleStore.getState().reset();
    };
  }, [roomId]);

  // ─── Phase-driven navigation ─────────────────────────────────────────────────
  const phase = useBattleStore((s) => s.phase);
  useEffect(() => {
    if (!roomId) return;
    if (phase === 'countdown' || phase === 'question' || phase === 'feedback' || phase === 'finished') {
      navigate(`/battle/room/${roomId}/play`, { replace: true });
    } else if (phase === 'results') {
      navigate(`/battle/room/${roomId}/results`, { replace: true });
    } else if (phase === 'lobby' || phase === 'connecting') {
      navigate(`/battle/room/${roomId}/lobby`, { replace: true });
    }
  }, [phase, roomId]);

  // ─── Countdown → first question ──────────────────────────────────────────────
  const startAt = useBattleStore((s) => s.startAt);
  useEffect(() => {
    if (phase !== 'countdown' || !startAt) return;
    const wait = Math.max(0, startAt - Date.now());
    const id = setTimeout(() => useBattleStore.getState().beginQuestions(), wait);
    return () => clearTimeout(id);
  }, [phase, startAt]);

  // ─── Per-question playback + deadline ────────────────────────────────────────
  const index = useBattleStore((s) => s.index);
  useEffect(() => {
    if (phase !== 'question') return;
    const s = useBattleStore.getState();
    const q = s.questions[s.index];
    const cfg = s.config;
    if (!q || !cfg) return;
    clearTimers();
    playBattleQuestion(q, true).catch(() => {});
    addTimer(() => timeoutAnswer(), cfg.perQuestionMs);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  // ─── Feedback → advance / finish ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'feedback') return;
    addTimer(() => advanceOrFinish(), FEEDBACK_MS);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  // ─── Rematch: host restarts once everyone has voted ──────────────────────────
  const rematchVotes = useBattleStore((s) => s.rematchVotes);
  useEffect(() => {
    const s = useBattleStore.getState();
    if (s.phase !== 'results' || !s.isHost() || !s.config) return;
    const everyone = s.roster.length >= 2 && s.roster.every((p) => rematchVotes[p.id]);
    if (everyone) startBattle(s.config);
  }, [rematchVotes, phase]);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  function startBattle(config: BattleConfig) {
    const transport = transportRef.current;
    if (!transport) return;
    const questions = generateBattleQuestions(config.mode, config.level, config.questionCount);
    const startAtTs = Date.now() + COUNTDOWN_MS;
    transport.send({ t: 'start', v: 1, config, startAt: startAtTs, questions });
    useBattleStore.getState().applyStart(config, startAtTs, questions);
  }

  function submitAnswer(value: string) {
    const s = useBattleStore.getState();
    if (s.phase !== 'question' || s.selfAnswered || !s.config) return;
    const q = s.questions[s.index];
    if (!q) return;
    const result = judge(q, value as never);
    const ms = Date.now() - s.questionStart;
    const points = scoreAnswer(result.correct, ms, s.config.perQuestionMs);
    s.recordSelfAnswer(result.correct, result.correctAnswer, ms);
    stopAllAudio();
    transportRef.current?.send({
      t: 'answer', playerId: s.selfId, index: s.index,
      correct: result.correct, points, ms,
    });
  }

  function timeoutAnswer() {
    const s = useBattleStore.getState();
    if (s.phase !== 'question' || s.selfAnswered || !s.config) return;
    const q = s.questions[s.index];
    if (!q) return;
    const result = judge(q, '' as never);
    const ms = s.config.perQuestionMs;
    s.recordSelfAnswer(false, result.correctAnswer, ms);
    stopAllAudio();
    transportRef.current?.send({
      t: 'answer', playerId: s.selfId, index: s.index, correct: false, points: 0, ms,
    });
  }

  function advanceOrFinish() {
    const s = useBattleStore.getState();
    const hasNext = s.advance();
    if (!hasNext) {
      const done = s.finishSelf();
      transportRef.current?.send({ t: 'done', done });
    }
  }

  function voteRematch() {
    const s = useBattleStore.getState();
    s.voteRematch();
    transportRef.current?.send({ t: 'rematch', playerId: s.selfId });
  }

  function leaveBattle() {
    const s = useBattleStore.getState();
    transportRef.current?.send({ t: 'bye', playerId: s.selfId, reason: 'left' });
    navigate('/battle', { replace: true });
  }

  const api: BattleApi = { startBattle, submitAnswer, leaveBattle, voteRematch };
  return (
    <BattleContext.Provider value={api}>
      <Outlet />
    </BattleContext.Provider>
  );
}
