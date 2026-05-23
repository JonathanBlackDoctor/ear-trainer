// shared.jsx — small helpers used across all 5 directions

// Wraps an AndroidDevice with `title` set to undefined (no Material app bar
// — each direction draws its own header) and forces Pretendard.
function Phone({ children, dark = false, screenBg = '#fff' }) {
  return (
    <AndroidDevice width={412} height={892} dark={dark}>
      <div className="pf" style={{
        width: '100%', minHeight: '100%', boxSizing: 'border-box',
        background: screenBg, color: 'inherit',
      }}>
        {children}
      </div>
    </AndroidDevice>
  );
}

// Tiny inline sparkline used in Stats screens
function MiniSpark({ points, w = 280, h = 70, stroke = '#000', fill, strokeWidth = 2 }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const dx = w / Math.max(1, points.length - 1);
  const d = points.map((v, i) => {
    const x = i * dx;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {fill && <path d={area} fill={fill} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// 13 modes from the spec — accent color per mode, used by direction designs.
const MODES = [
  { id: 'solfege',     emoji: '🎼', name: '계명',       sub: '도·레·미·…',         accent: '#f59e0b' },
  { id: 'interval',    emoji: '🎵', name: '음정',       sub: '두 음 사이',           accent: '#6366f1' },
  { id: 'chord',       emoji: '🎹', name: '코드',       sub: '장·단·감·증',          accent: '#8b5cf6' },
  { id: 'progression', emoji: '🎸', name: '코드 진행',  sub: '도수 받아적기',        accent: '#ec4899' },
  { id: 'melody',      emoji: '🎶', name: '멜로디',     sub: '건반 받아적기',        accent: '#14b8a6' },
  { id: 'transpose',   emoji: '🔄', name: '조옮김',     sub: '도수로 인식',          accent: '#f97316' },
  { id: 'rhythm',      emoji: '🥁', name: '리듬',       sub: '탭으로 따라치기',      accent: '#06b6d4' },
  { id: 'tempo',       emoji: '⏱️', name: '템포',       sub: '같은 빠르기 유지',    accent: '#10b981' },
  { id: 'bpm',         emoji: '🎯', name: 'BPM',        sub: '메트로놈 추정',        accent: '#f43f5e' },
];

// 13 음정 choice labels
const INTERVAL_CHOICES = [
  ['단2도', 'm2'], ['장2도', 'M2'],
  ['단3도', 'm3'], ['장3도', 'M3'],
  ['완전4도', 'P4'], ['완전5도', 'P5'],
  ['단6도', 'm6'], ['장6도', 'M6'],
];

Object.assign(window, { Phone, MiniSpark, MODES, INTERVAL_CHOICES });
