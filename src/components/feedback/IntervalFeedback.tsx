import React from 'react';
import type { IntervalJudgeDetails } from '../../engine/judge';
import type { ModeStats } from '../../types';

interface Props {
  details: IntervalJudgeDetails;
  modeStats?: ModeStats;
}

const DIRECTION_LABEL: Record<IntervalJudgeDetails['direction'], string> = {
  up: '상행', down: '하행', harmonic: '화성',
};

// Surface a "you tend to confuse X with Y" hint when there's a pattern.
// We look at items whose itemKey starts with the correct interval (e.g. "P5_up")
// and whose recent window has many wrongs — if the user has been struggling
// specifically with this interval lately, tell them.
function confusionHint(modeStats: ModeStats | undefined, correctName: string, userName: string): string | null {
  if (!modeStats || userName === correctName) return null;
  // Aggregate across all itemKeys that start with the correct interval's short
  // name (e.g. "P5_harmonic", "P5_up"). If recent accuracy on this interval
  // is poor, surface the user's most recent wrong guess pattern.
  const relevant = Object.entries(modeStats).filter(([k]) => k.startsWith(correctName + '_'));
  if (relevant.length === 0) return null;
  let attempts = 0;
  let correct = 0;
  for (const [, item] of relevant) {
    attempts += item.attempts;
    correct += item.correct;
  }
  if (attempts < 4) return null;
  const accuracy = correct / attempts;
  if (accuracy >= 0.7) return null;
  return `최근 ${correctName} 정답률이 ${Math.round(accuracy * 100)}%예요. 이번에 ${userName}로 들으셨네요.`;
}

export function IntervalFeedback({ details, modeStats }: Props) {
  const { userName, userLabel, correctName, correctLabel, semitones, direction, notes, semitoneDelta } = details;
  const isCorrect = userName === correctName;
  const hint = confusionHint(modeStats, correctName, userName);

  // Direction-aware verbal description of what was played.
  const noteText =
    notes.length >= 2
      ? direction === 'harmonic'
        ? `${notes[0]} + ${notes[1]} (동시)`
        : `${notes[0]} → ${notes[1]}`
      : '';

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-sm">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">정답</div>
          <div className="font-bold text-emerald-700">{correctName}</div>
          <div className="text-[10px] text-slate-400">{correctLabel}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">반음 수</div>
          <div className="font-bold text-slate-700 tabular-nums">{semitones}</div>
          <div className="text-[10px] text-slate-400">{DIRECTION_LABEL[direction]}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">내 답</div>
          <div className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {userName || '—'}
          </div>
          <div className="text-[10px] text-slate-400">
            {!isCorrect && semitoneDelta !== 0
              ? `${semitoneDelta > 0 ? '+' : ''}${semitoneDelta} 반음`
              : userLabel}
          </div>
        </div>
      </div>

      {noteText && (
        <div className="text-xs text-slate-500 text-center font-mono">{noteText}</div>
      )}

      {hint && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          💡 {hint}
        </div>
      )}
    </div>
  );
}
