import type { ModeKey, MixEffect } from '../types';
import { intervalLabel } from '../theory/intervals';
import { chordLabel } from '../theory/chords';
import {
  SCALE_LABEL, CADENCE_LABEL, INVERSION_LABEL, CONTOUR_LABEL,
  TUNING_IN_TUNE, TUNING_SHARP, TUNING_FLAT,
  FUNCTION_TONIC, FUNCTION_SUBDOMINANT, FUNCTION_DOMINANT,
  TENSION_LABEL, COMPARE_FIRST, COMPARE_SECOND, COMPARE_SAME,
  WIDE_INTERVAL_NAMES, centsLabel, harmonicAnswer,
} from './labModes';
import { mixLabel } from './mixModes';

const DIR_LABEL: Record<string, string> = { up: '상행', down: '하행', harmonic: '화성' };

/**
 * Human-readable label for a stats/SRS itemKey, for the result & stats screens.
 * Mirrors the exact key formats the question factories stamp, reusing each
 * mode's existing label tables/functions. Falls back to the raw key on miss so
 * a stale key never crashes the UI.
 */
export function formatItemKey(mode: ModeKey, key: string): string {
  switch (mode) {
    case 'interval': {
      const [name, dir] = key.split('_');
      return `${intervalLabel(name)}${dir ? ` (${DIR_LABEL[dir] ?? dir})` : ''}`;
    }
    case 'chord': {
      const [q, invStr] = key.split('_inv');
      const inv = parseInt(invStr, 10) || 0;
      return `${chordLabel(q)}${inv > 0 ? ` · ${inv}전위` : ''}`;
    }
    case 'solfege':
      return key.replace(/^solfege_/, '');
    case 'progression': {
      const m = key.match(/^prog_(.+?)__lv(\d+)$/);
      return m ? `${m[1].replace(/-/g, '–')} 진행 (Lv${m[2]})` : key;
    }
    case 'melody':
    case 'transpose':
    case 'rhythm':
    case 'tempo':
    case 'bpm': {
      const m = key.match(/_lv(\d+)$/);
      return m ? `Lv${m[1]}` : key;
    }
    case 'lab-scale':
      return SCALE_LABEL[key.replace(/^scale_/, '').replace(/-/g, ' ')] ?? key;
    case 'lab-cadence':
      return CADENCE_LABEL[key.replace(/^cadence_/, '')] ?? key;
    case 'lab-inversion':
      return INVERSION_LABEL[Number(key.replace(/^inv_/, ''))] ?? key;
    case 'lab-interval-compare': {
      const c = key.replace(/^cmp_/, '');
      return c === 'first' ? COMPARE_FIRST : c === 'second' ? COMPARE_SECOND : COMPARE_SAME;
    }
    case 'lab-odd-note':
      return `${(Number(key.replace(/^odd_/, '')) || 0) + 1}번`;
    case 'lab-contour':
      return CONTOUR_LABEL[key.replace(/^contour_/, '')] ?? key;
    case 'lab-tuning': {
      const c = key.replace(/^tune_/, '');
      return c === 'sharp' ? TUNING_SHARP : c === 'flat' ? TUNING_FLAT : TUNING_IN_TUNE;
    }
    case 'lab-function': {
      const c = key.replace(/^func_/, '');
      return c === 'T' ? FUNCTION_TONIC : c === 'S' ? FUNCTION_SUBDOMINANT : FUNCTION_DOMINANT;
    }
    case 'lab-extended':
      return chordLabel(key.replace(/^ext_/, ''));
    case 'lab-bass':
      return `${key.replace(/^bass_deg/, '')}도`;
    case 'lab-tension':
      return TENSION_LABEL[key.replace(/^tension_/, '')] ?? key;
    case 'lab-wide-interval': {
      const [name] = key.replace(/^wide_/, '').split('_');
      return WIDE_INTERVAL_NAMES.find((i) => i.name === name)?.label ?? name;
    }
    case 'lab-note-stack':
      return `${key.replace(/^stack_n/, '')}음 동시`;
    case 'lab-microtuning':
      return centsLabel(Number(key.replace(/^microtune_/, '')) || 0);
    case 'lab-harmonics':
      return harmonicAnswer(Number(key.replace(/^harmonic_/, '')) || 2);
    default:
      if (mode.startsWith('mix-')) {
        const effect = mode.replace(/^mix-/, '') as MixEffect;
        return mixLabel(effect, key.slice(effect.length + 1));
      }
      return key;
  }
}
