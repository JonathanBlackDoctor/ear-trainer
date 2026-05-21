import * as Tone from 'tone';

let sampler: Tone.Sampler | null = null;
let audioStarted = false;

// Salamander Grand Piano samples (public CDN)
const SALAMANDER_BASE = 'https://tonejs.github.io/audio/salamander/';
const SAMPLE_NOTES: Record<string, string> = {
  A0: 'A0.mp3',  C1: 'C1.mp3',  Ds1: 'Ds1.mp3', Fs1: 'Fs1.mp3',
  A1: 'A1.mp3',  C2: 'C2.mp3',  Ds2: 'Ds2.mp3', Fs2: 'Fs2.mp3',
  A2: 'A2.mp3',  C3: 'C3.mp3',  Ds3: 'Ds3.mp3', Fs3: 'Fs3.mp3',
  A3: 'A3.mp3',  C4: 'C4.mp3',  Ds4: 'Ds4.mp3', Fs4: 'Fs4.mp3',
  A4: 'A4.mp3',  C5: 'C5.mp3',  Ds5: 'Ds5.mp3', Fs5: 'Fs5.mp3',
  A5: 'A5.mp3',  C6: 'C6.mp3',  Ds6: 'Ds6.mp3', Fs6: 'Fs6.mp3',
  A6: 'A6.mp3',  C7: 'C7.mp3',
};

const SAMPLE_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(SAMPLE_NOTES).map(([note, file]) => [
    note,
    SALAMANDER_BASE + file,
  ])
);

export function getSampler(): Promise<Tone.Sampler> {
  if (sampler && sampler.loaded) return Promise.resolve(sampler);
  return new Promise((resolve, reject) => {
    sampler = new Tone.Sampler({
      urls: SAMPLE_URLS,
      onload: () => resolve(sampler!),
      onerror: reject,
    }).toDestination();
  });
}

export async function startAudio(): Promise<void> {
  if (audioStarted) return;
  await Tone.start();
  audioStarted = true;
}

export function isAudioStarted(): boolean {
  return audioStarted;
}

/** Play a single note */
export async function playNote(note: string, duration = '2n'): Promise<void> {
  const s = await getSampler();
  s.triggerAttackRelease(note, duration, Tone.now());
}

/** Play multiple notes simultaneously (chord) */
export async function playChord(
  notes: string[],
  duration = '2n'
): Promise<void> {
  const s = await getSampler();
  s.triggerAttackRelease(notes, duration, Tone.now());
}

/** Play notes sequentially (melody or arpeggio) */
export async function playSequence(
  notes: string[],
  noteDuration = '4n',
  speedFactor = 1.0
): Promise<void> {
  const s = await getSampler();
  const now = Tone.now();
  const dSecs = Tone.Time(noteDuration).toSeconds() / speedFactor;
  notes.forEach((note, i) => {
    s.triggerAttackRelease(note, noteDuration, now + i * dSecs);
  });
}

/** Play chord progression */
export async function playProgression(
  chordNotes: string[][],
  chordDuration = '2n',
  speedFactor = 1.0
): Promise<void> {
  const s = await getSampler();
  const now = Tone.now();
  const dSecs = Tone.Time(chordDuration).toSeconds() / speedFactor;
  chordNotes.forEach((notes, i) => {
    s.triggerAttackRelease(notes, chordDuration, now + i * dSecs);
  });
}

/** Play arpeggio (chord notes one by one) */
export async function playArpeggio(
  notes: string[],
  noteDuration = '8n',
  speedFactor = 1.0
): Promise<void> {
  const s = await getSampler();
  const now = Tone.now();
  const dSecs = Tone.Time(noteDuration).toSeconds() / speedFactor;
  notes.forEach((note, i) => {
    s.triggerAttackRelease(note, '4n', now + i * dSecs);
  });
}

/** Play metronome click */
export function playClick(accent = false): void {
  const synth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();
  synth.frequency.value = accent ? 800 : 400;
  synth.triggerAttackRelease('16n', Tone.now());
  setTimeout(() => synth.dispose(), 500);
}
