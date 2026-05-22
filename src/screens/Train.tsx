import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {
  Question, ModeKey, SessionResult, ProgressionAnswer,
  IntervalData, ChordData, SolfegeData, MelodyData, ProgressionData, RhythmData,
} from '../types';
import { useStore } from '../store/useStore';
import {
  makeIntervalQuestion, makeChordQuestion, makeMelodyQuestion,
  makeSolfegeQuestion, makeProgressionQuestion, makeRhythmQuestion,
} from '../engine/questionFactory';
import { judge } from '../engine/judge';
import { PlaybackControls } from '../components/PlaybackControls';
import { ChoiceGrid, type ChoiceOption } from '../components/ChoiceGrid';
import { Piano } from '../components/Piano';
import { Staff } from '../components/Staff';
import { ProgressBar } from '../components/ProgressBar';
import { getIntervalChoices } from '../modes/intervalMode';
import { getChordChoices } from '../modes/chordMode';
import { getSolfegeChoices } from '../modes/solfegeMode';
import { getDegreeChoices } from '../modes/progressionMode';
import {
  startAudio, playNote, playChord, playSequence, playProgression, playArpeggio, playClick,
  stopAllAudio, getAudioStatus, type AudioQuality,
} from '../audio/piano';
import { INTERVAL_MODE_INFO } from '../modes/intervalMode';
import { CHORD_MODE_INFO } from '../modes/chordMode';
import { SOLFEGE_MODE_INFO } from '../modes/solfegeMode';
import {
  PROGRESSION_MODE_INFO, MELODY_MODE_INFO, TRANSPOSE_MODE_INFO, RHYTHM_MODE_INFO,
} from '../modes/progressionMode';
import type { ChordStep } from '../types';
import { Note } from 'tonal';

const MODE_INFO: Record<string, { name: string; emoji: string }> = {
  interval: INTERVAL_MODE_INFO,
  chord: CHORD_MODE_INFO,
  solfege: SOLFEGE_MODE_INFO,
  progression: PROGRESSION_MODE_INFO,
  melody: MELODY_MODE_INFO,
  transpose: TRANSPOSE_MODE_INFO,
  rhythm: RHYTHM_MODE_INFO,
};

type TrainPhase = 'setup' | 'playing' | 'answering' | 'feedback' | 'done';

interface SessionState {
  questions: Question[];
  results: SessionResult[];
  currentIdx: number;
  startTime: number;
  questionStartTime: number;
}

export function Train() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { settings, stats, recordResult, addSession } = useStore();

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
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('synth');

  const modeKey = mode as ModeKey;
  const modeInfo = MODE_INFO[modeKey] ?? { name: modeKey, emoji: '🎵' };
  const totalQuestions = settings.questionsPerSession;

  // ─── Audio Init ─────────────────────────────────────────────────────────────
  async function handleAudioStart() {
    setLoading(true);
    await startAudio();
    setAudioQuality(getAudioStatus());
    setAudioReady(true);
    setLoading(false);
    beginSession();
  }

  // Keep audio-quality indicator in sync as background sample loading resolves.
  useEffect(() => {
    if (!audioReady) return;
    const id = setInterval(() => {
      const q = getAudioStatus();
      setAudioQuality((prev) => (prev === q ? prev : q));
      if (q !== 'synth') clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [audioReady]);

  // ─── Session Management ─────────────────────────────────────────────────────
  function beginSession() {
    const startTime = Date.now();
    setSession({
      questions: [],
      results: [],
      currentIdx: 0,
      startTime,
      questionStartTime: startTime,
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
    setFeedbackResult(null);
    setTimeout(() => playQuestion(q), 100);
  }

  function generateQuestion(idx: number): Question {
    const k = settings.keyMode;
    const fk = settings.fixedKey;
    switch (modeKey) {
      case 'interval': return makeIntervalQuestion(level, k, fk, session?.questions[idx - 1]?.itemKey);
      case 'chord': return makeChordQuestion(level, k, fk, false);
      case 'solfege': return makeSolfegeQuestion(level, k, fk);
      case 'progression': return makeProgressionQuestion(level, k, fk, progressionSource);
      case 'melody': return makeMelodyQuestion(level, k, fk);
      case 'transpose': return makeIntervalQuestion(level, k, fk); // simplified
      case 'rhythm': return makeRhythmQuestion(level);
      default: return makeIntervalQuestion(level, k, fk);
    }
  }

  // ─── Playback ─────────────────────────────────────────────────────────────
  async function playQuestion(q: Question, speed = 1.0) {
    // Cut any audio left over from the previous question (release tails,
    // notes still queued in the future) before starting the new one.
    stopAllAudio();
    setLoading(true);
    try {
      // Play reference tone if enabled
      if (settings.referenceTone === 'perQuestion' && q.context?.referenceToneNote) {
        await playNote(q.context.referenceToneNote, '2n');
        await delay(700 / speed);
      }
      await playQuestionAudio(q, speed);
    } finally {
      setLoading(false);
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
        const chordNotes = d.chords.map((c) => c.notes);
        await playProgression(chordNotes, '2n', speed);
        break;
      }
      case 'melody': {
        const d = data as MelodyData;
        await playSequence(d.notes, '4n', speed);
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
    }
  }

  async function playRhythmPattern(data: RhythmData) {
    const bpm = data.bpm;
    const sixteenthMs = (60_000 / bpm) / 4;
    // Count-in
    setIsCountingIn(true);
    for (let i = 0; i < 4; i++) {
      playClick(i === 0);
      await delay(sixteenthMs * 4);
    }
    setIsCountingIn(false);
    // Play pattern
    const startT = Date.now();
    for (const beat of data.pattern) {
      const targetTime = startT + beat.time * sixteenthMs;
      const wait = targetTime - Date.now();
      if (wait > 0) await delay(wait);
      playClick(beat.time % 16 === 0);
    }
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  async function handlePlayReference() {
    const q = currentQuestion;
    if (!q?.context?.referenceToneNote) return;
    stopAllAudio();
    await playNote(q.context.referenceToneNote, '2n');
  }

  // ─── Answer Submission ───────────────────────────────────────────────────
  function handleChoiceSelect(value: string) {
    setSelectedAnswer(value);
    submitAnswer(value);
  }

  function handlePianoNote(note: string) {
    if (modeKey !== 'melody') {
      submitAnswer(note);
      return;
    }
    const expected = (currentQuestion?.data as MelodyData)?.notes ?? [];
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

  async function submitAnswer(value: unknown) {
    const q = currentQuestion;
    if (!q || !session) return;

    const result = judge(q, value as any);
    setFeedbackResult(result);
    setPhase('feedback');

    const sessionResult: SessionResult = {
      questionId: q.id,
      itemKey: q.itemKey,
      mode: q.mode,
      correct: result.correct,
      skipped: false,
      partialScore: result.partialScore,
      timeTaken: Date.now() - session.questionStartTime,
    };

    recordResult(sessionResult);

    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, results: [...prev.results, sessionResult] };
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
      correct: false,
      skipped: true,
      partialScore: 0,
      timeTaken: Date.now() - session.questionStartTime,
    };
    recordResult(sessionResult);
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, results: [...prev.results, sessionResult] };
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
    addSession({
      date: Date.now(),
      mode: modeKey,
      total: results.length,
      correct,
      durationSec,
    });
    navigate('/result', {
      state: { mode: modeKey, total: results.length, correct, results, durationSec },
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
          <div className="text-6xl">{modeInfo.emoji}</div>
          <h2 className="text-xl font-bold text-slate-800">{modeInfo.name}</h2>

          {/* Level selector */}
          <div className="card w-full max-w-sm">
            <div className="text-sm font-semibold text-slate-600 mb-3">레벨 선택</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].slice(0, MODE_INFO[modeKey as string] ? 4 : 3).map((lv) => (
                <button
                  key={lv}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    level === lv
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                  }`}
                  onClick={() => setLevel(lv)}
                >
                  Lv{lv}
                </button>
              ))}
            </div>
          </div>

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button className="btn-ghost py-1 px-2 text-sm" onClick={() => navigate('/')}>← 나가기</button>
            <span className="font-semibold text-slate-700 text-sm">
              {modeInfo.emoji} {modeInfo.name} · Lv{level}
            </span>
          </div>
          <ProgressBar current={currentIdx + (phase === 'feedback' ? 1 : 0)} total={totalQuestions} correct={correctCount} />
          {audioQuality === 'synth-fallback' && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              🎹 피아노 샘플을 불러오지 못해 기본 음색으로 재생 중입니다 (소리는 정상 출력).
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
          {/* Playback */}
          <PlaybackControls
            onPlay={(speed) => playQuestion(currentQuestion, speed)}
            onPlayReference={handlePlayReference}
            showReference={settings.referenceTone !== 'off' && !!currentQuestion?.context?.referenceToneNote}
            loading={loading}
          />

          {/* Key badge */}
          {currentQuestion.context.key && !isInterval && (
            <div className="text-center">
              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                조성: {currentQuestion.context.key}장조
              </span>
            </div>
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
                <div>
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
              </div>

              {/* Staff feedback */}
              {settings.showStaffFeedback && isMelody && (
                <div className="mt-3">
                  <Staff notes={currentQuestion.data.type === 'melody' ? (currentQuestion.data as MelodyData).notes : []} />
                </div>
              )}
            </div>
          )}

          {/* Input area */}
          {phase !== 'feedback' ? (
            <>
              {/* Choice-based modes */}
              {(isInterval || isChord || isSolfege) && (
                <ChoiceGrid
                  options={getChoiceOptions(modeKey, level)}
                  selected={selectedAnswer ?? undefined}
                  answered={false}
                  onSelect={handleChoiceSelect}
                  columns={isInterval ? 2 : isChord ? 2 : 3}
                  disabled={loading}
                />
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
            </>
          ) : (
            /* After feedback: show correct answer highlight for choice modes */
            <>
              {(isInterval || isChord || isSolfege) && (
                <ChoiceGrid
                  options={getChoiceOptions(modeKey, level)}
                  selected={selectedAnswer ?? undefined}
                  correct={feedbackResult?.correctAnswer as string}
                  answered
                  onSelect={() => {}}
                  columns={isInterval ? 2 : isChord ? 2 : 3}
                />
              )}
              {isMelody && feedbackResult && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 text-center">정답</div>
                  <Piano
                    highlightNotes={feedbackResult.correctAnswer as string[]}
                    correctNotes={feedbackResult.correctAnswer as string[]}
                    wrongNotes={pianoInput.filter((n) => !(feedbackResult.correctAnswer as string[]).includes(n))}
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

          {/* Next / Skip buttons */}
          <div className="flex gap-3">
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
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getChoiceOptions(mode: ModeKey, level: number): ChoiceOption[] {
  if (mode === 'interval') return getIntervalChoices(level);
  if (mode === 'chord') return getChordChoices(level);
  if (mode === 'solfege') return getSolfegeChoices(level);
  return [];
}

function formatAnswer(answer: unknown, mode: ModeKey, notation: 'roman' | 'number'): string {
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
