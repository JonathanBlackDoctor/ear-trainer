// Per-direction color palettes. Values mirror the `G/I/J/M` token objects at the
// top of design_handoff_eum-gam_v2/source/direction-{g,i,j,m}.jsx (the canonical
// source). Kept separate from the component files so React Fast Refresh works.

export const G = {
  bg: '#fffef0',
  card: '#ffffff',
  ink: '#0a0a0a',
  inkSoft: '#3a3a3a',
  inkMute: '#7a7a7a',
  pink: '#ff5a8c',
  mustard: '#f5d142',
  mint: '#5af2c2',
  lavender: '#a497ff',
  sky: '#7fc6ff',
  orange: '#fb923c',
  green: '#7ce26c',
  red: '#ff5b4a',
  shadow: '6px 6px 0 #0a0a0a',
  shadowS: '4px 4px 0 #0a0a0a',
  shadowL: '8px 8px 0 #0a0a0a',
  border: '3px solid #0a0a0a',
} as const;

export const I = {
  bg: '#fbfcfd',
  card: '#ffffff',
  inset: '#f5f7fa',
  ink: '#0f1419',
  inkSoft: '#4a5563',
  inkMute: '#9aa3b0',
  hair: '#e2e7ed',
  hairDark: '#c8d0d9',
  grid: '#eef1f5',
  lime: '#65a30d',
  limeBright: '#84cc16',
  limeSoft: '#ecfccb',
  cyan: '#0e7490',
  cyanBright: '#06b6d4',
  signal: '#ef4444',
  amber: '#ea580c',
} as const;

export const J = {
  bg: '#f5ecdc',
  card: '#ffffff',
  chrome: 'linear-gradient(180deg, #f5f5f7 0%, #d5d8de 50%, #f5f5f7 100%)',
  ink: '#1a0d1f',
  inkSoft: '#5a4860',
  inkMute: '#a899ad',
  hair: '#ddd0c1',
  pink: '#ff3da8',
  pinkDeep: '#c91d80',
  teal: '#00c4b4',
  tealDeep: '#0a8a7d',
  yellow: '#ffd83d',
  silver: '#c0c4cc',
} as const;

export const M = {
  bg: 'linear-gradient(135deg, #ede2ff 0%, #d9eaff 22%, #d2f5e9 44%, #fff0d9 66%, #ffd9ec 88%, #e6d9ff 100%)',
  pearl: '#fdfcff',
  ink: '#1a1f3a',
  inkSoft: '#4b5070',
  inkMute: '#9a9ec0',
  hair: 'rgba(26,31,58,0.1)',
  hairSoft: 'rgba(26,31,58,0.05)',
  cyan: '#06b6d4',
  violet: '#a855f7',
  pink: '#ec4899',
  amber: '#f59e0b',
  mint: '#10b981',
  iridescent: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
  iridescentSoft: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(236,72,153,0.15) 100%)',
} as const;

// Per-mode 2-stop gradient chips (cycled across the mode grid) for direction M.
export const M_MODE_GRADIENTS = [
  'linear-gradient(135deg, #06b6d4, #a855f7)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
  'linear-gradient(135deg, #ec4899, #f59e0b)',
  'linear-gradient(135deg, #f59e0b, #10b981)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #a855f7, #06b6d4)',
] as const;
