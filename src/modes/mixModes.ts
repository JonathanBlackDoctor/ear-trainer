import type { ChoiceOption } from '../components/ChoiceGrid';
import type { ModeKey, MixEffect } from '../types';

// ─── Audio-engineer (mixing) modes ──────────────────────────────────────────
// EQ / FX listening trainers. Each mode plays pink noise or a synthesized
// groove through a Tone.js processing chain; the learner identifies the
// processing. Mode metadata + level curricula + answer choices live here; the
// audio chain lives in audio/piano.ts and the question factory in
// engine/questionFactory.ts.

// What the question factory needs to render & play one mix question.
export interface MixBuild {
  source: 'pink' | 'loop';
  compare: 'none' | 'ab';
  params: Record<string, number | string>;
  detail: string; // human-readable answer detail for feedback, e.g. "2 kHz · +6 dB"
}

const ALL_BANDS = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

function formatHz(hz: number): string {
  return hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const cfgAt = <T>(table: Record<number, T>, level: number): T =>
  table[level] ?? table[Math.max(...Object.keys(table).map(Number).filter((k) => k <= level))] ?? table[1];

// ─── EQ: frequency identification ───────────────────────────────────────────
const EQ_FREQ_LEVELS: Record<number, { bands: number[]; gain: number; q: number; cut: boolean }> = {
  1:  { bands: [125, 1000, 8000], gain: 12, q: 1.4, cut: false },
  2:  { bands: [125, 500, 1000, 4000, 8000], gain: 12, q: 1.4, cut: false },
  3:  { bands: [63, 250, 1000, 4000, 16000], gain: 9, q: 1.8, cut: false },
  4:  { bands: ALL_BANDS, gain: 9, q: 2.0, cut: false },
  5:  { bands: ALL_BANDS, gain: 6, q: 2.2, cut: true },
  6:  { bands: ALL_BANDS, gain: 6, q: 2.6, cut: true },
  7:  { bands: ALL_BANDS, gain: 5, q: 3.0, cut: true },
  8:  { bands: ALL_BANDS, gain: 4, q: 3.4, cut: true },
  9:  { bands: ALL_BANDS, gain: 3, q: 4.0, cut: true },
  10: { bands: ALL_BANDS, gain: 2, q: 5.0, cut: true },
};

// ─── EQ: boost vs cut ───────────────────────────────────────────────────────
const EQ_BOOSTCUT_LEVELS: Record<number, { bands: number[]; gain: number; q: number }> = {
  1:  { bands: [1000], gain: 12, q: 1.4 },
  2:  { bands: [250, 4000], gain: 12, q: 1.4 },
  3:  { bands: [125, 1000, 8000], gain: 9, q: 1.8 },
  4:  { bands: [250, 1000, 4000], gain: 9, q: 2.2 },
  5:  { bands: ALL_BANDS, gain: 6, q: 2.6 },
  6:  { bands: ALL_BANDS, gain: 6, q: 3.0 },
  7:  { bands: ALL_BANDS, gain: 5, q: 3.2 },
  8:  { bands: ALL_BANDS, gain: 4, q: 3.6 },
  9:  { bands: ALL_BANDS, gain: 3, q: 4.0 },
  10: { bands: ALL_BANDS, gain: 2, q: 4.5 },
};

// ─── Filter ─────────────────────────────────────────────────────────────────
type FilterType = 'lowpass' | 'highpass' | 'bandpass';
const FILTER_LABEL: Record<FilterType, string> = {
  lowpass: '로우패스 (LPF)',
  highpass: '하이패스 (HPF)',
  bandpass: '밴드패스 (BPF)',
};
const FILTER_LEVELS: Record<number, { task: 'cutoff' | 'type'; types: FilterType[]; cutoffs: number[] }> = {
  1:  { task: 'cutoff', types: ['lowpass'], cutoffs: [500, 2000, 8000] },
  2:  { task: 'cutoff', types: ['highpass'], cutoffs: [125, 500, 2000] },
  3:  { task: 'cutoff', types: ['lowpass', 'highpass'], cutoffs: [250, 1000, 4000, 16000] },
  4:  { task: 'cutoff', types: ['lowpass', 'highpass'], cutoffs: [125, 500, 2000, 8000] },
  5:  { task: 'type', types: ['lowpass', 'highpass'], cutoffs: [1000] },
  6:  { task: 'type', types: ['lowpass', 'highpass', 'bandpass'], cutoffs: [1000] },
  7:  { task: 'type', types: ['lowpass', 'highpass', 'bandpass'], cutoffs: [500, 2000] },
  8:  { task: 'cutoff', types: ['lowpass', 'highpass', 'bandpass'], cutoffs: [125, 350, 1000, 3000, 8000] },
  9:  { task: 'type', types: ['lowpass', 'highpass', 'bandpass'], cutoffs: [350, 1500, 6000] },
  10: { task: 'cutoff', types: ['lowpass', 'highpass', 'bandpass'], cutoffs: [80, 250, 700, 2000, 6000, 12000] },
};

// ─── Compression ──────────────────────────────────────────────────────────--
type CompAmount = 'none' | 'light' | 'medium' | 'strong';
const COMP_LABEL: Record<CompAmount, string> = {
  none: '압축 없음', light: '약하게', medium: '중간', strong: '강하게',
};
const COMP_SETTINGS: Record<CompAmount, { ratio: number; threshold: number; makeupDb: number }> = {
  none:   { ratio: 1,  threshold: 0,   makeupDb: 0 },
  light:  { ratio: 2,  threshold: -18, makeupDb: 2 },
  medium: { ratio: 4,  threshold: -24, makeupDb: 4 },
  strong: { ratio: 8,  threshold: -30, makeupDb: 6 },
};
// makeupScale shrinks the make-up gain so loudness stops being a giveaway — at
// the top levels you must judge by the dynamics (pumping/density), not volume.
const COMP_LEVELS: Record<number, { amounts: CompAmount[]; makeupScale: number }> = {
  1:  { amounts: ['none', 'strong'], makeupScale: 1 },
  2:  { amounts: ['none', 'light', 'strong'], makeupScale: 1 },
  3:  { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 1 },
  4:  { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 1 },
  5:  { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 0.8 },
  6:  { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 0.65 },
  7:  { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 0.5 },
  8:  { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 0.35 },
  9:  { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 0.2 },
  10: { amounts: ['none', 'light', 'medium', 'strong'], makeupScale: 0 },
};

// ─── Reverb amount ──────────────────────────────────────────────────────────
type RevAmount = 'dry' | 'small' | 'medium' | 'large';
const REV_AMT_LABEL: Record<RevAmount, string> = {
  dry: '드라이 (없음)', small: '살짝', medium: '중간', large: '많이',
};
const REV_AMT_WET: Record<RevAmount, number> = { dry: 0, small: 0.18, medium: 0.35, large: 0.6 };
// wetScale compresses the gap between adjacent amounts at higher levels, so the
// differences in reverb wetness become progressively subtler to hear.
const REVERB_AMT_LEVELS: Record<number, { amounts: RevAmount[]; wetScale: number }> = {
  1:  { amounts: ['dry', 'large'], wetScale: 1 },
  2:  { amounts: ['dry', 'medium', 'large'], wetScale: 1 },
  3:  { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 1 },
  4:  { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 1 },
  5:  { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 0.9 },
  6:  { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 0.8 },
  7:  { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 0.7 },
  8:  { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 0.6 },
  9:  { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 0.5 },
  10: { amounts: ['dry', 'small', 'medium', 'large'], wetScale: 0.45 },
};

// ─── Reverb type ──────────────────────────────────────────────────────────--
type RevType = 'room' | 'hall' | 'plate';
const REV_TYPE_LABEL: Record<RevType, string> = {
  room: '룸 (Room)', hall: '홀 (Hall)', plate: '플레이트 (Plate)',
};
const REV_TYPE_SETTINGS: Record<RevType, { decay: number; preDelay: number; wet: number }> = {
  room:  { decay: 0.8, preDelay: 0.005, wet: 0.32 },
  hall:  { decay: 2.6, preDelay: 0.03,  wet: 0.32 },
  plate: { decay: 1.4, preDelay: 0.0,   wet: 0.34 },
};
const REVERB_TYPE_LEVELS: Record<number, { types: RevType[] }> = {
  1: { types: ['room', 'hall'] },
  2: { types: ['room', 'hall', 'plate'] },
};

// ─── Delay time ──────────────────────────────────────────────────────────---
type DelayNote = '16' | '16d' | '8t' | '8' | '8d' | '4' | '2';
const DELAY_LABEL: Record<DelayNote, string> = {
  '16': '1/16', '16d': '점16분 (1/16.)', '8t': '셋잇단8분 (1/8T)',
  '8': '1/8', '8d': '점8분 (1/8.)', '4': '1/4', '2': '1/2',
};
const DELAY_MS: Record<DelayNote, number> = {
  '16': 125, '16d': 187, '8t': 167, '8': 250, '8d': 375, '4': 500, '2': 1000,
};
const DELAY_LEVELS: Record<number, { notes: DelayNote[] }> = {
  1: { notes: ['16', '4'] },
  2: { notes: ['16', '8', '4'] },
  3: { notes: ['16', '8', '8d', '4'] },
  4: { notes: ['16', '8', '8d', '4', '2'] },
  5: { notes: ['16', '16d', '8', '8d', '4'] },
  6: { notes: ['16', '16d', '8t', '8', '8d', '4'] },
  7: { notes: ['16', '16d', '8t', '8', '8d', '4', '2'] },
};

// ─── Pan ─────────────────────────────────────────────────────────────────---
const PAN_VALUE: Record<string, number> = {
  L: -1, C: 0, R: 1, L70: -0.7, L30: -0.35, R30: 0.35, R70: 0.7, L15: -0.15, R15: 0.15,
};
const PAN_LABEL: Record<string, string> = {
  L: '왼쪽', C: '가운데', R: '오른쪽',
  L70: '왼쪽 (강)', L30: '왼쪽 (약)', R30: '오른쪽 (약)', R70: '오른쪽 (강)',
  L15: '왼쪽 (살짝)', R15: '오른쪽 (살짝)',
};
const PAN_LEVELS: Record<number, { positions: string[] }> = {
  1: { positions: ['L', 'C', 'R'] },
  2: { positions: ['L70', 'L30', 'C', 'R30', 'R70'] },
  3: { positions: ['L70', 'L30', 'L15', 'C', 'R15', 'R30', 'R70'] },
};

// ─── Stereo width ─────────────────────────────────────────────────────────--
type Width = 'mono' | 'narrow' | 'mid' | 'wide';
const WIDTH_LABEL: Record<Width, string> = { mono: '모노', narrow: '좁게', mid: '중간', wide: '넓게' };
const WIDTH_VALUE: Record<Width, number> = { mono: 0, narrow: 0.3, mid: 0.6, wide: 1 };
const WIDTH_LEVELS: Record<number, { widths: Width[] }> = {
  1: { widths: ['mono', 'wide'] },
  2: { widths: ['mono', 'narrow', 'wide'] },
  3: { widths: ['mono', 'narrow', 'mid', 'wide'] },
};

// ─── Level (gain) ─────────────────────────────────────────────────────────--
const LEVEL_LEVELS: Record<number, { task: 'which' | 'amount'; dbs: number[] }> = {
  1:  { task: 'which', dbs: [6] },
  2:  { task: 'which', dbs: [3] },
  3:  { task: 'which', dbs: [2] },
  4:  { task: 'which', dbs: [1] },
  5:  { task: 'amount', dbs: [3, 6] },
  6:  { task: 'amount', dbs: [1, 3, 6] },
  7:  { task: 'amount', dbs: [1, 3, 6] },
  8:  { task: 'amount', dbs: [1, 2, 3, 6] },
  9:  { task: 'amount', dbs: [0.5, 1, 2, 3] },
  10: { task: 'amount', dbs: [0.5, 1, 1.5, 2, 3] },
};

// ─── Distortion ──────────────────────────────────────────────────────────---
type DistAmount = 'clean' | 'subtle' | 'light' | 'medium' | 'heavy';
const DIST_LABEL: Record<DistAmount, string> = { clean: '클린', subtle: '아주 약간', light: '약간', medium: '중간', heavy: '강하게' };
const DIST_VALUE: Record<DistAmount, number> = { clean: 0, subtle: 0.08, light: 0.18, medium: 0.4, heavy: 0.8 };
const DIST_LEVELS: Record<number, { amounts: DistAmount[] }> = {
  1: { amounts: ['clean', 'heavy'] },
  2: { amounts: ['clean', 'light', 'heavy'] },
  3: { amounts: ['clean', 'light', 'medium', 'heavy'] },
  4: { amounts: ['clean', 'subtle', 'light', 'medium', 'heavy'] },
};

// ─── Modulation ──────────────────────────────────────────────────────────---
type ModType = 'chorus' | 'phaser' | 'tremolo';
const MOD_LABEL: Record<ModType, string> = { chorus: '코러스 (Chorus)', phaser: '페이저 (Phaser)', tremolo: '트레몰로 (Tremolo)' };
const MOD_LEVELS: Record<number, { types: ModType[] }> = {
  1: { types: ['chorus', 'tremolo'] },
  2: { types: ['chorus', 'phaser', 'tremolo'] },
};

// ─── Per-effect choices + build ───────────────────────────────────────────--
export function getMixChoices(effect: MixEffect, level: number): ChoiceOption[] {
  switch (effect) {
    case 'eq-freq':
      return cfgAt(EQ_FREQ_LEVELS, level).bands.map((b) => ({ value: String(b), label: formatHz(b) }));
    case 'eq-boostcut':
      return [{ value: 'boost', label: '부스트 (Boost)' }, { value: 'cut', label: '컷 (Cut)' }];
    case 'filter': {
      const c = cfgAt(FILTER_LEVELS, level);
      return c.task === 'cutoff'
        ? c.cutoffs.map((f) => ({ value: String(f), label: formatHz(f) }))
        : c.types.map((t) => ({ value: t, label: FILTER_LABEL[t] }));
    }
    case 'compression':
      return cfgAt(COMP_LEVELS, level).amounts.map((a) => ({ value: a, label: COMP_LABEL[a] }));
    case 'reverb-amount':
      return cfgAt(REVERB_AMT_LEVELS, level).amounts.map((a) => ({ value: a, label: REV_AMT_LABEL[a] }));
    case 'reverb-type':
      return cfgAt(REVERB_TYPE_LEVELS, level).types.map((t) => ({ value: t, label: REV_TYPE_LABEL[t] }));
    case 'delay-time':
      return cfgAt(DELAY_LEVELS, level).notes.map((n) => ({ value: n, label: DELAY_LABEL[n] }));
    case 'pan':
      return cfgAt(PAN_LEVELS, level).positions.map((p) => ({ value: p, label: PAN_LABEL[p] }));
    case 'width':
      return cfgAt(WIDTH_LEVELS, level).widths.map((w) => ({ value: w, label: WIDTH_LABEL[w] }));
    case 'level': {
      const c = cfgAt(LEVEL_LEVELS, level);
      return c.task === 'which'
        ? [{ value: 'first', label: '첫 번째' }, { value: 'second', label: '두 번째' }]
        : c.dbs.map((d) => ({ value: String(d), label: `${d} dB` }));
    }
    case 'distortion':
      return cfgAt(DIST_LEVELS, level).amounts.map((a) => ({ value: a, label: DIST_LABEL[a] }));
    case 'modulation':
      return cfgAt(MOD_LEVELS, level).types.map((t) => ({ value: t, label: MOD_LABEL[t] }));
  }
}

// Given a chosen answer value, produce the playback config + feedback detail.
export function buildMix(effect: MixEffect, level: number, value: string): MixBuild {
  switch (effect) {
    case 'eq-freq': {
      const c = cfgAt(EQ_FREQ_LEVELS, level);
      const freq = Number(value);
      const sign = c.cut && Math.random() < 0.5 ? -1 : 1;
      const gainDb = sign * c.gain;
      return {
        source: 'pink', compare: 'none',
        params: { freq, gainDb, q: c.q },
        detail: `${formatHz(freq)} · ${gainDb > 0 ? '+' : ''}${gainDb} dB`,
      };
    }
    case 'eq-boostcut': {
      const c = cfgAt(EQ_BOOSTCUT_LEVELS, level);
      const freq = pick(c.bands);
      const gainDb = value === 'boost' ? c.gain : -c.gain;
      return {
        source: 'pink', compare: 'ab',
        params: { freq, gainDb, q: c.q },
        detail: `${formatHz(freq)} · ${value === 'boost' ? '부스트 +' : '컷 −'}${c.gain} dB`,
      };
    }
    case 'filter': {
      const c = cfgAt(FILTER_LEVELS, level);
      if (c.task === 'cutoff') {
        const filterType = pick(c.types);
        const freq = Number(value);
        return {
          source: 'pink', compare: 'none',
          params: { filterType, freq },
          detail: `${FILTER_LABEL[filterType]} · ${formatHz(freq)}`,
        };
      }
      const filterType = value as FilterType;
      const freq = pick(c.cutoffs);
      return {
        source: 'pink', compare: 'none',
        params: { filterType, freq },
        detail: `${FILTER_LABEL[filterType]} · ${formatHz(freq)}`,
      };
    }
    case 'compression': {
      const s = COMP_SETTINGS[value as CompAmount];
      const makeupDb = s.makeupDb * cfgAt(COMP_LEVELS, level).makeupScale;
      return {
        source: 'loop', compare: 'ab',
        params: { ratio: s.ratio, threshold: s.threshold, makeupDb },
        detail: value === 'none' ? '압축 없음' : `${COMP_LABEL[value as CompAmount]} · Ratio ${s.ratio}:1`,
      };
    }
    case 'reverb-amount': {
      const wet = REV_AMT_WET[value as RevAmount] * cfgAt(REVERB_AMT_LEVELS, level).wetScale;
      return {
        source: 'loop', compare: 'none',
        params: { wet, decay: 1.8 },
        detail: `${REV_AMT_LABEL[value as RevAmount]} · Wet ${Math.round(wet * 100)}%`,
      };
    }
    case 'reverb-type': {
      const s = REV_TYPE_SETTINGS[value as RevType];
      return {
        source: 'loop', compare: 'none',
        params: { decay: s.decay, preDelay: s.preDelay, wet: s.wet },
        detail: `${REV_TYPE_LABEL[value as RevType]} · ${s.decay}s`,
      };
    }
    case 'delay-time': {
      const note = value as DelayNote;
      const ms = DELAY_MS[note];
      return {
        source: 'loop', compare: 'none',
        params: { delayTime: ms / 1000, feedback: 0.35, wet: 0.5 },
        detail: `${DELAY_LABEL[note]} (${ms} ms)`,
      };
    }
    case 'pan': {
      const pan = PAN_VALUE[value];
      return { source: 'loop', compare: 'none', params: { pan }, detail: PAN_LABEL[value] };
    }
    case 'width': {
      const width = WIDTH_VALUE[value as Width];
      return {
        source: 'loop', compare: 'none',
        params: { width },
        detail: `${WIDTH_LABEL[value as Width]} · ${Math.round(width * 100)}%`,
      };
    }
    case 'level': {
      const c = cfgAt(LEVEL_LEVELS, level);
      if (c.task === 'which') {
        const mag = pick(c.dbs);
        // 'first' louder ⇒ the second (processed) clip is quieter ⇒ negative dB.
        const db = value === 'first' ? -mag : mag;
        return {
          source: 'loop', compare: 'ab',
          params: { db },
          detail: `${value === 'first' ? '첫 번째' : '두 번째'}가 ${mag} dB 큼`,
        };
      }
      const mag = Number(value);
      const db = Math.random() < 0.5 ? -mag : mag;
      return { source: 'loop', compare: 'ab', params: { db }, detail: `레벨 차이 ${mag} dB` };
    }
    case 'distortion': {
      const amount = DIST_VALUE[value as DistAmount];
      return { source: 'loop', compare: 'none', params: { amount }, detail: DIST_LABEL[value as DistAmount] };
    }
    case 'modulation':
      return { source: 'loop', compare: 'none', params: { modType: value }, detail: MOD_LABEL[value as ModType] };
  }
}

// Short per-level summary shown on the setup screen ("what changes at this
// level"). Derived from the level tables above so it never drifts out of sync.
export function getMixLevelLabel(effect: MixEffect, level: number): string {
  switch (effect) {
    case 'eq-freq': {
      const c = cfgAt(EQ_FREQ_LEVELS, level);
      return `${c.bands.length}대역 · ±${c.gain}dB${c.cut ? ' · 컷 포함' : ''}`;
    }
    case 'eq-boostcut': {
      const c = cfgAt(EQ_BOOSTCUT_LEVELS, level);
      return `${c.bands.length}대역 · ±${c.gain}dB`;
    }
    case 'filter': {
      const c = cfgAt(FILTER_LEVELS, level);
      return c.task === 'cutoff'
        ? `차단 주파수 맞히기 · ${c.cutoffs.length}택`
        : `필터 종류 맞히기 · ${c.types.length}종`;
    }
    case 'compression': {
      const c = cfgAt(COMP_LEVELS, level);
      return `${c.amounts.length}단계${c.makeupScale < 1 ? ` · 음량보정 ${Math.round(c.makeupScale * 100)}%` : ''}`;
    }
    case 'reverb-amount': {
      const c = cfgAt(REVERB_AMT_LEVELS, level);
      return `${c.amounts.length}단계${c.wetScale < 1 ? ` · 폭 ${Math.round(c.wetScale * 100)}%` : ''}`;
    }
    case 'reverb-type':
      return `${cfgAt(REVERB_TYPE_LEVELS, level).types.length}종 공간`;
    case 'delay-time':
      return `${cfgAt(DELAY_LEVELS, level).notes.length}택 음표`;
    case 'pan':
      return `${cfgAt(PAN_LEVELS, level).positions.length}개 위치`;
    case 'width':
      return `${cfgAt(WIDTH_LEVELS, level).widths.length}단계 폭`;
    case 'level': {
      const c = cfgAt(LEVEL_LEVELS, level);
      return c.task === 'which'
        ? `어느 쪽이 큰지 · ${c.dbs[0]}dB 차`
        : `dB 차이 맞히기 · ${c.dbs.length}택`;
    }
    case 'distortion':
      return `${cfgAt(DIST_LEVELS, level).amounts.length}단계`;
    case 'modulation':
      return `${cfgAt(MOD_LEVELS, level).types.length}종`;
  }
}

// Choice grid column count per mode (frequency/cutoff grids get 3 columns).
export function mixColumns(effect: MixEffect, level: number): 2 | 3 | 4 {
  return getMixChoices(effect, level).length > 4 ? 3 : 2;
}

// Human-readable label for an answer value (searches every level's choices,
// since a value's label is stable across the levels it appears in).
export function mixLabel(effect: MixEffect, value: string): string {
  for (let lv = 1; lv <= 10; lv++) {
    const found = getMixChoices(effect, lv).find((c) => c.value === value);
    if (found) return found.label;
  }
  return value;
}

// ─── Mode metadata (display order on Home, appended after lab modes) ─────────
export const MIX_MODE_INFOS = [
  {
    key: 'mix-eq-freq' as ModeKey, name: '주파수 대역 식별', emoji: '🎚️',
    description: '부스트된 주파수 대역을 맞혀보세요',
    howTo: '핑크 노이즈에 특정 주파수 대역이 강조(또는 감쇠)되어 들립니다. 어느 대역이 변했는지 아래 보기에서 고르세요. 레벨이 오를수록 변화 폭이 작아지고 대역 수가 늘어납니다.',
    theory: '이퀄라이저(EQ)는 특정 주파수 대역의 음량을 키우거나 줄여 음색을 다듬는 도구입니다. 저역(60~250Hz)은 무게감, 중역(250Hz~4kHz)은 본체와 명료도, 고역(4kHz 이상)은 공기감·찰랑임을 좌우합니다. 어떤 대역이 부스트/컷됐는지 듣는 귀는 믹싱·마스터링의 가장 기본 기술입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-eq-boostcut' as ModeKey, name: '부스트 vs 컷', emoji: '↕️',
    description: 'EQ가 부스트인지 컷인지 맞혀보세요',
    howTo: '원본 소리와 EQ를 건 소리가 차례로 들립니다. 해당 대역이 부스트(강조)됐는지 컷(감쇠)됐는지 고르세요.',
    theory: '같은 대역이라도 부스트와 컷은 음색을 반대 방향으로 움직입니다. 보통 "더하기"보다 "빼기" EQ가 자연스럽다고 하며, 문제 주파수를 컷하면 마스킹을 줄여 믹스가 또렷해집니다. 부스트와 컷을 즉시 구분하는 귀는 EQ 판단의 출발점입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-filter' as ModeKey, name: '필터 식별', emoji: '🔻',
    description: '필터의 차단 주파수와 종류를 맞혀보세요',
    howTo: '핑크 노이즈에 필터가 걸려 들립니다. 낮은 레벨에서는 차단 주파수를, 높은 레벨에서는 필터 종류(LPF/HPF/BPF)를 고르세요.',
    theory: '필터는 기준 주파수를 경계로 한쪽을 깎아냅니다. 하이패스(HPF)는 저역을, 로우패스(LPF)는 고역을 제거하고, 밴드패스(BPF)는 가운데만 남깁니다. HPF로 불필요한 저역 럼블을 정리하는 것은 거의 모든 트랙 정리의 첫 단계입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-compression' as ModeKey, name: '컴프레션 식별', emoji: '🗜️',
    description: '컴프레션의 양을 맞혀보세요',
    howTo: '압축하지 않은 소리와 압축한 소리가 차례로 들립니다. 두 번째 소리가 얼마나 압축됐는지 고르세요.',
    theory: '컴프레서는 큰 소리를 눌러 다이내믹 레인지(셈여림 차)를 줄이고, 메이크업 게인으로 전체를 끌어올립니다. 적당한 압축은 소리를 단단하고 일정하게, 과한 압축은 숨막히고 펌핑되는 느낌을 줍니다. 압축의 "양"을 듣는 귀는 보컬·드럼 처리의 핵심입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-reverb-amount' as ModeKey, name: '리버브 양', emoji: '🌫️',
    description: '리버브가 얼마나 걸렸는지 맞혀보세요',
    howTo: '짧은 연주 루프에 리버브가 걸려 들립니다. 리버브의 양(드라이~많이)을 고르세요.',
    theory: '리버브는 공간의 반사음을 더해 소리에 거리감과 입체감을 줍니다. 드라이(Wet 0%)는 코앞에서 들리고, 양이 많아질수록 멀고 넓은 공간에 있는 느낌을 줍니다. 리버브 양 조절은 트랙을 앞뒤로 배치하는 깊이감 연출의 기본입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-reverb-type' as ModeKey, name: '리버브 종류', emoji: '🏛️',
    description: '리버브의 공간 종류를 맞혀보세요',
    howTo: '리버브가 걸린 루프가 들립니다. 어떤 종류의 공간(룸·홀·플레이트)인지 고르세요.',
    theory: '리버브 종류는 잔향의 길이·밀도·색깔이 다릅니다. 룸은 짧고 친밀하며, 홀은 길고 풍성하고, 플레이트는 금속판을 울린 매끈하고 밝은 잔향으로 보컬에 자주 쓰입니다. 종류를 구분하면 곡 분위기에 맞는 공간을 고를 수 있습니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-delay-time' as ModeKey, name: '딜레이 타임', emoji: '⏱️',
    description: '딜레이(에코)의 시간을 맞혀보세요',
    howTo: '딜레이가 걸린 루프가 들립니다. 반복음이 얼마나 빠른 간격으로 돌아오는지(음표 길이) 고르세요.',
    theory: '딜레이는 소리를 일정 시간 뒤에 되풀이하는 에코 이펙트입니다. 박자에 맞춘 딜레이(예: 1/8, 점8분)는 리듬에 녹아들고, 1/4처럼 긴 딜레이는 또렷한 메아리로 들립니다. 딜레이 타임을 박자로 듣는 귀는 템포 동기 이펙트 활용의 기본입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-pan' as ModeKey, name: '팬 위치', emoji: '🔀',
    description: '소리가 어느 쪽에 있는지 맞혀보세요',
    howTo: '소리가 좌우 스테레오의 한 위치에서 들립니다. 어느 쪽에 자리 잡았는지 고르세요. (이어폰 권장)',
    theory: '패닝은 소리를 좌우 스테레오 공간에 배치하는 것입니다. 악기를 좌우로 펼치면 서로 겹치지 않고 넓고 명료한 믹스가 됩니다. 위치를 정확히 듣는 귀는 스테레오 밸런스를 잡는 데 필수입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-width' as ModeKey, name: '스테레오 폭', emoji: '↔️',
    description: '소리의 좌우 폭을 맞혀보세요',
    howTo: '소리가 좁게(모노에 가깝게) 또는 넓게 들립니다. 스테레오 폭을 고르세요. (이어폰 권장)',
    theory: '스테레오 폭은 소리가 좌우로 얼마나 펼쳐지는가입니다. 모노는 가운데 한 점, 넓을수록 좌우로 크게 퍼집니다. 다만 과한 확장은 모노 호환성(클럽·스피커 합산)에서 소리가 사라지는 위상 문제를 일으킬 수 있어 균형이 중요합니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-level' as ModeKey, name: '레벨 차이', emoji: '📏',
    description: '두 소리의 음량 차이를 맞혀보세요',
    howTo: '두 소리가 차례로 들립니다. 낮은 레벨에서는 어느 쪽이 더 큰지, 높은 레벨에서는 몇 dB 차이인지 고르세요.',
    theory: '레벨(게인) 균형은 믹싱의 90%라 할 만큼 중요합니다. 사람의 귀는 약 1dB 차이부터 구분하기 시작하며, 3dB는 뚜렷이, 6dB는 약 2배 크게 느껴집니다. 작은 레벨 차를 듣는 귀는 페이더 밸런스와 게인 스테이징의 기본기입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-distortion' as ModeKey, name: '디스토션/새츄레이션', emoji: '🔥',
    description: '왜곡(새츄레이션)의 양을 맞혀보세요',
    howTo: '루프에 디스토션/새츄레이션이 걸려 들립니다. 왜곡의 양(클린~강하게)을 고르세요.',
    theory: '새츄레이션은 신호를 살짝 찌그러뜨려 배음(하모닉스)을 더하는 처리로, 소리를 따뜻하고 두껍고 존재감 있게 만듭니다. 약하면 아날로그 같은 윤기를, 강하면 거친 디스토션 질감을 줍니다. 왜곡의 양을 듣는 귀는 톤 메이킹의 무기입니다.',
    maxLevel: 10, defaultLevel: 1,
  },
  {
    key: 'mix-modulation' as ModeKey, name: '모듈레이션 식별', emoji: '🌀',
    description: '모듈레이션 이펙트 종류를 맞혀보세요',
    howTo: '루프에 모듈레이션 이펙트가 걸려 들립니다. 어떤 종류(코러스·페이저·트레몰로)인지 고르세요.',
    theory: '모듈레이션은 시간에 따라 소리를 흔드는 이펙트입니다. 코러스는 여러 겹으로 두껍고 풍성하게, 페이저는 휙 지나가는 빗질 같은 색깔 변화를, 트레몰로는 음량을 규칙적으로 떨리게 합니다. 종류를 구분하면 원하는 움직임을 골라 쓸 수 있습니다.',
    maxLevel: 10, defaultLevel: 1,
  },
];
