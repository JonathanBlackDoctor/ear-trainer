import type { Question, AnswerValue, ProgressionAnswer } from '../types';

export interface JudgeResult {
  correct: boolean;
  partialScore: number;   // 0.0 – 1.0
  correctAnswer: AnswerValue;
}

/** Judge a user's answer against a question */
export function judge(question: Question, userAnswer: AnswerValue): JudgeResult {
  const correct = question.answer;

  switch (question.mode) {
    case 'interval':
    case 'chord':
    case 'solfege':
      // String comparison
      const isCorrect = (userAnswer as string) === (correct as string);
      return { correct: isCorrect, partialScore: isCorrect ? 1 : 0, correctAnswer: correct };

    case 'melody': {
      const ua = userAnswer as string[];
      const ca = correct as string[];
      if (ua.length !== ca.length) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const matches = ua.filter((n, i) => n === ca[i]).length;
      const score = matches / ca.length;
      return { correct: score === 1, partialScore: score, correctAnswer: correct };
    }

    case 'progression': {
      const ua = userAnswer as ProgressionAnswer[];
      const ca = correct as ProgressionAnswer[];
      if (!Array.isArray(ua) || ua.length !== ca.length) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const matches = ua.filter((a, i) =>
        a.degree === ca[i].degree && a.quality === ca[i].quality
      ).length;
      const score = matches / ca.length;
      return { correct: score === 1, partialScore: score, correctAnswer: correct };
    }

    case 'transpose': {
      // For melody transposition: compare note arrays
      const ua = userAnswer as string[];
      const ca = correct as string[];
      if (!Array.isArray(ua) || ua.length !== ca.length) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const matches = ua.filter((n, i) => n === ca[i]).length;
      const score = matches / ca.length;
      return { correct: score === 1, partialScore: score, correctAnswer: correct };
    }

    case 'rhythm': {
      // Rhythm judge: compare tap timestamps to expected beat positions
      const taps = userAnswer as number[];
      const expected = correct as number[];
      if (!Array.isArray(taps) || taps.length !== expected.length) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const TOLERANCE_MS = 120;
      const hits = taps.filter((t, i) => Math.abs(t - expected[i]) <= TOLERANCE_MS).length;
      const score = hits / expected.length;
      return { correct: score >= 0.8, partialScore: score, correctAnswer: correct };
    }

    case 'tempo': {
      // Tempo hold: compute average inter-tap interval → BPM, compare to target.
      const taps = userAnswer as number[];
      const targetBpm = correct as number;
      if (!Array.isArray(taps) || taps.length < 2) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
      const meanMs = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      if (meanMs <= 0) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const userBpm = 60_000 / meanMs;
      const deviationPct = Math.abs(userBpm - targetBpm) / targetBpm;
      // Tolerance: Lv1 ~8%, Lv2 ~6%, Lv3 ~5%
      const tolerance = question.level <= 1 ? 0.08 : question.level <= 2 ? 0.06 : 0.05;
      const score = Math.max(0, 1 - deviationPct / tolerance * 0.5);
      return {
        correct: deviationPct <= tolerance,
        partialScore: Math.min(1, score),
        correctAnswer: correct,
      };
    }

    case 'bpm': {
      const guess = userAnswer as number;
      const targetBpm = correct as number;
      if (typeof guess !== 'number' || Number.isNaN(guess)) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      // Lv1/2 use choices (must match exactly). Lv3 slider allows ±3 BPM.
      const tolerance = question.level <= 2 ? 0 : 3;
      const diff = Math.abs(guess - targetBpm);
      const isCorrect = diff <= tolerance;
      // Partial score: linearly decay over a 10-BPM band beyond tolerance.
      const score = isCorrect ? 1 : Math.max(0, 1 - (diff - tolerance) / 10);
      return { correct: isCorrect, partialScore: score, correctAnswer: correct };
    }

    default:
      return { correct: false, partialScore: 0, correctAnswer: correct };
  }
}
