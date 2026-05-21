import React from 'react';

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
}

export function ChoiceGrid({
  options,
  selected,
  correct,
  answered = false,
  onSelect,
  columns = 2,
  disabled = false,
}: ChoiceGridProps) {
  function btnClass(value: string): string {
    const base = 'relative choice-btn py-4 px-2 text-lg min-h-[64px] touch-manipulation';
    if (answered) {
      if (value === correct) return `${base} choice-btn-correct`;
      if (value === selected && value !== correct) return `${base} choice-btn-wrong`;
      return `${base} opacity-50`;
    }
    if (value === selected) return `${base} choice-btn-selected`;
    return base;
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={btnClass(opt.value)}
          onClick={() => !disabled && !answered && onSelect(opt.value)}
          disabled={disabled || (answered && opt.value !== correct && opt.value !== selected)}
        >
          <span className="block font-bold">{opt.label}</span>
          {opt.sublabel && (
            <span className="block text-sm font-normal opacity-70 mt-0.5">{opt.sublabel}</span>
          )}
          {answered && opt.value === correct && (
            <span className="absolute top-1 right-2 text-emerald-500 text-lg">✓</span>
          )}
          {answered && opt.value === selected && opt.value !== correct && (
            <span className="absolute top-1 right-2 text-red-500 text-lg">✗</span>
          )}
        </button>
      ))}
    </div>
  );
}
