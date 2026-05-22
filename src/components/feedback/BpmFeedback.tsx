import React from 'react';
import type { BpmJudgeDetails } from '../../engine/judge';

interface Props {
  details: BpmJudgeDetails;
}

export function BpmFeedback({ details }: Props) {
  const { targetBpm, userBpm, bpmDelta, perceptualHint } = details;
  const ok = Math.abs(bpmDelta) <= 3;

  const directionLabel =
    Math.abs(bpmDelta) < 1 ? '딱 맞음'
    : bpmDelta > 0 ? `${bpmDelta} BPM 빠르게 추측` : `${Math.abs(bpmDelta)} BPM 느리게 추측`;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-sm">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">실제 BPM</div>
          <div className="text-lg font-bold text-emerald-700 tabular-nums">{Math.round(targetBpm)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">내 추측</div>
          <div className={`text-lg font-bold tabular-nums ${ok ? 'text-emerald-700' : 'text-red-600'}`}>
            {Math.round(userBpm)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">차이</div>
          <div className={`text-lg font-bold tabular-nums ${ok ? 'text-emerald-700' : 'text-red-600'}`}>
            {bpmDelta > 0 ? '+' : ''}{Math.round(bpmDelta)}
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-600 text-center">
        {directionLabel}
        <span className="text-slate-400"> · </span>
        <span className="text-slate-500 italic">{perceptualHint}</span>
      </div>
    </div>
  );
}
