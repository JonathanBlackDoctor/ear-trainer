// Tailwind config snippet — Direction M (오로라 / 홀로그래픽)

module.exports = {
  theme: {
    extend: {
      colors: {
        m: {
          ink:        '#1a1f3a',
          'ink-soft': '#4b5070',
          'ink-mute': '#9a9ec0',
          pearl:      '#fdfcff',
          cyan:       '#06b6d4',
          violet:     '#a855f7',
          pink:       '#ec4899',
          amber:      '#f59e0b',
          mint:       '#10b981',
          glass:      'rgba(255,255,255,0.7)',
          'glass-deep': 'rgba(255,255,255,0.92)',
        },
      },
      backgroundImage: {
        'm-aurora':
          'linear-gradient(135deg, #ede2ff 0%, #d9eaff 22%, #d2f5e9 44%, #fff0d9 66%, #ffd9ec 88%, #e6d9ff 100%)',
        'm-iridescent':
          'linear-gradient(135deg, #06b6d4 0%, #a855f7 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)',
        'm-iridescent-soft':
          'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(236,72,153,0.15) 100%)',
      },
      boxShadow: {
        'm-sm':  '0 4px 12px rgba(26,31,58,0.06)',
        'm-md':  '0 8px 24px rgba(26,31,58,0.06), 0 1px 3px rgba(26,31,58,0.04)',
        'm-lg':  '0 14px 30px rgba(168,85,247,0.5)',
        'm-cta': '0 16px 32px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
      },
      borderRadius: {
        'm-card': '22px',
        'm-ctrl': '14px',
      },
      backdropBlur: {
        m: '20px',
      },
      fontFamily: { sans: ['Pretendard', 'system-ui', 'sans-serif'] },
    },
  },
};

// Sample usage — glass card:
//   <div className="bg-m-glass backdrop-blur-m border border-white/90 rounded-m-card shadow-m-md p-4">
//     ...
//   </div>
//
// Sample usage — iridescent CTA:
//   <button className="bg-m-iridescent text-white rounded-m-card shadow-m-cta font-extrabold px-6 py-4">
//     🎵 시작하기
//   </button>
//
// Sample usage — gradient text on display number:
//   <span className="bg-m-iridescent bg-clip-text text-transparent font-black text-7xl tracking-tighter">
//     92<span className="text-3xl">%</span>
//   </span>
