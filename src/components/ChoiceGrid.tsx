import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface ChoiceOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface ChoiceGridProps {
  options: ChoiceOption[];
  selected?: string;
  correct?: string;
  answered?: boolean;
  onSelect: (value: string) => void;
  columns?: 2 | 3 | 4;
  disabled?: boolean;
  /** Optional ARIA label for the radiogroup (e.g. "인터벌 보기"). */
  ariaLabel?: string;
  /**
   * When true, the first tap arms an option (highlight) and a second tap on it
   * submits — guards against fat-finger mis-taps. The parent should give the
   * grid a per-question `key` so the armed state resets between questions.
   */
  requireConfirm?: boolean;
}

/**
 * Choice grid with proper radiogroup semantics + keyboard support:
 *   • Number keys (1–9) jump straight to that option.
 *   • Arrow keys move focus between options without selecting.
 *   • Space / Enter selects the focused option.
 */
export function ChoiceGrid({
  options,
  selected,
  correct,
  answered = false,
  onSelect,
  columns = 2,
  disabled = false,
  ariaLabel,
  requireConfirm = false,
}: ChoiceGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // The armed-but-not-submitted option when requireConfirm is on.
  const [pending, setPending] = useState<string | null>(null);

  // Single selection entry point: instant submit, or arm→confirm when
  // requireConfirm is on (a second press on the armed option submits).
  const choose = useCallback((value: string) => {
    if (!requireConfirm) { onSelect(value); return; }
    setPending((cur) => {
      if (cur === value) { onSelect(value); return null; }
      return value;
    });
  }, [requireConfirm, onSelect]);

  // Global number-key shortcuts (1..9). Skip while disabled/answered.
  useEffect(() => {
    if (disabled || answered) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      }
      const n = parseInt(e.key, 10);
      if (Number.isFinite(n) && n >= 1 && n <= options.length) {
        e.preventDefault();
        choose(options[n - 1].value);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, answered, options, choose]);

  function btnClass(value: string): string {
    const base = 'relative choice-btn py-4 px-2 text-lg min-h-[64px] touch-manipulation focus-ring';
    if (answered) {
      if (value === correct) return `${base} choice-btn-correct`;
      if (value === selected && value !== correct) return `${base} choice-btn-wrong`;
      return `${base} opacity-50`;
    }
    if (value === selected || value === pending) return `${base} choice-btn-selected`;
    return base;
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  function handleKeyNav(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    const last = options.length - 1;
    let next = -1;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = idx < last ? idx + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = idx > 0 ? idx - 1 : last;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
    }
    if (next >= 0) {
      e.preventDefault();
      const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('button');
      buttons?.[next]?.focus();
    }
  }

  return (
    <div>
      {requireConfirm && pending && !answered && (
        <div className="text-center text-xs font-semibold text-primary-600 mb-2" aria-live="polite">
          한 번 더 눌러 제출하세요
        </div>
      )}
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label={ariaLabel ?? '답안 선택'}
        className={`grid ${gridCols} gap-3`}
      >
      {options.map((opt, idx) => {
        const isSelected = opt.value === selected;
        const isCorrect = answered && opt.value === correct;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected || opt.value === pending}
            aria-label={`${idx + 1}. ${opt.label}${opt.sublabel ? `, ${opt.sublabel}` : ''}`}
            className={btnClass(opt.value)}
            onClick={() => !disabled && !answered && choose(opt.value)}
            onKeyDown={(e) => handleKeyNav(e, idx)}
            disabled={disabled || (answered && opt.value !== correct && opt.value !== selected)}
            tabIndex={answered ? -1 : isSelected || (selected === undefined && idx === 0) ? 0 : -1}
          >
            <span className="block font-bold">{opt.label}</span>
            {opt.sublabel && (
              <span className="block text-sm font-normal opacity-70 mt-0.5">{opt.sublabel}</span>
            )}
            {!answered && (
              <span className="absolute top-1 left-2 text-[10px] font-mono text-slate-400 tabular-nums">
                {idx + 1}
              </span>
            )}
            {isCorrect && (
              <span className="absolute top-1 right-2 text-emerald-500 text-lg" aria-hidden>✓</span>
            )}
            {answered && opt.value === selected && opt.value !== correct && (
              <span className="absolute top-1 right-2 text-red-500 text-lg" aria-hidden>✗</span>
            )}
          </button>
        );
      })}
      </div>
    </div>
  );
}
