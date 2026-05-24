import React from 'react';
import { useDesign } from '../../theme/useDesign';
import type { ModeInfo } from '../../modes/registry';
import type { ModeKey } from '../../types';
import { SetupDefault } from './shells/SetupDefault';
import { SetupG } from './shells/SetupG';
import { SetupI } from './shells/SetupI';
import { SetupJ } from './shells/SetupJ';
import { SetupM } from './shells/SetupM';

export interface TrainSetupProps {
  modeKey: ModeKey;
  modeInfo: ModeInfo;
  isWeakSession: boolean;
  totalQuestions: number;
  questionOptions: number[];
  setTotalQuestions: (n: number) => void;
  level: number;
  setLevel: (n: number) => void;
  showAbsoluteToggle: boolean;
  absoluteMode: boolean;
  setAbsoluteMode: (v: boolean) => void;
  isProgression: boolean;
  progressionSource: 'diatonic' | 'praise';
  setProgressionSource: (s: 'diatonic' | 'praise') => void;
  loading: boolean;
  onStart: () => void;
  onBack: () => void;
}

// Per-direction Train setup screen. Train.tsx owns all session state and passes
// it down; only presentation differs by theme. default keeps the classic layout.
export function TrainSetup(props: TrainSetupProps) {
  const design = useDesign();
  switch (design) {
    case 'g':
      return <SetupG {...props} />;
    case 'i':
      return <SetupI {...props} />;
    case 'j':
      return <SetupJ {...props} />;
    case 'm':
      return <SetupM {...props} />;
    default:
      return <SetupDefault {...props} />;
  }
}
