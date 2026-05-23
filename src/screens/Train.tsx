import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type {
  Question, ModeKey, SessionResult, ProgressionAnswer,
  IntervalData, ChordData, SolfegeData, MelodyData, ProgressionData, RhythmData,
  TempoData, BpmData, TransposeData,
} from '../types';
import { useStore } from '../store/useStore';
import {
  makeIntervalQuestion, makeChordQuestion, makeMelodyQuestion,
  makeSolfegeQuestion, makeProgressionQuestion, makeRhythmQuestion,
  makeTempoQuestion, makeBpmQuestion, makeTransposeQuestion,
  makeScaleQuestion, makeCadenceQuestion, makeInversionQuestion,
  makeIntervalCompareQuestion, makeOddNoteQuestion, makeContourQuestion,
  makeTuningQuestion, makeFunctionQuestion, makeExtendedQuestion,
  makeBassQuestion, makeTensionQuestion,
} from '../engine/questionFactory';
import { MAX_LEVEL, getLevelLabel } from '../modes/levels';
import { judge } from '../engine/judge';
import { awardXp } from '../engine/xp';
import { PlaybackControls } from '../components/PlaybackControls';
import { ChoiceGrid, type ChoiceOption } from '../components/ChoiceGrid';
import { Piano } from '../components/Piano';
import { Staff } from '../components/Staff';
import { ProgressBar } from '../components/ProgressBar';
import { ComboOverlay } from '../components/ComboOverlay';
import { ModeFeedback } from '../components/feedback';
import { getIntervalChoices } from '../modes/intervalMode';
import { getChordChoices } from '../modes/chordMode';
import { getSolfegeChoices, getNoteNameChoices } from '../modes/solfegeMode';
import { getDegreeChoices } from '../modes/progressionMode';
import {
  getScaleChoices, getCadenceChoices, getInversionChoices,
  getIntervalCompareChoices, getOddNoteChoices, getContourChoices, getTuningChoices,
  getFunctionChoices, getExtendedChoices, getBassChoices, getTensionChoices,
} from '../modes/labModes';
import { MODE_REGISTRY, type ModeInfo } from '../modes/registry';
import type {
  ScaleData, CadenceData,
  IntervalCompareData, OddNoteData, ContourData, TuningData, FunctionData, TensionData,
} from '../types';
import {
  startAudio, playNote, playChord, playSequence, playProgression, playArpeggio,
  playMetronomeClick, playRhythmClick,
  playMetronome, stopAllAudio, getAudioStatus, getPlaybackGen, type AudioQuality,
  playReferenceTone,
} from '../audio/piano';
import type { ChordStep } from '../types';
import { Note } from 'tonal';
import { semitoneToSolfege } from '../theory/solfege';
import { topWeakItems } from '../engine/weakness';

const MODE_INFO = MODE_REGISTRY;

// Modes for which the absolute-pitch toggle should be available
// (pitch-based modes; excludes rhythm/tempo/bpm).
const ABSOLUTE_TOGGLE_MODES = new Set<ModeKey>([
  'interval', 'chord', 'solfege', 'progression', 'melody', 'transpose',
  'lab-scale', 'lab-cadence', 'lab-inversion',
]);

type TrainPhase = 'setup' | 'playing' | 'answering' | 'feedback' | 'done';

interface SessionState {
  questions: Question[];
  results: SessionResult[];
  currentIdx: number;
  startTime: number;
  questionStartTime: number;
  combo: number;       // current consecutive-correct streak
  bestCombo: number;   // highest combo reached this session
}

export function Train() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings, stats, srs, recordResult, addSession } = useStore();
  const focusMode = searchParams.get('focus'); // 'weak' | null

  const [phase, setPhase] = useState<TrainPhase>('setup');
  const [session, setSession] = useState<SessionState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [pianoInput, setPianoInput] = useState<string[]>([]);
  const [progressionInput, setProgressionInput] = useState<ProgressionAnswer[]>([]);
  const [feedbackResult, setFeedbackResult] = useState<ReturnType<typeof judge> | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [level, setLevel] = useState(1);
  const [progressionSource, setProgressionSource] = useState<'diatonic' | 'praise'>('diatonic');
  const [rhythmTaps, setRhythmTaps] = useState<number[]>([]);
  const [rhythmStartTime, setRhythmStartTime] = useState<number>(0);
  const [tempoTaps, setTempoTaps] = useState<number[]>([]);
  const [bpmSliderValue, setBpmSliderValue] = useState<number>(100);
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('synth');
  const [solfegeInputMethod, setSolfegeInputMethod] = useState<'choice' | 'piano'>('choice');
  const [absoluteMode, setAbsoluteMode] = useState(false);

  const modeKey = mode as ModeKey;
  const modeInfo: ModeInfo = MODE_INFO[modeKey] ?? {
    key: modeKey, name: modeKey, emoji: '🎵', description: '', maxLevel: MAX_LEVEL, defaultLevel: 1,
  };
  const isWeakSession = focusMode === 'weak';
  const totalQuestions = isWeakSession ? settings.weakSessionLength : settings.questionsPerSession;

  // In weak-session mode, restrict the candidate pool to the top weak items
  // (by mode). The factory uses this as a filter — falls back to full pool
  // when the user has no recorded weakness yet.
  const weakItemKeys = useMemo(() => {
    if (!isWeakSession) return null;
    const modeStats = stats[modeKey] ?? {};
    const top = topWeakItems(modeStats, 8).filter((w) => modeStats[w.key]?.attempts > 0);
    return new Set(top.map((w) => w.key));
  }, [isWeakSession, modeKey, stats]);
  const candidateFilter = weakItemKeys
    ? (k: string) => weakItemKeys.has(k)
    : undefined;

  // ─── Audio Init ─────────────────────────────────────────────────────────────
  async function handleAudioStart() {
    setLoading(true);
    await startAudio();
    setAudioQuality(getAudioStatus());
    setAudioReady(true);
    setLoading(false);
    beginSession();
  }

  // Keep the audio-quality indicator in sync. startAudio() now awaits the
  // sampler so by the time we get here the status is usually already 'piano',
  // but on the slow-path (emergency timeout fired) the sampler may still
  // resolve later — so we keep polling until we see 'piano' rather than
  // bailing on 'synth-fallback'. Otherwise the banner would stick even
  // after samples actually finished loading.
  useEffect(() => {
    if (!audioReady) return;
    let attempts = 0;
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      attempts++;
      const q = getAudioStatus();
      setAudioQuality((prev) => (prev === q ? prev : q));
      // Cap the polling: stop once the sampler reports ready, or after ~30s
      // total. Without this cap a stalled sampler would keep the 1 Hz wake
      // alive for the entire session, preventing mobile devices from idling.
      if (q === 'piano' || attempts >= 15) clearInterval(id);
    }, 2000);
    return () => clearInterval(id);
  }, [audioReady]);

  // Silence any in-flight playback when the user leaves the training screen
  // (back button, route change, browser nav). Without this, the question
  // audio keeps ringing on the home screen.
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, []);

  // ─── Session Management ─────────────────────────────────────────────────────
  function beginSession() {
    const startTime = Date.now();
    setSession({
      questions: [],
      results: [],
      currentIdx: 0,
      startTime,
      questionStartTime: startTime,
      combo: 0,
      bestCombo: 0,
    });
    setPhase('playing');
    loadNextQuestion([], 0);
  }

  function loadNextQuestion(existingQuestions: Question[], idx: number) {
    const q = generateQuestion(idx);
    setSession((prev) => {
      if (!prev) return prev;
      const updated = [...prev.questions];
      updated[idx] = q;
      return { ...prev, questions: updated, currentIdx: idx, questionStartTime: Date.now() };
    });
    setSelectedAnswer(null);
    setPianoInput([]);
    setProgressionInput([]);
    setRhythmTaps([]);
    setRhythmStartTime(0);
    setTempoTaps([]);
    setBpmSliderValue(100);
    setFeedbackResult(null);
    setTimeout(() => playQuestion(q), 100);
  }

  function generateQuestion(idx: number): Question {
    // Force random keys when in absolute mode so the user can't infer the
    // tonic from a fixed-key session.
    const k = absoluteMode ? 'random' : settings.keyMode;
    const fk = settings.fixedKey;
    const last = session?.questions[idx - 1]?.itemKey;
    const modeSrs = srs[modeKey];
    const modeStats = stats[modeKey];
    let q: Question;
    switch (modeKey) {
      case 'interval': q = makeIntervalQuestion(level, k, fk, last, modeSrs, modeStats, candidateFilter); break;
      case 'chord': q = makeChordQuestion(level, k, fk, false, last, modeSrs, modeStats, candidateFilter); break;
      case 'solfege': q = makeSolfegeQuestion(level, k, fk, last, modeSrs, modeStats, candidateFilter, absoluteMode); break;
      case 'progression': q = makeProgressionQuestion(level, k, fk, progressionSource); break;
      case 'melody': q = makeMelodyQuestion(level, k, fk); break;
      case 'transpose': q = makeTransposeQuestion(level, k, fk, last, modeSrs, modeStats, candidateFilter); break;
      case 'rhythm': return makeRhythmQuestion(level);
      case 'tempo': return makeTempoQuestion(level);
      case 'bpm': return makeBpmQuestion(level);
      case 'lab-scale': return makeScaleQuestion(level);
      case 'lab-cadence': q = makeCadenceQuestion(level, k, fk); break;
      case 'lab-inversion': return makeInversionQuestion(level);
      case 'lab-interval-compare': return makeIntervalCompareQuestion(level);
      case 'lab-odd-note': return makeOddNoteQuestion(level);
      case 'lab-contour': return makeContourQuestion(level);
      case 'lab-tuning': return makeTuningQuestion(level);
      case 'lab-function': return makeFunctionQuestion(level);
      case 'lab-extended': return makeExtendedQuestion(level);
      case 'lab-bass': return makeBassQuestion(level);
      case 'lab-tension': return makeTensionQuestion(level);
      default: q = makeIntervalQuestion(level, k, fk, last, modeSrs, modeStats, candidateFilter);
    }
    // Stamp absoluteMode flag on the question so downstream playback/UI
    // (reference-tone gate, key badge) honours the session-level toggle even
    // for factories that don't accept the flag explicitly.
    if (absoluteMode) {
      q = {
        ...q,
        context: { ...q.context, absoluteMode: true, referenceToneNote: undefined },
      };
    }
    return q;
  }

  // ─── Playback ─────────────────────────────────────────────────────────────
  async function playQuestion(q: Question, speed = 1.0, includeReference = true) {
    // Cut any audio left over from the previous question (release tails,
    // notes still queued in the future) before starting the new one.
    stopAllAudio();
    // Capture the playback generation right after stopping so the rest of
    // this async chain (reference-tone gap, question audio) can bail out if
    // the user triggers another stop mid-flight — otherwise the in-flight
    // promise resumes and overlaps with the newer playback.
    const gen = getPlaybackGen();
    setLoading(true);
    try {
      // Play reference tone if enabled (skip entirely in absolute-pitch mode).
      // Transpose mode handles its own reference tones inline (it sounds both
      // the source and target key tonics around the melody), so the generic
      // pre-roll is skipped for it.
      if (
        includeReference &&
        q.mode !== 'transpose' &&
        !q.context?.absoluteMode &&
        settings.referenceTone === 'perQuestion' &&
        q.context?.referenceToneNote
      ) {
        await playReferenceTone(q.context.referenceToneNote, '2n');
        if (gen !== getPlaybackGen()) return;
        await delay(700 / speed);
        if (gen !== getPlaybackGen()) return;
      }
      await playQuestionAudio(q, speed);
    } finally {
      // Only release the loading state if we're still the active playback;
      // otherwise the newer playback owns it.
      if (gen === getPlaybackGen()) setLoading(false);
    }
  }

  async function playQuestionAudio(q: Question, speed = 1.0) {
    const data = q.data;
    switch (data.type) {
      case 'interval': {
        const d = data as IntervalData;
        if (d.direction === 'harmonic') {
          await playChord(d.notes, '2n');
        } else {
          await playSequence(d.notes, '2n', speed);
        }
        break;
      }
      case 'chord': {
        const d = data as ChordData;
        if (d.arpeggio) {
          await playArpeggio(d.notes, '8n', speed);
        } else {
          await playChord(d.notes, '2n');
        }
        break;
      }
      case 'progression': {
        const d = data as ProgressionData;
        if (d.playback === 'arpeggio') {
          for (const c of d.chords) {
            await playArpeggio(c.notes, '8n', speed);
          }
        } else {
          const chordNotes = d.chords.map((c) => c.notes);
          await playProgression(chordNotes, '2n', speed);
        }
        break;
      }
      case 'melody': {
        const d = data as MelodyData;
        await playSequence(d.notes, '4n', speed);
        break;
      }
      case 'transpose': {
        const d = data as TransposeData;
        // Original key: tonic, then the melody in fromKey.
        await playReferenceTone(d.fromKey + '4', '4n');
        await delay(400 / speed);
        await playSequence(d.fromNotes, '4n', speed);
        // Pause, then sound the target key's tonic to prime the transposed input.
        await delay(700 / speed);
        await playReferenceTone(d.toKey + '4', '2n');
        break;
      }
      case 'solfege': {
        const d = data as SolfegeData;
        await playNote(d.note, '2n');
        break;
      }
      case 'rhythm': {
        const d = data as RhythmData;
        playRhythmPattern(d);
        break;
      }
      case 'tempo': {
        const d = data as TempoData;
        setIsCountingIn(true);
        await playMetronome(d.bpm, d.countInBeats);
        setIsCountingIn(false);
        break;
      }
      case 'bpm': {
        const d = data as BpmData;
        await playMetronome(d.bpm, d.beats);
        break;
      }
      case 'scale': {
        const d = data as ScaleData;
        await playSequence(d.notes, '8n', speed);
        break;
      }
      case 'cadence': {
        const d = data as CadenceData;
        await playProgression(d.chords.map((c) => c.notes), '2n', speed);
        break;
      }
      case 'interval-compare': {
        const d = data as IntervalCompareData;
        await playSequence(d.pairA, '2n', speed);
        await delay(900 / speed);
        await playSequence(d.pairB, '2n', speed);
        break;
      }
      case 'odd-note': {
        const d = data as OddNoteData;
        await playSequence(d.notes, '8n', speed);
        break;
      }
      case 'contour': {
        const d = data as ContourData;
        await playSequence(d.notes, '4n', speed);
        break;
      }
      case 'tuning': {
        const d = data as TuningData;
        await playReferenceTone(d.note, '2n');
        await delay(650 / speed);
        await playNote(d.note, '2n', d.cents);
        break;
      }
      case 'function': {
        const d = data as FunctionData;
        // Establish the key with the tonic chord, then sound the target chord.
        await playChord(d.tonicNotes, '2n');
        await delay(800 / speed);
        await playChord(d.chordNotes, '2n');
        break;
      }
      case 'tension': {
        const d = data as TensionData;
        await playChord(d.baseNotes, '2n');
        await delay(800 / speed);
        await playChord(d.fullNotes, '2n');
        break;
      }
    }
  }

  async function playRhythmPattern(data: RhythmData) {
    const gen = getPlaybackGen();
    const bpm = data.bpm;
    const sixteenthMs = (60_000 / bpm) / 4;
    // Count-in: sine metronome — distinct timbre from the woodblock pattern
    // below, so the user hears "beep beep beep beep → tok tok tok" and knows
    // exactly where the answer starts.
    setIsCountingIn(true);
    for (let i = 0; i < 4; i++) {
      if (gen !== getPlaybackGen()) { setIsCountingIn(false); return; }
      playMetronomeClick(i === 0);
      await delay(sixteenthMs * 4);
    }
    if (gen !== getPlaybackGen()) { setIsCountingIn(false); return; }
    setIsCountingIn(false);
    // Pattern: woodblock. Accent every quarter-note position (time % 4 === 0)
    // so the listener can lock onto the 4-beat grid and locate 16th positions
    // relative to it. % 16 only accents the very first note of the bar, which
    // gives no grid cue inside the bar.
    const startT = Date.now();
    for (const beat of data.pattern) {
      if (gen !== getPlaybackGen()) return;
      const targetTime = startT + beat.time * sixteenthMs;
      const wait = targetTime - Date.now();
      if (wait > 0) await delay(wait);
      playRhythmClick(beat.time % 4 === 0);
    }
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  async function handlePlayReference() {
    const q = currentQuestion;
    if (!q?.context?.referenceToneNote) return;
    stopAllAudio();
    await playReferenceTone(q.context.referenceToneNote, '2n');
  }

  // ─── Answer Submission ───────────────────────────────────────────────────
  function handleChoiceSelect(value: string) {
    setSelectedAnswer(value);
    submitAnswer(value);
  }

  function handlePianoNote(note: string) {
    if (modeKey === 'solfege') {
      const q = currentQuestion;
      if (!q) return;
      setPianoInput([note]);
      if (q.context?.absoluteMode) {
        // Absolute mode: submit the pressed key's pitch class directly.
        submitAnswer(Note.pitchClass(note));
        return;
      }
      const tonic = q.context.key || 'C';
      const tonicMidi = Note.midi(tonic + '4') ?? 60;
      const pressedMidi = Note.midi(note) ?? 60;
      const semitones = ((pressedMidi - tonicMidi) % 12 + 12) % 12;
      const syllable = semitoneToSolfege(semitones);
      submitAnswer(syllable);
      return;
    }
    if (modeKey !== 'melody' && modeKey !== 'transpose') {
      submitAnswer(note);
      return;
    }
    const expected = modeKey === 'transpose'
      ? (currentQuestion?.data as TransposeData)?.toNotes ?? []
      : (currentQuestion?.data as MelodyData)?.notes ?? [];
    const next = [...pianoInput, note];
    setPianoInput(next);
    if (next.length >= expected.length) {
      submitAnswer(next);
    }
  }

  function handleProgressionSelect(degree: number, quality: string) {
    const expected = (currentQuestion?.data as ProgressionData)?.chords ?? [];
    const next = [...progressionInput, { degree, quality }];
    setProgressionInput(next);
    if (next.length >= expected.length) {
      submitAnswer(next);
    }
  }

  function handleRhythmTap() {
    if (!rhythmStartTime) {
      setRhythmStartTime(Date.now());
      setRhythmTaps([0]);
    } else {
      const now = Date.now() - rhythmStartTime;
      setRhythmTaps((prev) => {
        const updated = [...prev, now];
        const expected = (currentQuestion?.answer as number[]) ?? [];
        if (updated.length >= expected.length) {
          submitAnswer(updated);
        }
        return updated;
      });
    }
  }

  function handleTempoTap() {
    if (isCountingIn) return; // ignore taps during count-in
    const data = currentQuestion?.data as TempoData | undefined;
    if (!data) return;
    const now = Date.now();
    setTempoTaps((prev) => {
      const updated = [...prev, now];
      // Need holdBeats+1 taps to compute holdBeats intervals
      if (updated.length >= data.holdBeats + 1) {
        submitAnswer(updated);
      }
      return updated;
    });
  }

  function handleBpmSubmit(value: number) {
    submitAnswer(value);
  }

  async function submitAnswer(value: unknown) {
    const q = currentQuestion;
    if (!q || !session) return;

    const result = judge(q, value as any);
    setFeedbackResult(result);
    setPhase('feedback');

    // Combo: only a fully-correct answer extends the streak. Partial credit
    // (e.g. melody with 2/3 notes) resets it — otherwise melody mode would
    // keep a "combo" alive on near-misses.
    const newCombo = result.correct ? session.combo + 1 : 0;
    const newBestCombo = Math.max(session.bestCombo, newCombo);

    const timeTaken = Date.now() - session.questionStartTime;
    const xp = awardXp({
      level: q.level,
      partialScore: result.partialScore,
      correct: result.correct,
      timeTakenMs: timeTaken,
      comboAfterAnswer: newCombo,
    });

    const sessionResult: SessionResult = {
      questionId: q.id,
      itemKey: q.itemKey,
      mode: q.mode,
      level: q.level,
      correct: result.correct,
      skipped: false,
      partialScore: result.partialScore,
      timeTaken,
      xpEarned: xp.total,
      comboAtAnswer: newCombo,
    };

    recordResult(sessionResult, newCombo);

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        results: [...prev.results, sessionResult],
        combo: newCombo,
        bestCombo: newBestCombo,
      };
    });

    // Play correct answer audio on feedback
    await delay(200);
    await playQuestion(q);
  }

  function handleSkip() {
    const q = currentQuestion;
    if (!q || !session) return;

    const sessionResult: SessionResult = {
      questionId: q.id,
      itemKey: q.itemKey,
      mode: q.mode,
      level: q.level,
      correct: false,
      skipped: true,
      partialScore: 0,
      timeTaken: Date.now() - session.questionStartTime,
      xpEarned: 0,
      comboAtAnswer: 0,
    };
    recordResult(sessionResult, 0);
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, results: [...prev.results, sessionResult], combo: 0 };
    });
    advanceQuestion();
  }

  function advanceQuestion() {
    // Silence the previous question immediately on tap, so there's no
    // overlap during the 100ms gap before the next question plays.
    stopAllAudio();
    const idx = (session?.currentIdx ?? 0) + 1;
    if (idx >= totalQuestions) {
      finishSession();
      return;
    }
    setPhase('playing');
    loadNextQuestion(session?.questions ?? [], idx);
  }

  function finishSession() {
    const results = session?.results ?? [];
    const correct = results.filter((r) => r.correct).length;
    const durationSec = Math.round((Date.now() - (session?.startTime ?? Date.now())) / 1000);
    const xpEarned = results.reduce((s, r) => s + (r.xpEarned ?? 0), 0);
    const bestCombo = session?.bestCombo ?? 0;
    // totalXp before this session — Result reads this to detect rank-ups.
    const previousTotalXp = useStore.getState().gamification.totalXp;

    const newlyUnlocked = addSession(
      {
        date: Date.now(),
        mode: modeKey,
        total: results.length,
        correct,
        durationSec,
        bestCombo,
        xpEarned,
      },
      results,
    );

    navigate('/result', {
      state: {
        mode: modeKey,
        total: results.length,
        correct,
        results,
        durationSec,
        xpEarned,
        bestCombo,
        previousTotalXp,
        sessionUnlockedIds: newlyUnlocked,
      },
    });
  }

  const currentQuestion = session?.questions[session.currentIdx] ?? null;
  const currentIdx = session?.currentIdx ?? 0;
  const correctCount = (session?.results ?? []).filter((r) => r.correct).length;

  // ─── Setup Screen ─────────────────────────────────────────────────────────
  if (phase === 'setup' || !audioReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-100 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button className="btn-ghost" onClick={() => navigate('/')}>← 뒤로</button>
            <span className="font-semibold text-slate-700">
              {modeInfo.emoji} {modeInfo.name}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <div className="text-6xl" aria-hidden>{modeInfo.emoji}</div>
          <h1 className="text-xl font-bold text-slate-800">{modeInfo.name}</h1>
          {isWeakSession && (
            <div className="badge-accent text-xs">
              ⚡ 약점 집중 세션 · {totalQuestions}문항
            </div>
          )}

          {/* How-to */}
          {modeInfo.howTo && (
            <div className="card w-full max-w-sm">
              <div className="text-sm font-semibold text-slate-600 mb-2">사용법</div>
              <p className="text-sm text-slate-600 leading-relaxed">{modeInfo.howTo}</p>
            </div>
          )}

          {/* Level selector — 10 levels in a 2×5 grid + label strip */}
          <div className="card w-full max-w-sm">
            <div className="text-sm font-semibold text-slate-600 mb-3">레벨 선택</div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: modeInfo.maxLevel ?? MAX_LEVEL }, (_, i) => i + 1).map((lv) => (
                <button
                  key={lv}
                  className={`py-2 rounded-lg font-semibold text-sm transition-colors ${
                    level === lv
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                  }`}
                  onClick={() => setLevel(lv)}
                  aria-label={`레벨 ${lv}`}
                >
                  {lv}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500 min-h-[1.25rem] leading-snug">
              Lv{level} · {getLevelLabel(modeKey, level)}
            </div>
          </div>

          {/* Absolute-pitch toggle (pitch-based modes only) */}
          {ABSOLUTE_TOGGLE_MODES.has(modeKey) && (
            <div className="card w-full max-w-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">
                    🎯 절대음감 모드
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-snug">
                    기준음 없이 음이름만 듣고 맞히기
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={absoluteMode}
                  onClick={() => setAbsoluteMode((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    absoluteMode ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      absoluteMode ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Progression source */}
          {modeKey === 'progression' && (
            <div className="card w-full max-w-sm">
              <div className="text-sm font-semibold text-slate-600 mb-3">출제 소스</div>
              <div className="flex gap-2">
                {[
                  { value: 'diatonic', label: '일반 다이어토닉' },
                  { value: 'praise', label: '🙏 찬양 패턴' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      progressionSource === opt.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    onClick={() => setProgressionSource(opt.value as any)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn-primary w-full max-w-sm py-4 text-lg"
            onClick={handleAudioStart}
            disabled={loading}
          >
            {loading ? '🎵 소리 준비 중...' : '🎵 시작하기'}
          </button>
          <p className="text-xs text-slate-400">첫 시작 시 피아노 샘플을 불러옵니다</p>
        </div>
      </div>
    );
  }

  // ─── Training Screen ───────────────────────────────────────────────────────
  if (!currentQuestion) return null;

  const isMelody = modeKey === 'melody';
  const isProgression = modeKey === 'progression';
  const isRhythm = modeKey === 'rhythm';
  const isSolfege = modeKey === 'solfege';
  const isInterval = modeKey === 'interval';
  const isChord = modeKey === 'chord';
  const isTranspose = modeKey === 'transpose';
  const isTempo = modeKey === 'tempo';
  const isBpm = modeKey === 'bpm';
  const isLabChoice = modeKey.startsWith('lab-');
  const isAbsolute = !!currentQuestion?.context?.absoluteMode;
  const choiceColumns: 2 | 3 | 4 =
    isInterval ? 2
    : isChord ? 2
    : modeKey === 'lab-odd-note' ? 4
    : modeKey === 'lab-bass' ? 4
    : modeKey === 'lab-inversion' ? 2
    : modeKey === 'lab-extended' ? 2
    : 3;

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button className="btn-ghost py-1 px-2 text-sm focus-ring" onClick={() => navigate('/')}>← 나가기</button>
            <span className="font-semibold text-slate-700 text-sm">
              {modeInfo.emoji} {modeInfo.name} · Lv{level}
            </span>
            {isWeakSession && (
              <span className="badge-accent text-[10px] ml-auto" aria-label="약점 집중 세션">
                약점 집중
              </span>
            )}
          </div>
          <ProgressBar current={currentIdx + (phase === 'feedback' ? 1 : 0)} total={totalQuestions} correct={correctCount} />
          {audioQuality === 'synth-fallback' && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              🎹 피아노 샘플을 불러오지 못해 기본 음색으로 재생 중입니다 (소리는 정상 출력).
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
          {/* Playback */}
          <PlaybackControls
            onPlay={(speed) => playQuestion(currentQuestion, speed, false)}
            onPlayReference={handlePlayReference}
            showReference={!isAbsolute && settings.referenceTone !== 'off' && !!currentQuestion?.context?.referenceToneNote}
            loading={loading}
          />

          {/* Key badge (transpose shows its own from→to badge in the input area) */}
          {currentQuestion.context.key && !isInterval && !isTranspose && !isAbsolute && (
            <div className="text-center">
              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                조성: {currentQuestion.context.key}장조
              </span>
            </div>
          )}

          {/* Combo overlay — only renders at >=3 consecutive correct */}
          {phase === 'feedback' && (session?.combo ?? 0) >= 3 && feedbackResult?.correct && (
            <ComboOverlay combo={session?.combo ?? 0} />
          )}

          {/* Feedback panel */}
          {phase === 'feedback' && feedbackResult && (
            <div
              className={`card animate-fade-in ${
                feedbackResult.correct
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{feedbackResult.correct ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <div className={`font-bold ${feedbackResult.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                    {feedbackResult.correct ? '정답!' : '오답'}
                  </div>
                  {!feedbackResult.correct && (
                    <div className="text-sm text-slate-600 mt-0.5">
                      정답: {formatAnswer(feedbackResult.correctAnswer, modeKey, settings.notation)}
                    </div>
                  )}
                  {feedbackResult.partialScore > 0 && feedbackResult.partialScore < 1 && (
                    <div className="text-xs text-slate-500">
                      부분 정답 {Math.round(feedbackResult.partialScore * 100)}%
                    </div>
                  )}
                </div>
                {/* XP floater — pop-in on every feedback render */}
                {(() => {
                  const last = session?.results[session.results.length - 1];
                  if (!last || last.xpEarned <= 0) return null;
                  return (
                    <div className="text-right animate-pop motion-reduce:animate-none" key={last.questionId}>
                      <div className="text-[10px] uppercase tracking-wider text-accent-700 font-semibold">+XP</div>
                      <div className="text-lg font-bold text-accent-700 tabular-nums">
                        +{last.xpEarned}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Staff feedback */}
              {settings.showStaffFeedback && isMelody && (
                <div className="mt-3">
                  <Staff notes={currentQuestion.data.type === 'melody' ? (currentQuestion.data as MelodyData).notes : []} />
                </div>
              )}

              {/* Per-mode detailed feedback (replaces the inline TempoFeedbackDetail) */}
              <ModeFeedback
                question={currentQuestion}
                userAnswer={selectedAnswer ?? (
                  pianoInput.length > 0 ? pianoInput
                  : progressionInput.length > 0 ? progressionInput
                  : null
                )}
                result={feedbackResult}
                modeStats={stats[modeKey]}
                notation={settings.notation}
              />
            </div>
          )}

          {/* Input area */}
          {phase !== 'feedback' ? (
            <>
              {/* Solfege input-method toggle (shown above the input itself) */}
              {isSolfege && (
                <div className="flex justify-center gap-1 bg-slate-100 p-1 rounded-lg w-fit mx-auto">
                  {[
                    { value: 'choice', label: '🔤 계이름' },
                    { value: 'piano', label: '🎹 건반' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        solfegeInputMethod === opt.value
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-slate-500 active:text-slate-700'
                      }`}
                      onClick={() => setSolfegeInputMethod(opt.value as 'choice' | 'piano')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Choice-based modes */}
              {(isInterval || isChord || (isSolfege && solfegeInputMethod === 'choice') || isLabChoice) && (
                <ChoiceGrid
                  options={getChoiceOptions(modeKey, level, isAbsolute)}
                  selected={selectedAnswer ?? undefined}
                  answered={false}
                  onSelect={handleChoiceSelect}
                  columns={choiceColumns}
                  disabled={loading}
                />
              )}

              {/* Transpose: re-enter the melody in the target key on the piano */}
              {isTranspose && (() => {
                const td = currentQuestion.data as TransposeData;
                return (
                  <>
                    <div className="text-center text-sm text-slate-600">
                      <span className="inline-block bg-primary-100 text-primary-700 font-semibold px-3 py-1 rounded-full">
                        {td.fromKey}장조 → {td.toKey}장조로 옮겨서 입력
                      </span>
                    </div>
                    <div className="text-center text-sm text-slate-500">
                      건반으로 {td.toNotes.length}개 음 입력
                      {pianoInput.length > 0 && ` (${pianoInput.length}/${td.toNotes.length})`}
                    </div>
                    {pianoInput.length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-center">
                        {pianoInput.map((n, i) => (
                          <span key={i} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm font-mono">{n}</span>
                        ))}
                      </div>
                    )}
                    <Piano
                      onNotePress={handlePianoNote}
                      highlightNotes={pianoInput}
                      disabled={loading}
                    />
                    {pianoInput.length > 0 && (
                      <button className="btn-ghost text-sm text-slate-400" onClick={() => setPianoInput([])}>
                        ← 다시 입력
                      </button>
                    )}
                  </>
                );
              })()}

              {/* Solfege piano input */}
              {isSolfege && solfegeInputMethod === 'piano' && (
                <>
                  <div className="text-center text-sm text-slate-500">
                    들은 음을 피아노 건반에서 눌러주세요
                  </div>
                  <Piano
                    onNotePress={handlePianoNote}
                    highlightNotes={pianoInput}
                    disabled={loading}
                  />
                </>
              )}

              {/* Piano input modes */}
              {(isMelody) && (
                <>
                  <div className="text-center text-sm text-slate-500">
                    건반으로 {(currentQuestion.data as MelodyData).notes.length}개 음 입력
                    {pianoInput.length > 0 && ` (${pianoInput.length}/${(currentQuestion.data as MelodyData).notes.length})`}
                  </div>
                  {pianoInput.length > 0 && (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {pianoInput.map((n, i) => (
                        <span key={i} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm font-mono">{n}</span>
                      ))}
                    </div>
                  )}
                  <Piano
                    onNotePress={handlePianoNote}
                    highlightNotes={pianoInput}
                    disabled={loading}
                  />
                  {pianoInput.length > 0 && (
                    <button
                      className="btn-ghost text-sm text-slate-400"
                      onClick={() => setPianoInput([])}
                    >
                      ← 다시 입력
                    </button>
                  )}
                </>
              )}

              {/* Progression input */}
              {isProgression && (
                <>
                  <div className="text-sm text-center text-slate-500">
                    코드 진행 {(currentQuestion.data as ProgressionData).chords.length}개 입력
                    {progressionInput.length > 0 && ` (${progressionInput.length}/${(currentQuestion.data as ProgressionData).chords.length})`}
                  </div>
                  {progressionInput.length > 0 && (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {progressionInput.map((p, i) => (
                        <span key={i} className="bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
                          {settings.notation === 'number' ? `${p.degree}${['m','dim','m7','m7b5'].includes(p.quality) ? 'm' : ''}` : romanize(p.degree, p.quality)}
                        </span>
                      ))}
                    </div>
                  )}
                  <ProgressionInput
                    notation={settings.notation}
                    onSelect={handleProgressionSelect}
                    disabled={loading}
                  />
                  {progressionInput.length > 0 && (
                    <button className="btn-ghost text-sm text-slate-400" onClick={() => setProgressionInput([])}>
                      ← 다시 입력
                    </button>
                  )}
                </>
              )}

              {/* Rhythm tap */}
              {isRhythm && (
                <div className="text-center space-y-4">
                  {isCountingIn && (
                    <div className="text-lg font-bold text-primary-600 animate-pulse">카운트인...</div>
                  )}
                  <div className="text-sm text-slate-500">
                    {rhythmTaps.length === 0 ? '아래 버튼을 들은 리듬대로 두드리세요' : `${rhythmTaps.length}/${(currentQuestion.answer as number[]).length} 탭`}
                  </div>
                  <button
                    className="w-full h-32 bg-slate-800 text-white text-3xl font-bold rounded-2xl active:bg-slate-600 active:scale-95 transition-all"
                    onPointerDown={handleRhythmTap}
                  >
                    👋
                  </button>
                </div>
              )}

              {/* Tempo hold */}
              {isTempo && (() => {
                const td = currentQuestion.data as TempoData;
                const targetTaps = td.holdBeats + 1;
                return (
                  <div className="text-center space-y-4">
                    {isCountingIn ? (
                      <div className="text-lg font-bold text-primary-600 animate-pulse">
                        🎵 메트로놈 듣는 중...
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        {tempoTaps.length === 0
                          ? `같은 빠르기로 ${targetTaps}번 두드리세요`
                          : `${tempoTaps.length}/${targetTaps} 탭`}
                      </div>
                    )}
                    <button
                      className="w-full h-32 bg-slate-800 text-white text-3xl font-bold rounded-2xl active:bg-slate-600 active:scale-95 transition-all disabled:opacity-40"
                      onPointerDown={handleTempoTap}
                      disabled={isCountingIn || loading}
                    >
                      🥁
                    </button>
                    <div className="text-xs text-slate-400">
                      목표: {td.bpm} BPM
                    </div>
                  </div>
                );
              })()}

              {/* BPM guess */}
              {isBpm && (() => {
                const bd = currentQuestion.data as BpmData;
                if (bd.inputMode === 'choice' && bd.choices) {
                  return (
                    <div className="space-y-3">
                      <div className="text-sm text-slate-500 text-center">
                        들려준 메트로놈의 BPM은?
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {bd.choices.map((c) => (
                          <button
                            key={c}
                            className="choice-btn py-4 text-lg font-bold"
                            onClick={() => handleBpmSubmit(c)}
                            disabled={loading}
                          >
                            {c} BPM
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                // Slider mode
                const [sliderMin, sliderMax] = bd.sliderRange ?? [40, 180];
                return (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-500 text-center">
                      슬라이더로 BPM을 맞춰보세요 (±3 허용)
                    </div>
                    <div className="text-center text-4xl font-bold text-primary-600">
                      {bpmSliderValue} BPM
                    </div>
                    <input
                      type="range"
                      min={sliderMin}
                      max={sliderMax}
                      step={1}
                      value={bpmSliderValue}
                      onChange={(e) => setBpmSliderValue(Number(e.target.value))}
                      className="w-full"
                      disabled={loading}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{sliderMin}</span>
                      <span>{sliderMax}</span>
                    </div>
                    <button
                      className="btn-primary w-full py-3"
                      onClick={() => handleBpmSubmit(bpmSliderValue)}
                      disabled={loading}
                    >
                      제출
                    </button>
                  </div>
                );
              })()}
            </>
          ) : (
            /* After feedback: show correct answer highlight for choice modes */
            <>
              {(isInterval || isChord || (isSolfege && solfegeInputMethod === 'choice') || isLabChoice) && (
                <ChoiceGrid
                  options={getChoiceOptions(modeKey, level, isAbsolute)}
                  selected={selectedAnswer ?? undefined}
                  correct={feedbackResult?.correctAnswer as string}
                  answered
                  onSelect={() => {}}
                  columns={choiceColumns}
                />
              )}
              {isTranspose && feedbackResult && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 text-center">
                    정답 ({(currentQuestion.data as TransposeData).toKey}장조)
                  </div>
                  <Piano
                    highlightNotes={feedbackResult.correctAnswer as string[]}
                    correctNotes={feedbackResult.correctAnswer as string[]}
                    wrongNotes={pianoInput.filter((n) =>
                      !(feedbackResult.correctAnswer as string[]).some(
                        (c) => Note.pitchClass(c) === Note.pitchClass(n)
                      )
                    )}
                    disabled
                  />
                </div>
              )}
              {isSolfege && solfegeInputMethod === 'piano' && feedbackResult && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 text-center">
                    정답: {feedbackResult.correctAnswer as string}
                  </div>
                  <Piano
                    highlightNotes={[]}
                    correctNotes={[(currentQuestion.data as SolfegeData).note]}
                    wrongNotes={
                      pianoInput.length > 0 &&
                      Note.pitchClass(pianoInput[0]) !== Note.pitchClass((currentQuestion.data as SolfegeData).note)
                        ? pianoInput
                        : []
                    }
                    disabled
                  />
                </div>
              )}
              {isMelody && feedbackResult && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 text-center">정답</div>
                  <Piano
                    highlightNotes={feedbackResult.correctAnswer as string[]}
                    correctNotes={feedbackResult.correctAnswer as string[]}
                    wrongNotes={pianoInput.filter((n) => {
                      const m = Note.midi(n);
                      return !(feedbackResult.correctAnswer as string[]).some(
                        (cn) => m != null && Note.midi(cn) === m
                      );
                    })}
                    disabled
                  />
                </div>
              )}
              {isProgression && feedbackResult && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {(feedbackResult.correctAnswer as ProgressionAnswer[]).map((p, i) => (
                    <span key={i} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
                      {settings.notation === 'number'
                        ? `${p.degree}${['m','dim','m7','m7b5'].includes(p.quality) ? 'm' : ''}`
                        : romanize(p.degree, p.quality)}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Footer actions */}
      <div className="bg-white border-t border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex gap-3">
          {phase !== 'feedback' && (
            <button
              className="flex-1 btn-ghost text-slate-400"
              onClick={handleSkip}
            >
              건너뛰기
            </button>
          )}
          {phase === 'feedback' && (
            <button
              className="flex-1 btn-primary"
              onClick={advanceQuestion}
            >
              {currentIdx + 1 >= totalQuestions ? '결과 보기 →' : '다음 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getChoiceOptions(mode: ModeKey, level: number, absolute = false): ChoiceOption[] {
  if (mode === 'interval') return getIntervalChoices(level);
  if (mode === 'chord') return getChordChoices(level);
  if (mode === 'solfege') return absolute ? getNoteNameChoices(level) : getSolfegeChoices(level);
  if (mode === 'lab-scale') return getScaleChoices(level);
  if (mode === 'lab-cadence') return getCadenceChoices(level);
  if (mode === 'lab-inversion') return getInversionChoices(level);
  if (mode === 'lab-interval-compare') return getIntervalCompareChoices(level);
  if (mode === 'lab-odd-note') return getOddNoteChoices();
  if (mode === 'lab-contour') return getContourChoices(level);
  if (mode === 'lab-tuning') return getTuningChoices();
  if (mode === 'lab-function') return getFunctionChoices();
  if (mode === 'lab-extended') return getExtendedChoices(level);
  if (mode === 'lab-bass') return getBassChoices(level);
  if (mode === 'lab-tension') return getTensionChoices(level);
  return [];
}

function formatAnswer(answer: unknown, mode: ModeKey, notation: 'roman' | 'number'): string {
  if (typeof answer === 'number') {
    if (mode === 'tempo' || mode === 'bpm') return `${answer} BPM`;
    return String(answer);
  }
  if (typeof answer === 'string') return answer;
  if (Array.isArray(answer)) {
    if (mode === 'progression') {
      return (answer as ProgressionAnswer[])
        .map((p) => notation === 'number'
          ? `${p.degree}${['m','dim','m7','m7b5'].includes(p.quality) ? 'm' : ''}`
          : romanize(p.degree, p.quality))
        .join(' → ');
    }
    return (answer as string[]).join(', ');
  }
  return String(answer);
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
function romanize(degree: number, quality: string): string {
  const r = ROMAN[degree] ?? degree.toString();
  const isMinor = ['m', 'dim', 'm7', 'm7b5'].includes(quality);
  return isMinor ? r.toLowerCase() : r;
}

// ─── Progression Input Component ────────────────────────────────────────────
interface ProgInputProps {
  notation: 'roman' | 'number';
  onSelect: (degree: number, quality: string) => void;
  disabled?: boolean;
}

function ProgressionInput({ notation, onSelect, disabled }: ProgInputProps) {
  const choices = getDegreeChoices(notation);
  return (
    <div className="grid grid-cols-4 gap-2">
      {choices.map((c) => (
        <button
          key={c.value}
          className="choice-btn py-3 text-base font-bold"
          onClick={() => !disabled && onSelect(c.degree, c.quality)}
          disabled={disabled}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

