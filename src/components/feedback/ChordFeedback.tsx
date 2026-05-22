import React from 'react';
import type { ChordJudgeDetails } from '../../engine/judge';
import { chordLabel } from '../../theory/chords';

interface Props {
  details: ChordJudgeDetails;
}

export function ChordFeedback({ details }: Props) {
  const { userQuality, correctQuality, root, notes, thirdDiffers, fifthDiffers, seventhDiffers } = details;
  const isCorrect = userQuality === correctQuality;

  // Build a list of "what differs" pills. Empty list when correct.
  const diffs: { label: string; explanation: string }[] = [];
  if (thirdDiffers)   diffs.push({ label: '3음', explanation: '장/단 3도가 달라요' });
  if (fifthDiffers)   diffs.push({ label: '5음', explanation: '완전/감/증 5도가 달라요' });
  if (seventhDiffers) diffs.push({ label: '7음', explanation: '7음 유무 또는 장/단 7도가 달라요' });

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">정답</div>
          <div className="font-bold text-emerald-700">{chordLabel(correctQuality)}</div>
          <div className="text-[10px] text-slate-400">{root.replace(/\d+$/, '')} {correctQuality}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">내 답</div>
          <div className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {chordLabel(userQuality)}
          </div>
          <div className="text-[10px] text-slate-400">{root.replace(/\d+$/, '')} {userQuality}</div>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center font-mono">
        구성음 {notes.join(' · ')}
      </div>

      {!isCorrect && diffs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">차이</div>
          <div className="flex flex-wrap gap-1.5">
            {diffs.map((d) => (
              <span
                key={d.label}
                className="inline-flex items-center gap-1 text-[11px] bg-white border border-amber-300 text-amber-800 rounded-full px-2 py-0.5"
                title={d.explanation}
              >
                <span className="font-semibold">{d.label}</span>
                <span className="text-amber-600">·</span>
                <span>{d.explanation}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
