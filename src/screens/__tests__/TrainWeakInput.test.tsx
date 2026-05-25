// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../audio/piano', () => ({
  startAudio: vi.fn(async () => {}),
  playNote: vi.fn(async () => {}),
  playChord: vi.fn(async () => {}),
  playSequence: vi.fn(async () => {}),
  playProgression: vi.fn(async () => {}),
  playArpeggio: vi.fn(async () => {}),
  playMetronomeClick: vi.fn(async () => {}),
  playRhythmClick: vi.fn(async () => {}),
  playMetronome: vi.fn(async () => {}),
  stopAllAudio: vi.fn(),
  getAudioStatus: vi.fn(() => 'piano'),
  getPlaybackGen: vi.fn(() => 0),
  playReferenceTone: vi.fn(async () => {}),
  playDetunedDyad: vi.fn(async () => {}),
  playMixSample: vi.fn(async () => {}),
}));

import { Train } from '../Train';
import { useStore } from '../../store/useStore';
import { makeCard } from '../../engine/srs';
import { itemKeysForLevel } from '../../engine/itemPool';
import type { ModeStats, ModeSrs, StatsItem } from '../../types';

const weak = (): StatsItem => ({ attempts: 8, correct: 1, recent: [0, 0, 0, 0, 0, 0, 0, 1], lastSeen: Date.now() });

function seed(mode: string) {
  const ms: ModeStats = {};
  const srsMode: ModeSrs = {};
  const keys = (() => {
    const p: string[] = [];
    for (let lv = 1; lv <= 10; lv++) p.push(...itemKeysForLevel(mode as never, lv).slice(0, 3));
    if (p.length) return [...new Set(p)];
    if (mode === 'progression') return ['prog_1-4-5', 'prog_2-5-1__lv3'];
    return [`${mode}_lv1`, `${mode}_lv5`];
  })();
  for (const k of keys) { ms[k] = weak(); srsMode[k] = makeCard(0.9, Date.now() - 60_000); }
  useStore.setState((s) => ({
    stats: { ...s.stats, [mode]: ms } as never,
    srs: { ...s.srs, [mode]: srsMode } as never,
  }));
}

function renderAt(mode: string) {
  render(
    <MemoryRouter initialEntries={[`/train/${mode}?focus=weak`]}>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/train/:mode" element={<Train />} />
        <Route path="/result" element={<div>RESULT</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function startSession(mode: string) {
  renderAt(mode);
  const startBtn = await screen.findByRole('button', { name: /시작/ });
  fireEvent.click(startBtn);
  await waitFor(() => expect(screen.queryByText(/나가기/)).toBeTruthy(), { timeout: 2000 });
}

// "answer input present" = more than just the nav/playback/skip controls.
function answerButtonCount(): number {
  const all = Array.from(document.querySelectorAll('button'));
  const controlRe = /나가기|듣기|기준음|건너뛰기|다시 입력|계이름|건반/;
  return all.filter((b) => !controlRe.test(b.textContent ?? '')).length;
}

const CHOICE_MODES = [
  'interval', 'chord', 'solfege',
  'lab-scale', 'lab-cadence', 'lab-inversion', 'lab-interval-compare',
  'lab-odd-note', 'lab-contour', 'lab-tuning', 'lab-function',
  'lab-extended', 'lab-bass', 'lab-tension',
  'lab-wide-interval', 'lab-note-stack', 'lab-microtuning', 'lab-harmonics',
];

describe('weak session renders an answer input', () => {
  beforeEach(() => cleanup());

  for (const mode of CHOICE_MODES) {
    it(`${mode}: shows answer choices (not just play/skip)`, async () => {
      seed(mode);
      await startSession(mode);
      expect(answerButtonCount()).toBeGreaterThan(0);
    });
  }

  for (const mode of ['progression', 'melody', 'transpose', 'rhythm', 'tempo', 'bpm']) {
    it(`${mode}: shows a non-choice answer input`, async () => {
      seed(mode);
      await startSession(mode);
      expect(answerButtonCount()).toBeGreaterThan(0);
    });
  }

  it('an unrecognized (legacy) mode key redirects home instead of a broken screen', async () => {
    seed('legacy-old-mode');
    renderAt('legacy-old-mode');
    // The guard bounces unknown modes home — no setup, no broken training screen.
    await waitFor(() => expect(screen.queryByText('HOME')).toBeTruthy(), { timeout: 2000 });
    expect(screen.queryByText(/나가기/)).toBeNull();
  });
});
