import React from 'react';
import type { ProgressionJudgeDetails } from '../../engine/judge';
import { formatDegree } from '../../modes/progressionMode';

interface Props {
  details: ProgressionJudgeDetails;
  notation: 'roman' | 'number';
}

function formatStep(degree: number | undefined, quality: string | undefined, notation: 'roman' | 'number'): string {
  if (degree === undefined || quality === undefined) return '—';
  return formatDegree(degree, quality, notation);
}

export function ProgressionFeedback({ details, notation }: Props) {
  const { steps } = details;
  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">단계별 정답 비교</div>
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-2 gap-y-1 text-xs items-center">
        <div className="text-slate-400 font-semibold pb-1">#</div>
        <div className="text-slate-400 font-semibold pb-1">정답</div>
        <div className="text-slate-400 font-semibold pb-1">내 답</div>
        <div className="text-slate-400 font-semibold pb-1 text-center">결과</div>
        {steps.map((s) => {
          const correctText = formatStep(s.expected.degree, s.expected.quality, notation);
          const givenText = formatStep(s.given?.degree, s.given?.quality, notation);
          return (
            <React.Fragment key={s.idx}>
              <div className="text-slate-400 tabular-nums">{s.idx + 1}</div>
              <div className="font-semibold text-emerald-700">{correctText}</div>
              <div className={`font-semibold ${s.fullOk ? 'text-emerald-700' : 'text-red-600'}`}>
                {givenText}
              </div>
              <div className="text-center">
                {s.fullOk ? (
                  <span className="text-emerald-500 font-bold">✓</span>
                ) : (
                  <span className="text-red-500 font-bold">✗</span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
