import React, { useEffect, useRef } from 'react';
import type { ChoiceOption } from './ChoiceGrid';

interface MultiChoiceGridProps {
  options: ChoiceOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  columns?: 2 | 3 | 4;
  disabled?: boolean;
  answered?: boolean;
  /** Feedback phase: every correct value turns green, wrong picks turn red. */
  correctValues?: string[];
  /** Optional ARIA label for the group (e.g. "계이름 선택"). */
  ariaLabel?: string;
}

/**
 * Multi-select sibling of ChoiceGrid (which is single-select radiogroup
 * semantics used by every other choice mode). Tapping toggles an option;
 * number keys (1–9) toggle too. The parent decides when the selection is
 * complete and submits.
 */
export function MultiChoiceGrid({
  options,
  selectedValues,
  onToggle,
  columns = 2,
  disabled = false,
  answered = false,
  correctValues = [],
  ariaLabel,
}: MultiChoiceGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
        onToggle(options[n - 1].value);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, answered, options, onToggle]);

  function btnClass(value: string): string {
    const base = 'relative choice-btn py-4 px-2 text-lg min-h-[64px] touch-manipulation focus-ring';
    if (answered) {
      if (correctValues.includes(value)) return `${base} choice-btn-correct`;
      if (selectedValues.includes(value)) return `${base} choice-btn-wrong`;
      return `${base} opacity-50`;
    }
    if (selectedValues.includes(value)) return `${base} choice-btn-selected`;
    return base;
  }

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

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel ?? '답안 선택 (복수)'}
      className={`grid ${gridCols} gap-3`}
    >
      {options.map((opt, idx) => {
        const isSelected = selectedValues.includes(opt.value);
        const isCorrect = answered && correctValues.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${idx + 1}. ${opt.label}${opt.sublabel ? `, ${opt.sublabel}` : ''}`}
            className={btnClass(opt.value)}
            onClick={() => !disabled && !answered && onToggle(opt.value)}
            onKeyDown={(e) => handleKeyNav(e, idx)}
            disabled={disabled || (answered && !isCorrect && !isSelected)}
            tabIndex={answered ? -1 : idx === 0 ? 0 : -1}
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
            {answered && isSelected && !isCorrect && (
              <span className="absolute top-1 right-2 text-red-500 text-lg" aria-hidden>✗</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
