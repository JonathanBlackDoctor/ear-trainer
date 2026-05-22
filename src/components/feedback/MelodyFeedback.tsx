import React from 'react';
import type { MelodyJudgeDetails } from '../../engine/judge';

interface Props {
  details: MelodyJudgeDetails;
}

export function MelodyFeedback({ details }: Props) {
  const { perNote } = details;
  if (perNote.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">음별 비교</div>
      <div className="flex flex-wrap gap-1.5">
        {perNote.map((p) => (
          <div
            key={p.idx}
            className={`text-[11px] rounded-md border px-2 py-1 ${
              p.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="font-mono font-semibold">{p.expected || '—'}</div>
            {!p.ok && (
              <div className="text-[10px] text-slate-500 font-mono">
                {p.given ? p.given : '?'}
                {p.given && p.semitoneDelta !== 0 && (
                  <span className="ml-1 text-red-500">
                    ({p.semitoneDelta > 0 ? '+' : ''}{p.semitoneDelta}st)
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
