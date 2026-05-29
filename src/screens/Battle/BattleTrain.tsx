import { useEffect, useState } from 'react';
import { useBattleStore } from '../../store/useBattleStore';
import { useBattle } from '../../battle/BattleProvider';
import { getBattleChoices } from '../../battle/choices';
import { ChoiceGrid } from '../../components/ChoiceGrid';
import { Scoreboard } from '../../components/battle/Scoreboard';
import { BattleHud } from '../../components/battle/BattleHud';
import { playBattleQuestion } from '../../audio/playBattleQuestion';
import { mixColumns } from '../../modes/mixModes';
import { MODE_REGISTRY } from '../../modes/registry';
import type { MixData } from '../../types';

function columnsFor(mode: string, level: number): 2 | 3 | 4 {
  if (mode === 'interval' || mode === 'chord') return 2;
  if (mode.startsWith('mix-')) return mixColumns(mode.replace(/^mix-/, '') as MixData['effect'], level);
  if (mode === 'lab-odd-note' || mode === 'lab-bass') return 4;
  if (mode === 'lab-inversion' || mode === 'lab-extended' || mode === 'lab-wide-interval' || mode === 'lab-note-stack') return 2;
  return 3;
}

export function BattleTrain() {
  const { submitAnswer } = useBattle();
  const phase = useBattleStore((s) => s.phase);
  const config = useBattleStore((s) => s.config);
  const index = useBattleStore((s) => s.index);
  const questions = useBattleStore((s) => s.questions);
  const questionStart = useBattleStore((s) => s.questionStart);
  const startAt = useBattleStore((s) => s.startAt);
  const selfAnswered = useBattleStore((s) => s.selfAnswered);
  const selfFeedback = useBattleStore((s) => s.selfFeedback);

  // Live countdown number during the lead-in.
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (phase !== 'countdown') return;
    const id = setInterval(() => setCountdown(Math.max(0, Math.ceil((startAt - Date.now()) / 1000))), 100);
    return () => clearInterval(id);
  }, [phase, startAt]);

  if (!config) return null;
  const q = questions[index];
  const total = config.questionCount;
  const info = MODE_REGISTRY[config.mode];

  // ─── Countdown ─────────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="text-slate-500">{info.emoji} {info.name} · Lv{config.level}</div>
        <div className="text-7xl font-bold text-primary-600 animate-pulse">{countdown || '시작!'}</div>
        <div className="text-slate-400">준비하세요!</div>
      </div>
    );
  }

  // ─── Finished (waiting for opponent) ──────────────────────────────────────────
  if (phase === 'finished') {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
        <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-6 flex-1 flex flex-col justify-center">
          <Scoreboard total={total} />
          <div className="text-center text-slate-500 animate-pulse">상대가 끝나기를 기다리는 중...</div>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const choices = getBattleChoices(config.mode, config.level);
  const deadline = questionStart + config.perQuestionMs;

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 py-4 space-y-4 flex-1">
        <Scoreboard total={total} />
        <BattleHud
          deadline={deadline}
          perQuestionMs={config.perQuestionMs}
          index={index}
          total={total}
          paused={phase === 'feedback'}
        />

        {/* Replay */}
        <div className="flex justify-center">
          <button
            className="btn-secondary px-6 py-3 text-base"
            onClick={() => playBattleQuestion(q, false)}
          >
            🔊 다시 듣기
          </button>
        </div>

        {/* Feedback banner */}
        {phase === 'feedback' && selfFeedback && (
          <div className={`card text-center ${selfFeedback.correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`font-bold ${selfFeedback.correct ? 'text-emerald-700' : 'text-red-700'}`}>
              {selfFeedback.correct ? `✅ 정답! +${selfFeedback.points}` : '❌ 오답'}
            </div>
          </div>
        )}

        {/* Choices */}
        <ChoiceGrid
          options={choices}
          selected={undefined}
          correct={phase === 'feedback' ? (selfFeedback?.correctAnswer as string) : undefined}
          answered={phase === 'feedback'}
          onSelect={(v) => { if (!selfAnswered) submitAnswer(v); }}
          columns={columnsFor(config.mode, config.level)}
          disabled={selfAnswered}
        />
      </div>
    </div>
  );
}
