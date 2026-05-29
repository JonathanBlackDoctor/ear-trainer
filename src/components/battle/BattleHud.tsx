import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Question deadline timestamp (ms). */
  deadline: number;
  perQuestionMs: number;
  index: number;
  total: number;
  paused?: boolean;
}

// A per-question countdown bar + "Q n/total" label. Drives a smooth shrinking
// bar via requestAnimationFrame.
export function BattleHud({ deadline, perQuestionMs, index, total, paused }: Props) {
  const [ratio, setRatio] = useState(1);
  const raf = useRef<number>();

  useEffect(() => {
    if (paused) return;
    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now());
      setRatio(remaining / perQuestionMs);
      if (remaining > 0) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [deadline, perQuestionMs, paused]);

  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  const danger = ratio < 0.3;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-slate-500">
        <span>Q {Math.min(index + 1, total)}/{total}</span>
        <span className={danger ? 'text-red-600' : ''}>{Math.ceil((deadline - Date.now()) / 1000)}s</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${danger ? 'bg-red-500' : 'bg-primary-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
