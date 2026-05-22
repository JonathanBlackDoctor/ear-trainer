import React from 'react';

// Combo escalation thresholds. The overlay only renders at >=3 — below that
// we don't want to spam visuals after every other answer.
interface ComboTier {
  min: number;
  label: string;
  emoji: string;
  bg: string;     // background color class
  text: string;   // foreground class
}

const COMBO_TIERS: ComboTier[] = [
  { min: 20, label: '20연속!', emoji: '👑', bg: 'bg-purple-500',  text: 'text-white' },
  { min: 10, label: '10연속!', emoji: '💎', bg: 'bg-cyan-500',    text: 'text-white' },
  { min: 5,  label: '5연속!',  emoji: '⚡', bg: 'bg-amber-400',   text: 'text-amber-950' },
  { min: 3,  label: '3연속!',  emoji: '🔥', bg: 'bg-orange-500',  text: 'text-white' },
];

function tierFor(combo: number): ComboTier | null {
  for (const t of COMBO_TIERS) if (combo >= t.min) return t;
  return null;
}

export interface ComboOverlayProps {
  combo: number;
}

export function ComboOverlay({ combo }: ComboOverlayProps) {
  const tier = tierFor(combo);
  if (!tier) return null;
  return (
    <div
      // `key={combo}` retriggers the bounce-in keyframe on every new milestone
      key={combo}
      role="status"
      aria-label={`${combo} 연속 정답`}
      className={`flex items-center justify-center gap-2 ${tier.bg} ${tier.text}
        font-bold text-base rounded-full px-4 py-2 shadow-lifted mx-auto w-fit
        animate-bounce-in motion-reduce:animate-none`}
    >
      <span className="text-xl" aria-hidden>{tier.emoji}</span>
      <span>{tier.label}</span>
      <span className="tabular-nums opacity-80">×{combo}</span>
    </div>
  );
}
