// Tailwind config snippet — Direction J (카세트 테이프)

module.exports = {
  theme: {
    extend: {
      colors: {
        j: {
          bg:           '#f5ecdc',
          card:         '#ffffff',
          ink:          '#1a0d1f',
          'ink-soft':   '#5a4860',
          'ink-mute':   '#a899ad',
          pink:         '#ff3da8',
          'pink-deep':  '#c91d80',
          teal:         '#00c4b4',
          'teal-deep':  '#0a8a7d',
          yellow:       '#ffd83d',
          silver:       '#c0c4cc',
          hair:         '#ddd0c1',
        },
      },
      backgroundImage: {
        'j-chrome': 'linear-gradient(180deg, #f5f5f7 0%, #d5d8de 50%, #f5f5f7 100%)',
        'j-caution': 'repeating-linear-gradient(45deg, #ff3da8 0 14px, #ffd83d 14px 28px)',
        'j-caution-alt': 'repeating-linear-gradient(45deg, #00c4b4 0 14px, #ff3da8 14px 28px)',
      },
      boxShadow: {
        'j-xs': '2px 2px 0 #1a0d1f',
        'j-sm': '3px 3px 0 #1a0d1f',
        'j-md': '4px 4px 0 #1a0d1f',
        'j-lg': '5px 5px 0 #1a0d1f',
      },
      borderRadius: {
        j: '0px',
        'j-sticker': '4px',
      },
      animation: {
        'j-spin': 'j-spin 4s linear infinite',
      },
      keyframes: {
        'j-spin': { to: { transform: 'rotate(360deg)' } },
      },
      fontFamily: { sans: ['Pretendard', 'system-ui', 'sans-serif'] },
    },
  },
};

// Sample usage:
//   <div className="bg-j-caution h-3 border-t-2 border-b-2 border-j-ink"/>
//   <button className="bg-j-pink text-white border-[2.5px] border-j-ink shadow-j-lg
//                       font-black px-6 py-5">
//     ▶ PLAY / 시작하기
//   </button>
