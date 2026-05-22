// Audio engine: built-in synth (always works) + optional piano-sample upgrade.
import * as Tone from 'tone';

// ─── State ────────────────────────────────────────────────────────────────
let sampler: Tone.Sampler | null = null;
let synth: Tone.PolySynth | null = null;
let outputGain: Tone.Gain | null = null;
let masterLimiter: Tone.Limiter | null = null;
let metronomeSynth: Tone.Synth | null = null;
let woodblockSynth: Tone.MembraneSynth | null = null;
let referenceSynth: Tone.PolySynth | null = null;
let audioStarted = false;
let samplerReady = false;
let samplerFailed = false;
// Salamander Grand Piano samples bundled locally under public/samples/piano/.
// Serving from the same origin removes the CDN round-trip so the sampler is
// ready before the first question plays — the synth fallback below is only a
// safety net for the brief window before decoding completes.
const SALAMANDER_BASE = `${import.meta.env.BASE_URL}samples/piano/`;
const SAMPLE_NOTES: Record<string, string> = {
  // KEYS must be note names Tone.js can parse (`#` for sharps, NOT `s` — Tone's
  // isNote regex only accepts /[a-g](b|#|x|bb)?\d+/i, so "Ds1" silently throws
  // an assertion inside Sampler's constructor and the whole sampler dies even
  // though the URL string itself is fine). Filenames keep the `s` notation
  // because that's the on-disk naming convention from Tonejs/audio Salamander.
  A0:    'A0.mp3',  C1:    'C1.mp3',  'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
  A1:    'A1.mp3',  C2:    'C2.mp3',  'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
  A2:    'A2.mp3',  C3:    'C3.mp3',  'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
  A3:    'A3.mp3',  C4:    'C4.mp3',  'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
  A4:    'A4.mp3',  C5:    'C5.mp3',  'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
  A5:    'A5.mp3',  C6:    'C6.mp3',  'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
  A6:    'A6.mp3',  C7:    'C7.mp3',
};

// Mobile devices (and any browser reporting saveData) get a sparser sample set
// so the parallel fetch+decode storm at startup doesn't peg the CPU. Tone.js
// pitch-shifts the nearest sample to fill the gaps; the quality cost is
// negligible compared to the heat / battery savings on phones.
const isMobileLike: boolean = (() => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
})();

const MOBILE_SAMPLE_KEYS = ['A1', 'A2', 'C3', 'A3', 'C4', 'A4', 'C5', 'A5', 'C6'];

const ACTIVE_SAMPLE_NOTES: Record<string, string> = isMobileLike
  ? Object.fromEntries(
      Object.entries(SAMPLE_NOTES).filter(([k]) => MOBILE_SAMPLE_KEYS.includes(k))
    )
  : SAMPLE_NOTES;

const SAMPLE_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(ACTIVE_SAMPLE_NOTES).map(([note, file]) => [note, SALAMANDER_BASE + file])
);

// ─── Diagnostics ────────────────────────────────────────────────────────────
// loadSampler() populates this. Exposed via getSamplerDiagnostics() and
// window.__pianoSampleReport so we (or the user on mobile) can see exactly
// which sample failed and with what HTTP status / decode error.
interface SampleLoadEntry {
  key: string;
  url: string;
  status: number | null;        // HTTP status; null if fetch threw before a response
  ok: boolean;                  // fetch + decode both succeeded
  decodeError?: string;
  bytes?: number;
}
interface SamplerDiagnostics {
  base: string;
  resolvedBase: string;         // SALAMANDER_BASE resolved against document.baseURI
  startedAt: number;
  finishedAt: number | null;
  entries: SampleLoadEntry[];
  loadedKeys: string[];
  reason: 'pending' | 'ready' | 'failed' | 'timeout' | 'exception';
}
let diagnostics: SamplerDiagnostics | null = null;

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

  // Resolve base against document.baseURI so the logged URL is a real
  // absolute URL — any BASE_URL / HashRouter resolution quirk shows up here
  // instead of being hidden inside Tone.js's fetch.
  const resolvedBase = new URL(SALAMANDER_BASE, document.baseURI).href;
  diagnostics = {
    base: SALAMANDER_BASE,
    resolvedBase,
    startedAt: performance.now(),
    finishedAt: null,
    entries: [],
    loadedKeys: [],
    reason: 'pending',
  };
  (window as unknown as { __pianoSampleReport?: SamplerDiagnostics }).__pianoSampleReport = diagnostics;
  console.info('[audio] sampler load starting', {
    base: SALAMANDER_BASE,
    resolvedBase,
    count: Object.keys(SAMPLE_URLS).length,
  });

  return new Promise((resolve) => {
    let settled = false;
    const settleOnce = () => {
      if (settled) return;
      settled = true;
      if (diagnostics) diagnostics.finishedAt = performance.now();
      resolve();
    };

    // Hard cap. If individual fetches stall forever we still want
    // startAudio() to return so the synth fallback is at least available.
    // We only mark failed if NOTHING loaded by then — partial success still
    // proceeds.
    // Tighter timeout on mobile so a stalled 3G connection doesn't lock the
    // UI behind the loading spinner. The synth fallback is good enough to
    // start the session; the sampler can finish loading in the background and
    // be swapped in via the getAudioStatus() polling on the Train screen.
    const emergencyTimeoutMs = isMobileLike ? 8_000 : 30_000;
    const emergencyTimeout = setTimeout(() => {
      if (!samplerReady) {
        const loaded = diagnostics?.loadedKeys.length ?? 0;
        if (loaded === 0) {
          samplerFailed = true;
          if (diagnostics) diagnostics.reason = 'timeout';
          console.warn(`[audio] piano sampler timed out after ${emergencyTimeoutMs}ms with 0 samples — using synth fallback`);
        } else {
          console.warn(`[audio] piano sampler timed out after ${emergencyTimeoutMs}ms with ${loaded} samples loaded — proceeding`);
        }
      }
      settleOnce();
    }, emergencyTimeoutMs);

    void (async () => {
      // @ts-expect-error — rawContext exposes the underlying AudioContext
      const rawCtx: AudioContext | undefined = Tone.getContext().rawContext;
      if (!rawCtx) {
        samplerFailed = true;
        if (diagnostics) diagnostics.reason = 'exception';
        clearTimeout(emergencyTimeout);
        console.warn('[audio] no AudioContext available — using synth fallback');
        settleOnce();
        return;
      }

      // Fetch + decode every URL in parallel. Per-key failure is captured in
      // diagnostics but does NOT abort the whole load — that's the core
      // resilience fix vs. Tone.Sampler.onerror's all-or-nothing semantics.
      const results = await Promise.all(
        Object.entries(SAMPLE_URLS).map(
          async ([key, url]): Promise<[string, AudioBuffer | null, SampleLoadEntry]> => {
            const entry: SampleLoadEntry = { key, url, status: null, ok: false };
            try {
              // force-cache lets workbox CacheFirst serve from cache when
              // available; falls back to normal network fetch otherwise.
              const res = await fetch(url, { cache: 'force-cache' });
              entry.status = res.status;
              if (!res.ok) {
                console.warn(`[audio] sample ${key}: HTTP ${res.status} for ${url}`);
                return [key, null, entry];
              }
              const buf = await res.arrayBuffer();
              entry.bytes = buf.byteLength;
              try {
                const decoded = await rawCtx.decodeAudioData(buf.slice(0));
                entry.ok = true;
                return [key, decoded, entry];
              } catch (decodeErr) {
                entry.decodeError = String(decodeErr);
                console.warn(`[audio] sample ${key}: decode failed`, decodeErr);
                return [key, null, entry];
              }
            } catch (fetchErr) {
              entry.decodeError = String(fetchErr);
              console.warn(`[audio] sample ${key}: fetch failed`, fetchErr);
              return [key, null, entry];
            }
          }
        )
      );

      if (settled) return; // emergency timeout already won the race

      const goodUrls: Record<string, AudioBuffer> = {};
      const loadedKeys: string[] = [];
      for (const [key, buf, entry] of results) {
        diagnostics?.entries.push(entry);
        if (buf) {
          goodUrls[key] = buf;
          loadedKeys.push(key);
        }
      }
      if (diagnostics) diagnostics.loadedKeys = loadedKeys;

      const total = Object.keys(SAMPLE_URLS).length;
      console.info(`[audio] sampler fetch complete: ${loadedKeys.length}/${total} samples loaded`, { loadedKeys });

      if (loadedKeys.length === 0) {
        samplerFailed = true;
        samplerReady = false;
        if (diagnostics) diagnostics.reason = 'failed';
        clearTimeout(emergencyTimeout);
        console.warn('[audio] no piano samples loaded — using synth fallback');
        settleOnce();
        return;
      }

      // Hand the pre-decoded AudioBuffers to Tone.Sampler. Tone v14 accepts
      // AudioBuffer values in `urls` and skips its own fetch+decode for those
      // entries, so onerror won't fire for individual buffer failures.
      try {
        sampler = new Tone.Sampler({
          urls: goodUrls as unknown as Record<string, string>,
          // Short release so releaseAll() during stopAllAudio() silences active
          // notes inside the 50ms mute window.
          release: 0.05,
          onload: () => {
            samplerReady = true;
            samplerFailed = false;
            if (diagnostics) diagnostics.reason = 'ready';
            clearTimeout(emergencyTimeout);
            console.info(`[audio] sampler ready with ${loadedKeys.length}/${total} samples`);
            settleOnce();
          },
          onerror: (err) => {
            // Shouldn't fire — we passed pre-decoded buffers. Treat as a
            // construction-time failure if it does.
            if (!samplerReady) {
              samplerFailed = true;
              if (diagnostics) diagnostics.reason = 'failed';
            }
            clearTimeout(emergencyTimeout);
            console.warn('[audio] unexpected sampler.onerror after pre-decode:', err);
            settleOnce();
          },
        }).connect(getOutputGain());
        sampler.volume.value = -3;
      } catch (err) {
        samplerFailed = true;
        if (diagnostics) diagnostics.reason = 'exception';
        clearTimeout(emergencyTimeout);
        console.warn('[audio] could not create sampler, using built-in synth:', err);
        settleOnce();
      }
    })();
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

// Pause the silent track so the audio decoder doesn't keep the device awake
// between playbacks. The element stays in memory so a later play() can resume
// without needing another user gesture (the original gesture already promoted
// the audio session category).
function pauseIOSSilentSwitch(): void {
  try { silentUnlockAudio?.pause(); } catch { /* ignore */ }
}

// Resume the silent track at the start of a new playback window so iOS keeps
// honoring the audio session through the mute switch.
function resumeIOSSilentSwitch(): void {
  if (!silentUnlockAudio) return;
  if (!silentUnlockAudio.paused) return;
  void silentUnlockAudio.play().catch(() => { /* ignore — gesture may have lapsed */ });
}

// Register once: pause everything when the tab is hidden so backgrounded
// sessions stop heating the device. Re-registration is a no-op because the
// listener identity is stable.
let visibilityHandlerRegistered = false;
function registerVisibilityPause(): void {
  if (visibilityHandlerRegistered) return;
  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pauseIOSSilentSwitch();
      try {
        for (const id of pendingTimeouts) clearTimeout(id);
        pendingTimeouts.clear();
        playbackGen++;
        sampler?.releaseAll();
        synth?.releaseAll();
        referenceSynth?.releaseAll();
      } catch { /* ignore */ }
    }
  });
  visibilityHandlerRegistered = true;
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
  registerVisibilityPause();
  if (audioStarted) {
    await ensureRunning();
    // If a previous start ended on synth fallback (e.g. emergency timeout
    // fired) try to load the sampler again now that the user is back —
    // network conditions may have improved.
    if (samplerFailed && !sampler) {
      samplerFailed = false;
      diagnostics = null;
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

/** Snapshot of the last sampler load attempt — for debugging in the console. */
export function getSamplerDiagnostics(): SamplerDiagnostics | null {
  return diagnostics ? { ...diagnostics, entries: [...diagnostics.entries] } : null;
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
  try { referenceSynth?.releaseAll(); } catch { /* ignore */ }
  const gain = getOutputGain();
  const now = Tone.now();
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0, now);
  // Park the iOS silent-switch track too. scheduleStart() resumes it before
  // the next note so the mute-switch workaround still works.
  pauseIOSSilentSwitch();
}

/** Compute a start time for new playback and arm the gain to 1 at that moment. */
function scheduleStart(): number {
  resumeIOSSilentSwitch();
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

// Reference-tone synth — soft sine pad, intentionally different timbre from the
// piano sampler. The reference tone (기준음) and the question's listening notes
// used to share the piano sample and blended together; using a pitch-pipe-like
// sine makes the reference instantly recognizable as "the anchor."
function getReferenceSynth(): Tone.PolySynth {
  if (!referenceSynth) {
    referenceSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.4 },
    }).connect(getOutputGain());
    referenceSynth.volume.value = -10;
  }
  return referenceSynth;
}

/** Play the reference (key-center) tone with a distinct sine timbre. */
export async function playReferenceTone(note: string, duration = '2n'): Promise<void> {
  if (!audioStarted) await startAudio();
  await ensureRunning();
  getReferenceSynth().triggerAttackRelease(note, duration, scheduleStart());
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
