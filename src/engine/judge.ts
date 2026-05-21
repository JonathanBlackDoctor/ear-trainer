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

    default:
      return { correct: false, partialScore: 0, correctAnswer: correct };
  }
}
