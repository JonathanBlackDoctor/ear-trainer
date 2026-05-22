import React, { useEffect, useRef } from 'react';
import { Note } from 'tonal';
import { startAudio, playNote } from '../audio/piano';

// Computer-keyboard → piano-key map. Two rows:
//   Lower row (a..k)  = white keys C..C (one octave + tonic).
//   Upper row (w..u)  = black keys interleaved (C#, D#, F#, G#, A#).
// Keys outside this set are ignored. The mapping is anchored to the
// `startOctave + 1` octave so the visible keyboard's middle range is reachable.
const KEYBOARD_MAP_RELATIVE: Record<string, [string, number]> = {
  a: ['C', 0], s: ['D', 0], d: ['E', 0], f: ['F', 0],
  g: ['G', 0], h: ['A', 0], j: ['B', 0], k: ['C', 1],
  w: ['C#', 0], e: ['D#', 0], t: ['F#', 0], y: ['G#', 0], u: ['A#', 0],
};

interface PianoProps {
  startOctave?: number;
  endOctave?: number;
  onNotePress?: (note: string) => void;
  highlightNotes?: string[];
  correctNotes?: string[];
  wrongNotes?: string[];
  disabled?: boolean;
}

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEY_OFFSETS: Record<string, number> = {
  'C#': 1, 'D#': 2, 'F#': 4, 'G#': 5, 'A#': 6,
};

export function Piano({
  startOctave = 3,
  endOctave = 5,
  onNotePress,
  highlightNotes = [],
  correctNotes = [],
  wrongNotes = [],
  disabled = false,
}: PianoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks where a pointer first landed on a key. On pointerup we only fire
  // the note if the pointer barely moved — otherwise the user was scrolling
  // the keyboard horizontally and we'd mis-trigger notes under their finger.
  const pressOrigin = useRef<{ x: number; y: number; note: string } | null>(null);
  const TAP_THRESHOLD = 8; // px

  const octaves = Array.from(
    { length: endOctave - startOctave + 1 },
    (_, i) => startOctave + i
  );

  const keyWidth = 44; // px per white key
  const keyHeight = 120;
  const blackWidth = 28;
  const blackHeight = 75;

  function scrollByOctave(dir: -1 | 1) {
    containerRef.current?.scrollBy({ left: dir * keyWidth * 7, behavior: 'smooth' });
  }

  function noteClass(note: string, isBlack: boolean): string {
    const pc = note.replace(/\d/, '');
    const inHighlight = highlightNotes.some((n) => Note.pitchClass(n) === pc || n === note);
    const inCorrect = correctNotes.some((n) => Note.pitchClass(n) === pc || n === note);
    const inWrong = wrongNotes.some((n) => Note.pitchClass(n) === pc || n === note);

    if (isBlack) {
      if (inCorrect) return 'bg-emerald-500';
      if (inWrong) return 'bg-red-500';
      if (inHighlight) return 'bg-primary-500';
      return 'bg-slate-800 active:bg-slate-600';
    } else {
      if (inCorrect) return 'bg-emerald-200 border-emerald-400';
      if (inWrong) return 'bg-red-200 border-red-400';
      if (inHighlight) return 'bg-primary-100 border-primary-400';
      return 'bg-white border-slate-300 active:bg-slate-100';
    }
  }

  async function handlePress(note: string) {
    if (disabled) return;
    await startAudio();
    await playNote(note, '4n');
    onNotePress?.(note);
  }

  // Keyboard input — anchored one octave above startOctave so the typical
  // C4-region is reachable on the home row.
  useEffect(() => {
    if (disabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      }
      const mapping = KEYBOARD_MAP_RELATIVE[e.key.toLowerCase()];
      if (!mapping) return;
      const [pc, octOffset] = mapping;
      const oct = startOctave + 1 + octOffset;
      if (oct < startOctave || oct > endOctave) return;
      e.preventDefault();
      handlePress(`${pc}${oct}`);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, startOctave, endOctave]);

  return (
    <div className="flex items-center w-full gap-1 pb-2">
      <button
        type="button"
        onClick={() => scrollByOctave(-1)}
        className="shrink-0 px-2 py-3 rounded-md bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold text-lg select-none"
        aria-label="왼쪽으로 스크롤"
      >
        ‹
      </button>
      <div ref={containerRef} className="piano-scroll overflow-x-auto flex-1">
        <div
          className="relative select-none"
          style={{
            width: octaves.length * 7 * keyWidth,
            height: keyHeight,
          }}
        >
          {/* White keys */}
          {octaves.flatMap((oct) =>
            WHITE_KEYS.map((pc, idx) => {
              const note = `${pc}${oct}`;
              const x = (octaves.indexOf(oct) * 7 + idx) * keyWidth;
              return (
                <button
                  key={note}
                  className={`absolute rounded-b-lg border border-slate-200 transition-colors duration-75 cursor-pointer ${noteClass(note, false)}`}
                  style={{
                    left: x,
                    top: 0,
                    width: keyWidth - 2,
                    height: keyHeight,
                  }}
                  onPointerDown={(e) => { pressOrigin.current = { x: e.clientX, y: e.clientY, note }; }}
                  onPointerUp={(e) => {
                    const o = pressOrigin.current;
                    pressOrigin.current = null;
                    if (!o || o.note !== note) return;
                    if (Math.hypot(e.clientX - o.x, e.clientY - o.y) < TAP_THRESHOLD) handlePress(note);
                  }}
                  onPointerCancel={() => { pressOrigin.current = null; }}
                  onPointerLeave={() => { pressOrigin.current = null; }}
                  aria-label={`${note} 건반`}
                  type="button"
                >
                  <span className="absolute bottom-1 left-0 right-0 text-center text-xs text-slate-400" aria-hidden>
                    {pc}{oct}
                  </span>
                </button>
              );
            })
          )}

          {/* Black keys */}
          {octaves.flatMap((oct, octIdx) =>
            Object.entries(BLACK_KEY_OFFSETS).map(([pc, offset]) => {
              const note = `${pc}${oct}`;
              const baseX = octIdx * 7 * keyWidth;
              const x = baseX + offset * keyWidth - blackWidth / 2;
              return (
                <button
                  key={note}
                  className={`absolute z-10 rounded-b-md transition-colors duration-75 cursor-pointer text-white ${noteClass(note, true)}`}
                  style={{
                    left: x,
                    top: 0,
                    width: blackWidth,
                    height: blackHeight,
                  }}
                  onPointerDown={(e) => { pressOrigin.current = { x: e.clientX, y: e.clientY, note }; }}
                  onPointerUp={(e) => {
                    const o = pressOrigin.current;
                    pressOrigin.current = null;
                    if (!o || o.note !== note) return;
                    if (Math.hypot(e.clientX - o.x, e.clientY - o.y) < TAP_THRESHOLD) handlePress(note);
                  }}
                  onPointerCancel={() => { pressOrigin.current = null; }}
                  onPointerLeave={() => { pressOrigin.current = null; }}
                  aria-label={`${note} 검은 건반`}
                  type="button"
                />
              );
            })
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => scrollByOctave(1)}
        className="shrink-0 px-2 py-3 rounded-md bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold text-lg select-none"
        aria-label="오른쪽으로 스크롤"
      >
        ›
      </button>
    </div>
  );
}
