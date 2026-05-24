import React from 'react';
import type { Question, AnswerValue, ModeStats } from '../../types';
import type { JudgeResult } from '../../engine/judge';
import { IntervalFeedback } from './IntervalFeedback';
import { ChordFeedback } from './ChordFeedback';
import { ProgressionFeedback } from './ProgressionFeedback';
import { MelodyFeedback } from './MelodyFeedback';
import { SolfegeFeedback } from './SolfegeFeedback';
import { RhythmFeedback } from './RhythmFeedback';
import { TempoFeedback } from './TempoFeedback';
import { BpmFeedback } from './BpmFeedback';
import { LabFeedback } from './LabFeedback';
import { MixFeedback } from './MixFeedback';

export interface ModeFeedbackProps {
  question: Question;
  userAnswer: AnswerValue | null;
  result: JudgeResult;
  // Per-mode stats (for the current mode) — used to surface confusion hints
  // ("최근 P5를 P4로 자주 헷갈렸어요").
  modeStats?: ModeStats;
  notation: 'roman' | 'number';
}

export function ModeFeedback(props: ModeFeedbackProps) {
  const { question, result } = props;
  const d = result.details;
  if (!d) return null;

  switch (d.kind) {
    case 'interval':
      return <IntervalFeedback {...props} details={d} />;
    case 'chord':
      return <ChordFeedback {...props} details={d} />;
    case 'progression':
      return <ProgressionFeedback {...props} details={d} />;
    case 'melody':
      return <MelodyFeedback {...props} details={d} />;
    case 'solfege':
      return <SolfegeFeedback {...props} details={d} />;
    case 'rhythm':
      return <RhythmFeedback {...props} details={d} />;
    case 'tempo':
      return <TempoFeedback details={d} />;
    case 'bpm':
      return <BpmFeedback {...props} details={d} />;
    case 'lab':
      return <LabFeedback {...props} details={d} />;
    case 'mix':
      return <MixFeedback {...props} details={d} />;
    default:
      // Exhaustiveness — TS will catch missing cases at compile time.
      void question;
      return null;
  }
}
