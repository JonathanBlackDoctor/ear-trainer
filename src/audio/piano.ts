// Audio engine: built-in synth (always works) + optional piano-sample upgrade.
import * as Tone from 'tone';

// ─── State ────────────────────────────────────────────────────────────────
let sampler: Tone.Sampler | null = null;
let synth: Tone.PolySynth | null = null;
let outputGain: Tone.Gain | null = null;
let audioStarted = false;
let samplerReady = false;
let samplerFailed = false;
// Salamander Grand Piano samples (public CDN) — used as a quality upgrade only.
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
  Object.entries(SAMPLE_NOTES).map(([note, file]) => [note, SALAMANDER_BASE + file])
);

// 0.05s lookahead — mobile AudioContext clocks lag right after resume, and
// scheduling at bare Tone.now() drops the note silently on iOS/Android.
const SCHEDULE_LOOKAHEAD = 0.05;

// ─── Output gain (kill switch) ──────────────────────────────────────────────
// All instruments route through this gain node so we can cut every active and
// already-scheduled note instantly when the user advances to the next question.
// Without this, the Sampler's release tail and any notes scheduled ahead via
// triggerAttackRelease(..., futureTime) bleed into the next question.
function getOutputGain(): Tone.Gain {
  if (!outputGain) {
    outputGain = new Tone.Gain(1).toDestination();
  }
  return outputGain;
}

// ─── Instrument setup ───────────────────────────────────────────────────────
/** Built-in synth — no network needed, always works. */
function getSynth(): Tone.PolySynth {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.35, release: 1.4 },
    }).connect(getOutputGain());
    synth.volume.value = -8;
  }
  return synth;
}

/**
 * Kick off loading of the high-quality piano sampler in the background.
 * Playback never waits on this — if it loads we upgrade to it, if it fails
 * we keep using the synth. Failures are recorded, not thrown.
 */
function loadSamplerInBackground(): void {
  if (sampler || samplerFailed) return;
  // Safety timeout: if samples don't arrive in time, stay on the synth.
  const timeout = setTimeout(() => {
    if (!samplerReady) {
      samplerFailed = true;
    }
  }, 10_000);
  try {
    sampler = new Tone.Sampler({
      urls: SAMPLE_URLS,
      onload: () => {
        samplerReady = true;
        clearTimeout(timeout);
      },
      onerror: (err) => {
        samplerFailed = true;
        samplerReady = false;
        clearTimeout(timeout);
        console.warn('[audio] piano samples failed to load, using built-in synth:', err);
      },
    }).connect(getOutputGain());
  } catch (err) {
    samplerFailed = true;
    clearTimeout(timeout);
    console.warn('[audio] could not create sampler, using built-in synth:', err);
  }
}

/** Returns whichever instrument is currently ready to play. */
function getInstrument(): Tone.Sampler | Tone.PolySynth {
  return sampler && samplerReady ? sampler : getSynth();
}

// ─── iOS silent-switch workaround ──────────────────────────────────────────
// On iOS, synthesized WebAudio is muted when the ringer switch is off UNLESS
// the page is also playing an HTMLMediaElement with `playsinline`. Looping a
// silent inline <audio> element promotes the audio session to a category that
// keeps playing through the mute switch.
let silentUnlockAudio: HTMLAudioElement | null = null;

/** Build a tiny silent WAV (1 sample, mono, 8kHz) as a data URL. */
function makeSilentWavDataUrl(): string {
  const sampleRate = 8000;
  const numSamples = 8000; // 1 second
  const headerSize = 44;
  const dataSize = numSamples * 2;
  const buf = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);   // PCM chunk size
  view.setUint16(20, 1, true);    // format = PCM
  view.setUint16(22, 1, true);    // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);    // block align
  view.setUint16(34, 16, true);   // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  // PCM samples remain 0 → silence
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

function unlockIOSSilentSwitch(): void {
  if (silentUnlockAudio) return;
  try {
    const a = document.createElement('audio');
    a.setAttribute('playsinline', 'true');
    a.setAttribute('webkit-playsinline', 'true');
    a.loop = true;
    a.preload = 'auto';
    a.src = makeSilentWavDataUrl();
    a.volume = 0.001;
    silentUnlockAudio = a;
    // play() must be inside a user gesture — startAudio() is always called from one.
    void a.play().catch(() => {
      silentUnlockAudio = null;
    });
  } catch {
    /* non-fatal */
  }
}

/** Make sure the underlying AudioContext is in `running` state. */
async function ensureRunning(): Promise<void> {
  const ctx = Tone.getContext();
  // @ts-expect-error — rawContext exposes the underlying AudioContext
  const raw: AudioContext | undefined = ctx.rawContext;
  if (raw && raw.state !== 'running') {
    try {
      await raw.resume();
    } catch {
      /* will retry next call */
    }
  }
}

// ─── Public lifecycle ────────────────────────────────────────────────────────
export async function startAudio(): Promise<void> {
  // iOS silent-switch unlock must run inside the user gesture every time
  // (idempotent — bails out if already unlocked).
  unlockIOSSilentSwitch();
  if (audioStarted) {
    await ensureRunning();
    return;
  }
  await Tone.start();
  await ensureRunning();
  audioStarted = true;
  getSynth();              // ensure guaranteed-sound instrument is ready now
  loadSamplerInBackground(); // try to upgrade to real piano samples
}

export function isAudioStarted(): boolean {
  return audioStarted;
}

export type AudioQuality = 'piano' | 'synth' | 'synth-fallback';

/** Tells the UI which instrument is in use so it can show a status note. */
export function getAudioStatus(): AudioQuality {
  if (sampler && samplerReady) return 'piano';
  if (samplerFailed) return 'synth-fallback';
  return 'synth';
}

// ─── Stop / scheduling helpers ──────────────────────────────────────────────
/**
 * Silence everything currently sounding or already scheduled.
 * Used when advancing to the next question so the previous question's release
 * tail and any notes still queued via triggerAttackRelease(..., futureTime)
 * don't overlap with the new question.
 *
 * We don't releaseAll/dispose the instruments — that doesn't cancel future
 * scheduled BufferSource starts inside Tone.Sampler. Instead we ramp the
 * shared output gain to 0 fast (5ms, to avoid clicks). Stale notes still fire
 * inside the audio graph but produce no sound, and the next playback restores
 * the gain to 1 exactly when its first note begins (see scheduleStart).
 */
export function stopAllAudio(): void {
  if (!audioStarted) return;
  const gain = getOutputGain();
  const now = Tone.now();
  const cur = gain.gain.value;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(cur, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.005);
}

/** Compute a start time for new playback and arm the gain to 1 at that moment. */
function scheduleStart(): number {
  const start = Tone.now() + SCHEDULE_LOOKAHEAD;
  const gain = getOutputGain();
  gain.gain.cancelScheduledValues(start);
  gain.gain.setValueAtTime(1, start);
  return start;
}

// ─── Playback helpers ─────────────────────────────────────────────────────────
/** Play a single note */
export async function playNote(note: string, duration = '2n'): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  getInstrument().triggerAttackRelease(note, duration, scheduleStart());
}

/** Play multiple notes simultaneously (chord) */
export async function playChord(notes: string[], duration = '2n'): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  getInstrument().triggerAttackRelease(notes, duration, scheduleStart());
}

/** Play notes sequentially (melody or arpeggio) */
export async function playSequence(
  notes: string[],
  noteDuration = '4n',
  speedFactor = 1.0
): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  const inst = getInstrument();
  const start = scheduleStart();
  const dSecs = Tone.Time(noteDuration).toSeconds() / speedFactor;
  notes.forEach((note, i) => {
    inst.triggerAttackRelease(note, noteDuration, start + i * dSecs);
  });
}

/** Play chord progression */
export async function playProgression(
  chordNotes: string[][],
  chordDuration = '2n',
  speedFactor = 1.0
): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  const inst = getInstrument();
  const start = scheduleStart();
  const dSecs = Tone.Time(chordDuration).toSeconds() / speedFactor;
  chordNotes.forEach((notes, i) => {
    inst.triggerAttackRelease(notes, chordDuration, start + i * dSecs);
  });
}

/** Play arpeggio (chord notes one by one) */
export async function playArpeggio(
  notes: string[],
  noteDuration = '8n',
  speedFactor = 1.0
): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  const inst = getInstrument();
  const start = scheduleStart();
  const dSecs = Tone.Time(noteDuration).toSeconds() / speedFactor;
  notes.forEach((note, i) => {
    inst.triggerAttackRelease(note, '4n', start + i * dSecs);
  });
}

/** Play metronome click (built-in, no network) */
export function playClick(accent = false): void {
  const synthClick = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).connect(getOutputGain());
  synthClick.frequency.value = accent ? 800 : 400;
  synthClick.triggerAttackRelease('16n', scheduleStart());
  setTimeout(() => synthClick.dispose(), 500);
}
