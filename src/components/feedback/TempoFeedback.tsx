import React from 'react';
import type { TempoJudgeDetails } from '../../engine/judge';

interface Props {
  details: TempoJudgeDetails;
}

// Tempo feedback was the original "rich feedback" prototype that lived inline
// in Train.tsx. It's been hoisted here so every mode shares the same dispatch
// path through `<ModeFeedback>`. Logic unchanged.
export function TempoFeedback({ details }: Props) {
  const {
    targetBpm, userBpm, bpmDelta, deviationPct, tolerancePct,
    intervalBpms, jitterPct,
  } = details;

  const tolBpm = targetBpm * tolerancePct;
  const visualHalfRangeBpm = Math.max(tolBpm * 3, Math.abs(bpmDelta) + tolBpm);
  const inTolerance = (bpm: number) => Math.abs(bpm - targetBpm) / targetBpm <= tolerancePct;

  const fastSlowLabel =
    Math.abs(bpmDelta) < 0.5 ? '딱 맞음'
    : bpmDelta > 0 ? `${bpmDelta.toFixed(1)} BPM 빠름`
    : `${Math.abs(bpmDelta).toFixed(1)} BPM 느림`;

  const consistencyLabel =
    jitterPct <= tolerancePct ? '매우 안정'
    : jitterPct <= tolerancePct * 2 ? '약간 흔들림'
    : '많이 흔들림';
  const consistencyColor =
    jitterPct <= tolerancePct ? 'text-emerald-700'
    : jitterPct <= tolerancePct * 2 ? 'text-amber-700'
    : 'text-red-700';

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">목표</div>
          <div className="text-lg font-bold text-slate-800 tabular-nums">
            {Math.round(targetBpm)}
          </div>
          <div className="text-[10px] text-slate-400">BPM</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">내 템포</div>
          <div className={`text-lg font-bold tabular-nums ${
            deviationPct <= tolerancePct ? 'text-emerald-700' : 'text-red-700'
          }`}>
            {userBpm.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-400">BPM</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">편차</div>
          <div className={`text-lg font-bold tabular-nums ${
            deviationPct <= tolerancePct ? 'text-emerald-700' : 'text-red-700'
          }`}>
            {bpmDelta >= 0 ? '+' : ''}{bpmDelta.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-400">
            {(deviationPct * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 text-center">
        평균 <b>{fastSlowLabel}</b>
        {' · '}
        허용 ±{(tolerancePct * 100).toFixed(0)}%
        {' · '}
        일관성 <span className={`font-semibold ${consistencyColor}`}>{consistencyLabel}</span>
        {' '}
        <span className="text-slate-400">(흔들림 {(jitterPct * 100).toFixed(1)}%)</span>
      </div>

      <div>
        <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
          <span>탭별 BPM 변동</span>
          <span className="text-slate-400">총 {intervalBpms.length}개 간격</span>
        </div>
        <div className="relative h-20 bg-slate-50 rounded border border-slate-200 overflow-hidden">
          <div
            className="absolute left-0 right-0 bg-emerald-100/70"
            style={{
              top: `${50 - (tolBpm / visualHalfRangeBpm) * 50}%`,
              height: `${(tolBpm / visualHalfRangeBpm) * 100}%`,
            }}
          />
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-400" />
          <div className="absolute inset-0 flex items-stretch justify-around px-1">
            {intervalBpms.map((bpm, i) => {
              const offsetBpm = bpm - targetBpm;
              const pct = Math.max(-1, Math.min(1, offsetBpm / visualHalfRangeBpm));
              const heightPct = Math.abs(pct) * 50;
              const isOk = inTolerance(bpm);
              return (
                <div key={i} className="flex-1 flex flex-col justify-center mx-0.5 relative">
                  <div
                    className={`absolute left-0 right-0 mx-auto rounded-sm ${
                      isOk ? 'bg-emerald-500' : 'bg-red-400'
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
          {intervalBpms.map((bpm, i) => (
            <span
              key={i}
              className={`flex-1 text-center ${
                inTolerance(bpm) ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {bpm.toFixed(0)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
