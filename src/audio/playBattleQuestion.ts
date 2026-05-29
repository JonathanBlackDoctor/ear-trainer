import type {
  Question, IntervalData, ChordData, SolfegeData, ScaleData, CadenceData,
  IntervalCompareData, OddNoteData, ContourData, TuningData, FunctionData,
  TensionData, NoteStackData, MicrotuningData, HarmonicData, MixData,
} from '../types';
import {
  playNote, playChord, playSequence, playProgression, playArpeggio,
  playReferenceTone, playMixSample, playDetunedDyad,
  stopAllAudio, getPlaybackGen,
} from './piano';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Self-contained playback for the choice-grid modes used in battles. Mirrors the
// relevant branches of Train.tsx's playQuestionAudio, but with no React-state
// side effects so it can run from the battle screen. Modes not supported in
// battle (progression/melody/rhythm/tempo/bpm/transpose) are intentionally
// absent — they need different input UIs and are excluded from BATTLE_MODES.
async function playAudio(q: Question, gen: number): Promise<void> {
  const data = q.data;
  switch (data.type) {
    case 'interval': {
      const d = data as IntervalData;
      if (d.direction === 'harmonic') await playChord(d.notes, '2n');
      else await playSequence(d.notes, '2n');
      break;
    }
    case 'chord': {
      const d = data as ChordData;
      if (d.arpeggio) await playArpeggio(d.notes, '8n');
      else await playChord(d.notes, '2n');
      break;
    }
    case 'solfege':
      await playNote((data as SolfegeData).note, '2n');
      break;
    case 'scale':
      await playSequence((data as ScaleData).notes, '8n');
      break;
    case 'cadence':
      await playProgression((data as CadenceData).chords.map((c) => c.notes), '2n');
      break;
    case 'interval-compare': {
      const d = data as IntervalCompareData;
      await playSequence(d.pairA, '2n');
      await delay(900);
      if (gen !== getPlaybackGen()) return;
      await playSequence(d.pairB, '2n');
      break;
    }
    case 'odd-note':
      await playSequence((data as OddNoteData).notes, '8n');
      break;
    case 'contour':
      await playSequence((data as ContourData).notes, '4n');
      break;
    case 'tuning': {
      const d = data as TuningData;
      await playReferenceTone(d.note, '2n');
      await delay(650);
      if (gen !== getPlaybackGen()) return;
      await playNote(d.note, '2n', d.cents);
      break;
    }
    case 'function': {
      const d = data as FunctionData;
      await playChord(d.tonicNotes, '2n');
      await delay(800);
      if (gen !== getPlaybackGen()) return;
      await playChord(d.chordNotes, '2n');
      break;
    }
    case 'tension': {
      const d = data as TensionData;
      await playChord(d.baseNotes, '2n');
      await delay(800);
      if (gen !== getPlaybackGen()) return;
      await playChord(d.fullNotes, '2n');
      break;
    }
    case 'note-stack':
      await playChord((data as NoteStackData).notes, '2n');
      break;
    case 'microtuning': {
      const d = data as MicrotuningData;
      await playDetunedDyad(d.lowNote, d.highNote, 0, '1n');
      await delay(750);
      if (gen !== getPlaybackGen()) return;
      await playDetunedDyad(d.lowNote, d.highNote, d.cents, '1n');
      break;
    }
    case 'harmonic': {
      const d = data as HarmonicData;
      await playNote(d.fundamental, '2n');
      await delay(700);
      if (gen !== getPlaybackGen()) return;
      await playNote(d.fundamental, '1n', d.cents);
      break;
    }
    case 'mix':
      await playMixSample(data as MixData);
      break;
  }
}

/**
 * Play a battle question, optionally leading with its reference tone. Returns
 * when playback finishes (or is superseded by a newer stop/playback).
 */
export async function playBattleQuestion(q: Question, withReference = true): Promise<void> {
  stopAllAudio();
  const gen = getPlaybackGen();
  if (
    withReference &&
    !q.context?.absoluteMode &&
    q.context?.referenceToneNote
  ) {
    await playReferenceTone(q.context.referenceToneNote, '2n');
    if (gen !== getPlaybackGen()) return;
    await delay(700);
    if (gen !== getPlaybackGen()) return;
  }
  await playAudio(q, gen);
}
