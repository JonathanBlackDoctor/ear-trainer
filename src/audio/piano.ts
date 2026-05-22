// Audio engine: built-in synth (always works) + optional piano-sample upgrade.
import * as Tone from 'tone';

// ─── State ────────────────────────────────────────────────────────────────
let sampler: Tone.Sampler | null = null;
let synth: Tone.PolySynth | null = null;
let outputGain: Tone.Gain | null = null;
let masterLimiter: Tone.Limiter | null = null;
let metronomeSynth: Tone.Synth | null = null;
let woodblockSynth: Tone.MembraneSynth | null = null;
let audioStarted = false;
let samplerReady = false;
let samplerFailed = false;
// Salamander Grand Piano samples bundled locally under public/samples/piano/.
// Serving from the same origin removes the CDN round-trip so the sampler is
// ready before the first question plays — the synth fallback below is only a
// safety net for the brief window before decoding completes.
const SALAMANDER_BASE = `${import.meta.env.BASE_URL}samples/piano/`;
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

// ─── Cancellable scheduling ─────────────────────────────────────────────────
// Notes inside a sequence/progression/arpeggio are dispatched via setTimeout
// (instead of being pre-scheduled in the audio thread) so we can actually
// cancel pending notes when the user advances/replays. The generation counter
// is a backstop: any setTimeout that survives a stopAllAudio() will see a
// changed gen and bail before triggering its note.
const pendingTimeouts = new Set<number>();
let playbackGen = 0;

function trackTimeout(fn: () => void, ms: number): number {
  const id = window.setTimeout(() => {
    pendingTimeouts.delete(id);
    fn();
  }, ms);
  pendingTimeouts.add(id);
  return id;
}

// ─── Output gain (kill switch) ──────────────────────────────────────────────
// All instruments route through this gain node so we can cut every active and
// already-scheduled note instantly when the user advances to the next question.
// Without this, the Sampler's release tail and any notes scheduled ahead via
// triggerAttackRelease(..., futureTime) bleed into the next question.
function getOutputGain(): Tone.Gain {
  if (!outputGain) {
    // Limiter at -1dB before destination so the +6dB master boost below cannot
    // clip when a 3-voice FM chord stacks with a click. Without it, raw gain=2
    // distorts on polyphonic playback.
    masterLimiter = new Tone.Limiter(-1).toDestination();
    outputGain = new Tone.Gain(2).connect(masterLimiter);
  }
  return outputGain;
}

// ─── Instrument setup ───────────────────────────────────────────────────────
// FM synthesis tuned for piano-ish behavior that stays musical when voices
// stack. Earlier we used modulationIndex 14 with a square modulator — that
// gave a single note a convincing "ping," but with three notes the rich
// sidebands clashed and produced a metallic clang that sounded worse than
// the original triangle. Now the modulator is a sine wave at the same
// frequency as the carrier (harmonicity 1 → octave-related overtones only)
// with a modest modulation index, so polyphony stays clean. The percussive
// shape still comes from `sustain: 0` plus a fast modulation envelope.
function getSynth(): Tone.PolySynth {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1,
      modulationIndex: 5,
      oscillator: { type: 'sine' },
      // release was 1.0s — far longer than the 50ms stop-mute window, so a
      // releaseAll() during stopAllAudio could not finish fading before the
      // gain restored to 1 and the tail bled into the next playback. 0.05s
      // is long enough to avoid a click but short enough that the envelope
      // is at zero by the time new playback begins.
      envelope: { attack: 0.003, decay: 0.8, sustain: 0, release: 0.05 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.05 },
    }).connect(getOutputGain());
    synth.volume.value = -6;
  }
  return synth;
}

/**
 * Load the piano sampler and resolve when every sample buffer is decoded.
 *
 * Earlier this ran in the background with a 10s "give up" timer so the first
 * note could play instantly via the synth fallback. But samples are now
 * bundled in `public/samples/piano/` and served same-origin, so the load is
 * fast and reliable enough to await before unlocking playback. The race the
 * old design had — timer fires, samplerFailed=true, UI polling stops, samples
 * actually finish loading later but UI never recovers — meant users saw the
 * "couldn't load piano samples" banner even when the sampler was working.
 *
 * The hard 30s emergency timeout below only exists so a stalled connection
 * doesn't pin the start-audio button forever; it resolves the promise
 * (does not reject) and we keep the synth fallback in that case.
 */
function loadSampler(): Promise<void> {
  if (sampler && samplerReady) return Promise.resolve();
  if (sampler) {
    // A previous attempt is still in flight — wait until it settles.
    return new Promise((resolve) => {
      const t = setInterval(() => {
        if (samplerReady || samplerFailed) {
          clearInterval(t);
          resolve();
        }
      }, 50);
    });
  }
  return new Promise((resolve) => {
    let settled = false;
    const settleOnce = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const emergencyTimeout = setTimeout(() => {
      if (!samplerReady) {
        samplerFailed = true;
        console.warn('[audio] piano sampler timed out after 30s, using synth fallback');
      }
      settleOnce();
    }, 30_000);
    try {
      sampler = new Tone.Sampler({
        urls: SAMPLE_URLS,
        // Short release so releaseAll() during stopAllAudio() silences active
        // notes inside the 50ms mute window. The natural ringing of the piano
        // sample is baked into the buffer; this only controls the fade when
        // we ask it to stop.
        release: 0.05,
        onload: () => {
          samplerReady = true;
          samplerFailed = false;
          clearTimeout(emergencyTimeout);
          settleOnce();
        },
        onerror: (err) => {
          samplerFailed = true;
          samplerReady = false;
          clearTimeout(emergencyTimeout);
          console.warn('[audio] piano samples failed to load, using built-in synth:', err);
          settleOnce();
        },
      }).connect(getOutputGain());
      sampler.volume.value = -3;
    } catch (err) {
      samplerFailed = true;
      clearTimeout(emergencyTimeout);
      console.warn('[audio] could not create sampler, using built-in synth:', err);
      settleOnce();
    }
  });
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
    // If a previous start ended on synth fallback (e.g. emergency timeout
    // fired) try to load the sampler again now that the user is back —
    // network conditions may have improved.
    if (samplerFailed && !sampler) {
      samplerFailed = false;
      await loadSampler();
    }
    return;
  }
  await Tone.start();
  await ensureRunning();
  audioStarted = true;
  getSynth();              // create synth eagerly so it can act as the safety net
  // Block on sampler load so the very first question already plays the piano
  // sample, not the FM synth fallback. Local bundling keeps this short
  // (~1-2s) and the caller (handleAudioStart) already shows a loading state.
  await loadSampler();
}

export function isAudioStarted(): boolean {
  return audioStarted;
}

/**
 * Snapshot of the current playback generation. Callers that orchestrate
 * multi-step async playback (e.g. "reference tone → 700ms gap → question
 * audio", or a rhythm-pattern loop) capture this at start, then bail if it
 * changes — that means stopAllAudio() ran and a new playback already began.
 */
export function getPlaybackGen(): number {
  return playbackGen;
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
 *
 * Three layers of defense, each one needed:
 *   1) Clear pending JS-side setTimeouts so notes 2..N of a sequence that
 *      haven't fired yet never fire. (The first note of any playback is
 *      scheduled directly in the audio thread; the rest go through
 *      trackTimeout — see playSequence/playProgression/playArpeggio.)
 *   2) Bump playbackGen so any setTimeout that races past the clear above
 *      bails out instead of triggering a stale note.
 *   3) releaseAll() on both instruments to start the envelope release on
 *      anything currently sounding, AND drop the output gain to 0 hard so
 *      already-fired BufferSources/oscillators that we can't cancel at the
 *      audio-context level become inaudible. We DO NOT restore the gain
 *      here — scheduleStart() lifts it back to 1 only at the moment new
 *      playback begins.
 *
 * Earlier this only ramped the gain to 0 for 5ms and let scheduleStart
 * restore it 50ms later. That window was too narrow for the synth's 1s
 * release tail to fade, so notes from the previous question bled into the
 * next one whenever the user hit 다시 듣기 / 기준음 / 다음 mid-playback.
 */
export function stopAllAudio(): void {
  if (!audioStarted) return;
  for (const id of pendingTimeouts) clearTimeout(id);
  pendingTimeouts.clear();
  playbackGen++;
  try { sampler?.releaseAll(); } catch { /* ignore */ }
  try { synth?.releaseAll(); } catch { /* ignore */ }
  const gain = getOutputGain();
  const now = Tone.now();
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0, now);
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

// Each playSequence/playProgression/playArpeggio fires its first item
// immediately on the audio thread (so the user gets instant feedback on tap)
// and dispatches the rest via trackTimeout. Pre-scheduling everything in the
// audio thread — as we used to — meant a 4s melody queued 4s of un-cancellable
// notes, so stopAllAudio() was powerless to silence them.
function firePlayback(
  items: Array<string | string[]>,
  noteDuration: string,
  perItemSec: number,
  triggerDuration: string = noteDuration,
): void {
  const inst = getInstrument();
  const gen = playbackGen;
  // First item rides the audio-thread start so it lands with the gain ramp.
  inst.triggerAttackRelease(items[0] as any, triggerDuration, scheduleStart());
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    trackTimeout(() => {
      if (gen !== playbackGen) return; // stop was called — skip
      getInstrument().triggerAttackRelease(item as any, triggerDuration, scheduleStart());
    }, i * perItemSec * 1000);
  }
}

/** Play notes sequentially (melody or arpeggio) */
export async function playSequence(
  notes: string[],
  noteDuration = '4n',
  speedFactor = 1.0
): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  firePlayback(notes, noteDuration, Tone.Time(noteDuration).toSeconds() / speedFactor);
}

/** Play chord progression */
export async function playProgression(
  chordNotes: string[][],
  chordDuration = '2n',
  speedFactor = 1.0
): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  firePlayback(chordNotes, chordDuration, Tone.Time(chordDuration).toSeconds() / speedFactor);
}

/** Play arpeggio (chord notes one by one) */
export async function playArpeggio(
  notes: string[],
  noteDuration = '8n',
  speedFactor = 1.0
): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  // Note value sent to triggerAttackRelease is '4n' (longer than the gap
  // between notes) so consecutive arpeggio notes can ring through each other.
  firePlayback(notes, noteDuration, Tone.Time(noteDuration).toSeconds() / speedFactor, '4n');
}

// ─── Metronome click (count-in, tempo/bpm modes) ──────────────────────────
// Clean sine beep — accent one octave above (G5) so the downbeat is obvious
// without any timbral confusion with the rhythm-pattern woodblock that follows.
function getMetronomeSynth(): Tone.Synth {
  if (!metronomeSynth) {
    metronomeSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
    }).connect(getOutputGain());
    metronomeSynth.volume.value = -8;
  }
  return metronomeSynth;
}

export function playMetronomeClick(accent = false): void {
  const m = getMetronomeSynth();
  m.triggerAttackRelease(accent ? 'G5' : 'G4', '32n', scheduleStart());
}

// ─── Rhythm woodblock (the answer pattern in rhythm mode) ─────────────────
// MembraneSynth gives a short pitched impulse — woodblock-ish "tok". Distinct
// timbre from the count-in sine so the user instantly hears where the answer
// begins. Accent on C5, weak beats on G4.
function getWoodblockSynth(): Tone.MembraneSynth {
  if (!woodblockSynth) {
    woodblockSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.0001, decay: 0.06, sustain: 0, release: 0.02 },
    }).connect(getOutputGain());
    woodblockSynth.volume.value = -3;
  }
  return woodblockSynth;
}

export function playRhythmClick(accent = false): void {
  const w = getWoodblockSynth();
  w.triggerAttackRelease(accent ? 'C5' : 'G4', '32n', scheduleStart());
}

/**
 * Play a steady metronome at `bpm` for `beats` beats.
 * First beat is accented. Resolves when the last click has been fired.
 * Bails early if stopAllAudio() is called mid-pattern.
 *
 * The inter-click wait uses a plain setTimeout (not trackTimeout) — clearing
 * it would leave the await hanging forever. Instead the gen check at the top
 * of each iteration short-circuits the loop before the next click fires; in
 * the worst case one beat of silent wait runs after the stop.
 */
export async function playMetronome(bpm: number, beats: number): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  const beatMs = 60_000 / bpm;
  const gen = playbackGen;
  for (let i = 0; i < beats; i++) {
    if (gen !== playbackGen) return;
    playMetronomeClick(i === 0);
    if (i < beats - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, beatMs));
    }
  }
}
