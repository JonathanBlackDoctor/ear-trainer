import { Note, Interval } from 'tonal';
import type {
  Question, AnswerValue, ProgressionAnswer,
  IntervalData, ChordData, SolfegeData, MelodyData,
} from '../types';
import { intervalLabel } from '../theory/intervals';

export interface TempoJudgeDetails {
  kind: 'tempo';
  targetBpm: number;
  userBpm: number;          // BPM derived from mean inter-tap interval
  bpmDelta: number;         // userBpm - targetBpm (signed; + = fast, − = slow)
  deviationPct: number;     // |bpmDelta| / targetBpm
  tolerancePct: number;     // level-based passing threshold
  intervalsMs: number[];    // raw inter-tap intervals in ms
  intervalBpms: number[];   // per-interval BPM
  meanIntervalMs: number;
  stdDevMs: number;         // SD of intervals — raw jitter
  jitterPct: number;        // stdDevMs / meanIntervalMs — relative jitter
}

export interface IntervalJudgeDetails {
  kind: 'interval';
  userName: string;
  userLabel: string;
  correctName: string;
  correctLabel: string;
  semitones: number;        // correct interval semitone count
  direction: 'up' | 'down' | 'harmonic';
  notes: string[];          // the two notes (or chord) played
  semitoneDelta: number;    // userSemitones - correctSemitones (signed)
}

export interface ChordJudgeDetails {
  kind: 'chord';
  userQuality: string;
  correctQuality: string;
  root: string;
  notes: string[];
  // High-level "what differs about your guess" hints.
  // Each flag is `true` when the user's guessed quality and the correct quality
  // disagree on that chord tone (root is always the same, so omitted).
  thirdDiffers: boolean;
  fifthDiffers: boolean;
  seventhDiffers: boolean;
}

export interface ProgressionJudgeDetails {
  kind: 'progression';
  steps: Array<{
    idx: number;
    expected: ProgressionAnswer;
    given?: ProgressionAnswer;
    degreeOk: boolean;
    qualityOk: boolean;
    fullOk: boolean;
  }>;
}

export interface MelodyJudgeDetails {
  kind: 'melody';
  perNote: Array<{
    idx: number;
    expected: string;
    given?: string;
    semitoneDelta: number;  // given - expected (0 if absent)
    ok: boolean;
  }>;
}

export interface SolfegeJudgeDetails {
  kind: 'solfege';
  userSyllable: string;
  correctSyllable: string;
  scaleDegree: number;      // 1..7 (or 0 for chromatic)
  note: string;
  key: string;
}

export interface RhythmJudgeDetails {
  kind: 'rhythm';
  toleranceMs: number;
  perTap: Array<{
    idx: number;
    offsetMs: number;       // given - expected (signed; +late, −early)
    ok: boolean;
  }>;
  avgAbsOffsetMs: number;
}

export interface BpmJudgeDetails {
  kind: 'bpm';
  targetBpm: number;
  userBpm: number;
  bpmDelta: number;
  perceptualHint: string;
}

export interface LabJudgeDetails {
  kind: 'lab';
  category: 'scale' | 'cadence' | 'key' | 'inversion';
  userAnswer: string;
  correctAnswer: string;
}

export type JudgeDetails =
  | TempoJudgeDetails
  | IntervalJudgeDetails
  | ChordJudgeDetails
  | ProgressionJudgeDetails
  | MelodyJudgeDetails
  | SolfegeJudgeDetails
  | RhythmJudgeDetails
  | BpmJudgeDetails
  | LabJudgeDetails;

export interface JudgeResult {
  correct: boolean;
  partialScore: number;   // 0.0 – 1.0
  correctAnswer: AnswerValue;
  details?: JudgeDetails;
}

// ─── Helpers for chord-quality "what differs" hints ────────────────────────
type ThirdKind = 'M' | 'm' | 'sus4';
type FifthKind = 'P' | 'd' | 'A';
type SeventhKind = 'none' | 'M' | 'm';

// Map the canonical quality strings used by questionFactory/theory.chords
// onto chord-tone shapes. Falls back to a major triad for unknown strings.
function chordToneSet(quality: string): { third: ThirdKind; fifth: FifthKind; seventh: SeventhKind } {
  switch (quality) {
    case 'major':     return { third: 'M',    fifth: 'P', seventh: 'none' };
    case 'minor':     return { third: 'm',    fifth: 'P', seventh: 'none' };
    case 'dim':       return { third: 'm',    fifth: 'd', seventh: 'none' };
    case 'aug':       return { third: 'M',    fifth: 'A', seventh: 'none' };
    case 'sus4':      return { third: 'sus4', fifth: 'P', seventh: 'none' };
    case 'major7':    return { third: 'M',    fifth: 'P', seventh: 'M' };
    case 'dominant7': return { third: 'M',    fifth: 'P', seventh: 'm' };
    case 'minor7':    return { third: 'm',    fifth: 'P', seventh: 'm' };
    case 'm7b5':      return { third: 'm',    fifth: 'd', seventh: 'm' };
    default:          return { third: 'M',    fifth: 'P', seventh: 'none' };
  }
}

function bpmPerceptualHint(bpm: number): string {
  if (bpm < 60)  return '매우 느림 (라르고 ~ 아다지오)';
  if (bpm < 76)  return '느림 (아다지오)';
  if (bpm < 96)  return '중간 (안단테 ~ 모데라토)';
  if (bpm < 120) return '경쾌함 (알레그레토 ~ 알레그로)';
  if (bpm < 144) return '빠름 (알레그로 ~ 비바체)';
  if (bpm < 168) return '매우 빠름 (비바체 ~ 프레스토)';
  return '극도로 빠름 (프레스티시모)';
}

/** Judge a user's answer against a question */
export function judge(question: Question, userAnswer: AnswerValue): JudgeResult {
  const correct = question.answer;

  switch (question.mode) {
    case 'interval': {
      const ua = userAnswer as string;
      const ca = correct as string;
      const isCorrect = ua === ca;
      const data = question.data as IntervalData;
      // Semitone counts via tonal; fall back to 0 if unrecognized.
      const ucSem = Interval.semitones(ua) ?? 0;
      const ccSem = Interval.semitones(ca) ?? 0;
      const details: IntervalJudgeDetails = {
        kind: 'interval',
        userName: ua,
        userLabel: intervalLabel(ua),
        correctName: ca,
        correctLabel: intervalLabel(ca),
        semitones: ccSem,
        direction: data.direction,
        notes: data.notes,
        semitoneDelta: ucSem - ccSem,
      };
      return { correct: isCorrect, partialScore: isCorrect ? 1 : 0, correctAnswer: correct, details };
    }

    case 'chord': {
      const ua = userAnswer as string;
      const ca = correct as string;
      const isCorrect = ua === ca;
      const data = question.data as ChordData;
      const u = chordToneSet(ua);
      const c = chordToneSet(ca);
      const details: ChordJudgeDetails = {
        kind: 'chord',
        userQuality: ua,
        correctQuality: ca,
        root: data.root,
        notes: data.notes,
        thirdDiffers: u.third !== c.third,
        fifthDiffers: u.fifth !== c.fifth,
        seventhDiffers: u.seventh !== c.seventh,
      };
      return { correct: isCorrect, partialScore: isCorrect ? 1 : 0, correctAnswer: correct, details };
    }

    case 'solfege': {
      const ua = userAnswer as string;
      const ca = correct as string;
      const isCorrect = ua === ca;
      const data = question.data as SolfegeData;
      // Compute scale degree from the note relative to the key (1-7, else 0).
      const tonicMidi = Note.midi((data.key || 'C') + '4') ?? 60;
      const noteMidi = Note.midi(data.note) ?? tonicMidi;
      const semis = ((noteMidi - tonicMidi) % 12 + 12) % 12;
      // Major scale semitone → degree mapping. Chromatic notes return 0.
      const degMap: Record<number, number> = { 0:1, 2:2, 4:3, 5:4, 7:5, 9:6, 11:7 };
      const scaleDegree = degMap[semis] ?? 0;
      const details: SolfegeJudgeDetails = {
        kind: 'solfege',
        userSyllable: ua,
        correctSyllable: ca,
        scaleDegree,
        note: data.note,
        key: data.key,
      };
      return { correct: isCorrect, partialScore: isCorrect ? 1 : 0, correctAnswer: correct, details };
    }

    case 'lab-scale':
    case 'lab-cadence':
    case 'lab-key':
    case 'lab-inversion': {
      const ua = userAnswer as string;
      const ca = correct as string;
      const isCorrect = ua === ca;
      const category =
        question.mode === 'lab-scale' ? 'scale'
        : question.mode === 'lab-cadence' ? 'cadence'
        : question.mode === 'lab-key' ? 'key'
        : 'inversion';
      const details: LabJudgeDetails = {
        kind: 'lab',
        category,
        userAnswer: ua,
        correctAnswer: ca,
      };
      return { correct: isCorrect, partialScore: isCorrect ? 1 : 0, correctAnswer: correct, details };
    }

    case 'melody': {
      const ua = userAnswer as string[];
      const ca = correct as string[];
      // Compare by MIDI so the piano's sharp-form input (e.g. A#4) matches
      // the scale's enharmonic spelling (e.g. Bb4 in F major).
      const sameMidi = (a?: string, b?: string) => {
        if (!a || !b) return false;
        const ma = Note.midi(a);
        const mb = Note.midi(b);
        return ma != null && mb != null && ma === mb;
      };
      if (!Array.isArray(ua) || ua.length !== ca.length) {
        // Even on length mismatch, include per-note details where we can so the
        // feedback UI can still render the expected sequence and what the user
        // pressed alongside it.
        const len = Math.max(ua?.length ?? 0, ca.length);
        const perNote = Array.from({ length: len }, (_, i) => {
          const expected = ca[i] ?? '';
          const given = ua?.[i];
          const sem = given && expected
            ? ((Note.midi(given) ?? 0) - (Note.midi(expected) ?? 0))
            : 0;
          return {
            idx: i,
            expected,
            given,
            semitoneDelta: sem,
            ok: sameMidi(given, expected),
          };
        });
        return {
          correct: false, partialScore: 0, correctAnswer: correct,
          details: { kind: 'melody', perNote },
        };
      }
      const perNote = ca.map((expected, i) => {
        const given = ua[i];
        const sem = given && expected
          ? ((Note.midi(given) ?? 0) - (Note.midi(expected) ?? 0))
          : 0;
        return { idx: i, expected, given, semitoneDelta: sem, ok: sameMidi(given, expected) };
      });
      const matches = perNote.filter((p) => p.ok).length;
      const score = matches / ca.length;
      const details: MelodyJudgeDetails = { kind: 'melody', perNote };
      return { correct: score === 1, partialScore: score, correctAnswer: correct, details };
    }

    case 'progression': {
      const ua = userAnswer as ProgressionAnswer[];
      const ca = correct as ProgressionAnswer[];
      const len = Array.isArray(ca) ? ca.length : 0;
      if (!Array.isArray(ua) || ua.length !== len) {
        const steps = Array.from({ length: len }, (_, i) => ({
          idx: i,
          expected: ca[i],
          given: Array.isArray(ua) ? ua[i] : undefined,
          degreeOk: false,
          qualityOk: false,
          fullOk: false,
        }));
        return {
          correct: false, partialScore: 0, correctAnswer: correct,
          details: { kind: 'progression', steps },
        };
      }
      const steps = ca.map((expected, i) => {
        const given = ua[i];
        const degreeOk = given?.degree === expected.degree;
        const qualityOk = given?.quality === expected.quality;
        return {
          idx: i,
          expected,
          given,
          degreeOk,
          qualityOk,
          fullOk: degreeOk && qualityOk,
        };
      });
      const matches = steps.filter((s) => s.fullOk).length;
      const score = matches / ca.length;
      return {
        correct: score === 1,
        partialScore: score,
        correctAnswer: correct,
        details: { kind: 'progression', steps },
      };
    }

    case 'transpose': {
      // Degree-sequence match: e.g. user taps [1,3,5], answer is [1,3,5].
      const ua = userAnswer as number[];
      const ca = correct as number[];
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
      const perTap = expected.map((exp, i) => {
        const offsetMs = taps[i] - exp;
        return { idx: i, offsetMs, ok: Math.abs(offsetMs) <= TOLERANCE_MS };
      });
      const hits = perTap.filter((p) => p.ok).length;
      const score = hits / expected.length;
      const avgAbsOffsetMs = perTap.length
        ? perTap.reduce((s, p) => s + Math.abs(p.offsetMs), 0) / perTap.length
        : 0;
      return {
        correct: score >= 0.8,
        partialScore: score,
        correctAnswer: correct,
        details: { kind: 'rhythm', toleranceMs: TOLERANCE_MS, perTap, avgAbsOffsetMs },
      };
    }

    case 'tempo': {
      // Tempo hold: compute average inter-tap interval → BPM, compare to target.
      const taps = userAnswer as number[];
      const targetBpm = correct as number;
      if (!Array.isArray(taps) || taps.length < 2) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const intervalsMs: number[] = [];
      for (let i = 1; i < taps.length; i++) intervalsMs.push(taps[i] - taps[i - 1]);
      const meanMs = intervalsMs.reduce((s, v) => s + v, 0) / intervalsMs.length;
      if (meanMs <= 0) {
        return { correct: false, partialScore: 0, correctAnswer: correct };
      }
      const userBpm = 60_000 / meanMs;
      const intervalBpms = intervalsMs.map((ms) => 60_000 / ms);
      const variance =
        intervalsMs.reduce((s, v) => s + (v - meanMs) ** 2, 0) / intervalsMs.length;
      const stdDevMs = Math.sqrt(variance);
      const jitterPct = stdDevMs / meanMs;
      const bpmDelta = userBpm - targetBpm;
      const deviationPct = Math.abs(bpmDelta) / targetBpm;
      // Tolerance: Lv1 ~8%, Lv2 ~6%, Lv3 ~5%
      const tolerancePct =
        question.level <= 1 ? 0.08 : question.level <= 2 ? 0.06 : 0.05;
      // Partial score now reflects both accuracy (mean BPM) and consistency (jitter).
      // Each component decays linearly from 1 → 0 over a 2× tolerance band.
      const accuracyScore = Math.max(0, 1 - deviationPct / (tolerancePct * 2));
      const consistencyScore = Math.max(0, 1 - jitterPct / (tolerancePct * 2));
      const partialScore = Math.min(1, 0.65 * accuracyScore + 0.35 * consistencyScore);
      return {
        correct: deviationPct <= tolerancePct,
        partialScore,
        correctAnswer: correct,
        details: {
          kind: 'tempo',
          targetBpm,
          userBpm,
          bpmDelta,
          deviationPct,
          tolerancePct,
          intervalsMs,
          intervalBpms,
          meanIntervalMs: meanMs,
          stdDevMs,
          jitterPct,
        },
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
      return {
        correct: isCorrect,
        partialScore: score,
        correctAnswer: correct,
        details: {
          kind: 'bpm',
          targetBpm,
          userBpm: guess,
          bpmDelta: guess - targetBpm,
          perceptualHint: bpmPerceptualHint(targetBpm),
        },
      };
    }

    default:
      return { correct: false, partialScore: 0, correctAnswer: correct };
  }
}
