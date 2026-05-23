import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LAB_SCALE_MODE_INFO, LAB_CADENCE_MODE_INFO,
  LAB_KEY_MODE_INFO, LAB_INVERSION_MODE_INFO,
  LAB_INTERVAL_COMPARE_MODE_INFO, LAB_ODD_NOTE_MODE_INFO, LAB_CONTOUR_MODE_INFO,
  LAB_TUNING_MODE_INFO, LAB_FUNCTION_MODE_INFO, LAB_EXTENDED_MODE_INFO,
  LAB_BASS_MODE_INFO, LAB_TENSION_MODE_INFO,
} from '../modes/labModes';
import type { ModeKey } from '../types';

const SUB_MODES = [
  LAB_SCALE_MODE_INFO,
  LAB_CADENCE_MODE_INFO,
  LAB_KEY_MODE_INFO,
  LAB_INVERSION_MODE_INFO,
  LAB_INTERVAL_COMPARE_MODE_INFO,
  LAB_ODD_NOTE_MODE_INFO,
  LAB_CONTOUR_MODE_INFO,
  LAB_TUNING_MODE_INFO,
  LAB_FUNCTION_MODE_INFO,
  LAB_EXTENDED_MODE_INFO,
  LAB_BASS_MODE_INFO,
  LAB_TENSION_MODE_INFO,
];

export function Lab() {
  const navigate = useNavigate();

  function startSubMode(key: ModeKey) {
    navigate(`/train/${key}`);
  }

  return (
    <div className="min-h-screen bg-canvas-50 pb-10">
      <header className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-8">
          <button
            className="text-primary-200 text-sm mb-3 active:text-white"
            onClick={() => navigate('/')}
          >
            ← 뒤로
          </button>
          <div className="flex items-center gap-2 text-accent-300 text-xs font-semibold tracking-widest uppercase mb-2">
            <span className="inline-block w-6 h-px bg-accent-300"></span>
            Lab
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            🧪 실험실
          </h1>
          <p className="text-sm text-primary-200 mt-2">
            다양한 음악 식별 훈련을 시도해보세요
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 -mt-6">
        <div className="grid grid-cols-2 gap-3">
          {SUB_MODES.map((m) => (
            <button
              key={m.key}
              className="mode-card accent-interval"
              onClick={() => startSubMode(m.key)}
            >
              <div className="text-3xl mb-2 mt-1">{m.emoji}</div>
              <div className="font-semibold text-primary-900 text-sm leading-tight">
                {m.name}
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-snug">
                {m.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
