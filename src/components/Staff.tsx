import React, { useEffect, useRef } from 'react';
import { Note } from 'tonal';

interface StaffProps {
  notes: string[];
  width?: number;
  height?: number;
  clef?: 'treble' | 'bass';
}

/**
 * Simple SVG-based staff notation using VexFlow.
 * Falls back to text display if VexFlow fails.
 */
export function Staff({ notes, width = 400, height = 100, clef = 'treble' }: StaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;
    const el = containerRef.current;
    el.innerHTML = '';

    // Dynamic import to avoid SSR issues
    import('vexflow').then(({ Renderer, Stave, StaveNote, Voice, Formatter }) => {
      try {
        const renderer = new Renderer(el, Renderer.Backends.SVG);
        renderer.resize(width, height);
        const context = renderer.getContext();
        context.setFont('Arial', 10);

        const stave = new Stave(10, 10, width - 20);
        stave.addClef(clef).addTimeSignature('4/4');
        stave.setContext(context).draw();

        // Convert notes to VexFlow format
        const vfNotes = notes.map((n) => {
          const pc = Note.pitchClass(n).replace('#', '#').replace('b', 'b');
          const oct = parseInt(n.slice(-1)) || 4;
          const key = `${pc.toLowerCase()}/${oct}`;
          return new StaveNote({
            keys: [key],
            duration: 'q',
            clef,
          });
        });

        // Pad to 4 beats if needed
        const needed = 4 - vfNotes.length;
        const restNotes = needed > 0
          ? Array.from({ length: needed }, () =>
              new StaveNote({ keys: ['b/4'], duration: 'qr' })
            )
          : [];

        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables([...vfNotes, ...restNotes]);

        new Formatter().joinVoices([voice]).format([voice], width - 60);
        voice.draw(context, stave);
      } catch (e) {
        // Fallback to text
        el.innerHTML = `<div class="text-center text-slate-500 py-2">${notes.join(' ')}</div>`;
      }
    }).catch(() => {
      if (el) {
        el.innerHTML = `<div class="text-center text-slate-500 py-2">${notes.join(' ')}</div>`;
      }
    });
  }, [notes, width, height, clef]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto bg-white rounded-lg border border-slate-100 py-1"
      style={{ minHeight: height }}
    />
  );
}
