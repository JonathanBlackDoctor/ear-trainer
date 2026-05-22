import React from 'react';
import type { SolfegeJudgeDetails } from '../../engine/judge';
import type { ModeStats } from '../../types';

interface Props {
  details: SolfegeJudgeDetails;
  modeStats?: ModeStats;
}

// Find the most-confused syllable when the user has been getting `correct` wrong.
// `modeStats` stores items keyed by syllable (e.g. "do", "re", ...). We can't
// directly know past wrong answers, so we use recent miss-rate as a proxy.
function topConfusion(modeStats: ModeStats | undefined, syllable: string): { otherSyllable: string; missRate: number } | null {
  if (!modeStats) return null;
  const item = modeStats[syllable];
  if (!item || item.attempts < 4) return null;
  const acc = item.correct / item.attempts;
  if (acc >= 0.7) return null;
  // Adjacent syllables in the major scale that are most commonly confused.
  const ADJACENT: Record<string, string> = {
    do: 're', re: 'do', mi: 'fa', fa: 'mi', sol: 'la', la: 'sol', ti: 'do',
  };
  const other = ADJACENT[syllable];
  if (!other) return null;
  return { otherSyllable: other, missRate: 1 - acc };
}

export function SolfegeFeedback({ details, modeStats }: Props) {
  const { userSyllable, correctSyllable, scaleDegree, note, key } = details;
  const isCorrect = userSyllable === correctSyllable;
  const confusion = topConfusion(modeStats, correctSyllable);

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-sm">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">정답</div>
          <div className="font-bold text-emerald-700">{correctSyllable}</div>
          <div className="text-[10px] text-slate-400">{key}장조 {scaleDegree > 0 ? `${scaleDegree}도` : '반음'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">실음</div>
          <div className="font-bold text-slate-700 font-mono">{note}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">내 답</div>
          <div className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {userSyllable || '—'}
          </div>
        </div>
      </div>

      {confusion && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          💡 최근 {correctSyllable}을(를) {confusion.otherSyllable}와 자주 헷갈리고 있어요
          (오답률 {Math.round(confusion.missRate * 100)}%).
        </div>
      )}
    </div>
  );
}
