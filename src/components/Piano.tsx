import React, { useRef } from 'react';
import { Note } from 'tonal';
import { startAudio, playNote } from '../audio/piano';

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

  const octaves = Array.from(
    { length: endOctave - startOctave + 1 },
    (_, i) => startOctave + i
  );

  const keyWidth = 44; // px per white key
  const keyHeight = 120;
  const blackWidth = 28;
  const blackHeight = 75;

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

  return (
    <div className="overflow-x-auto w-full pb-2">
      <div
        ref={containerRef}
        className="relative select-none mx-auto"
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
                onPointerDown={() => handlePress(note)}
                aria-label={note}
              >
                <span className="absolute bottom-1 left-0 right-0 text-center text-xs text-slate-400">
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
                onPointerDown={() => handlePress(note)}
                aria-label={note}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
