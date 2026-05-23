// Tailwind config snippet — Direction I (모눈 / 데이터)

module.exports = {
  theme: {
    extend: {
      colors: {
        i: {
          bg:           '#fbfcfd',
          card:         '#ffffff',
          inset:        '#f5f7fa',
          ink:          '#0f1419',
          'ink-soft':   '#4a5563',
          'ink-mute':   '#9aa3b0',
          hair:         '#e2e7ed',
          'hair-dark':  '#c8d0d9',
          grid:         '#eef1f5',
          lime:         '#65a30d',
          'lime-bright':'#84cc16',
          'lime-soft':  '#ecfccb',
          cyan:         '#0e7490',
          'cyan-bright':'#06b6d4',
          amber:        '#ea580c',
          signal:       '#ef4444',
        },
      },
      backgroundImage: {
        'i-graph':
          // 12px micro grid + 60px major grid + base bg
          'linear-gradient(#eef1f5 1px, transparent 1px), ' +
          'linear-gradient(90deg, #eef1f5 1px, transparent 1px), ' +
          'linear-gradient(#e2e7ed 1px, transparent 1px), ' +
          'linear-gradient(90deg, #e2e7ed 1px, transparent 1px)',
      },
      backgroundSize: {
        'i-graph': '12px 12px, 12px 12px, 60px 60px, 60px 60px',
      },
      borderRadius: { i: '0px' },
      borderWidth: { 'i-cta': '1.5px' },
      fontFamily: { sans: ['Pretendard', 'system-ui', 'sans-serif'] },
    },
  },
};

// Sample usage:
//   <div className="bg-i-graph bg-[length:12px_12px,12px_12px,60px_60px,60px_60px]
//                   bg-i-bg min-h-screen">
//     <button className="bg-i-ink text-i-lime border-i-cta border-i-ink
//                         font-extrabold tracking-widest uppercase px-6 py-4">
//       ▶ START · SESSION 042
//     </button>
//   </div>
