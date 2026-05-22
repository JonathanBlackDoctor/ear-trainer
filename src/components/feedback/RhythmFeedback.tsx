import React from 'react';
import type { RhythmJudgeDetails } from '../../engine/judge';

interface Props {
  details: RhythmJudgeDetails;
}

export function RhythmFeedback({ details }: Props) {
  const { toleranceMs, perTap, avgAbsOffsetMs } = details;
  if (perTap.length === 0) return null;

  // Visual scale: clamp bar height to 3× tolerance so outliers don't break layout.
  const visualHalfRangeMs = Math.max(toleranceMs * 3, ...perTap.map((p) => Math.abs(p.offsetMs)));

  // Verbal consistency rating.
  const consistencyLabel =
    avgAbsOffsetMs <= toleranceMs ? '매우 정확'
    : avgAbsOffsetMs <= toleranceMs * 2 ? '약간 빗나감'
    : '많이 빗나감';
  const consistencyColor =
    avgAbsOffsetMs <= toleranceMs ? 'text-emerald-700'
    : avgAbsOffsetMs <= toleranceMs * 2 ? 'text-amber-700'
    : 'text-red-700';

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
      <div className="text-xs text-slate-600 text-center">
        평균 오차 <b className="tabular-nums">{Math.round(avgAbsOffsetMs)}ms</b>
        {' · '}허용 ±{toleranceMs}ms
        {' · '}<span className={`font-semibold ${consistencyColor}`}>{consistencyLabel}</span>
      </div>

      <div>
        <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
          <span>탭별 타이밍 (격자 기준)</span>
          <span className="text-slate-400">총 {perTap.length}개</span>
        </div>
        <div className="relative h-20 bg-slate-50 rounded border border-slate-200 overflow-hidden">
          {/* Tolerance band */}
          <div
            className="absolute left-0 right-0 bg-emerald-100/70"
            style={{
              top: `${50 - (toleranceMs / visualHalfRangeMs) * 50}%`,
              height: `${(toleranceMs / visualHalfRangeMs) * 100}%`,
            }}
          />
          {/* Target line (center) */}
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-400" />
          {/* Bars */}
          <div className="absolute inset-0 flex items-stretch justify-around px-1">
            {perTap.map((p) => {
              const pct = Math.max(-1, Math.min(1, p.offsetMs / visualHalfRangeMs));
              const heightPct = Math.abs(pct) * 50;
              return (
                <div key={p.idx} className="flex-1 flex flex-col justify-center mx-0.5 relative">
                  <div
                    className={`absolute left-0 right-0 mx-auto rounded-sm ${
                      p.ok ? 'bg-emerald-500' : 'bg-red-400'
                    }`}
                    style={
                      pct >= 0
                        ? { bottom: '50%', height: `${heightPct}%`, width: '70%' }
                        : { top: '50%', height: `${heightPct}%`, width: '70%' }
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-1 flex justify-around gap-1 text-[10px] tabular-nums">
          {perTap.map((p) => (
            <span
              key={p.idx}
              className={`flex-1 text-center ${p.ok ? 'text-emerald-700' : 'text-red-600'}`}
            >
              {p.offsetMs > 0 ? '+' : ''}{Math.round(p.offsetMs)}
            </span>
          ))}
        </div>
        <div className="mt-1 text-[10px] text-slate-400 text-center">
          + 늦음 · − 빠름
        </div>
      </div>
    </div>
  );
}
