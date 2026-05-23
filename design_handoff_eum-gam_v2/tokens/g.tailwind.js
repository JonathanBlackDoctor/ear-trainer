// Tailwind config snippet — Direction G (네오 브루탈리즘)
// Merge into your tailwind.config.js's `theme.extend` section.

module.exports = {
  theme: {
    extend: {
      colors: {
        g: {
          bg:        '#fffef0',
          card:      '#ffffff',
          ink:       '#0a0a0a',
          'ink-soft': '#3a3a3a',
          'ink-mute': '#7a7a7a',
          pink:      '#ff5a8c',
          mustard:   '#f5d142',
          mint:      '#5af2c2',
          lavender:  '#a497ff',
          sky:       '#7fc6ff',
          orange:    '#fb923c',
          green:     '#7ce26c',
          red:       '#ff5b4a',
        },
      },
      boxShadow: {
        'g-xs':  '2px 2px 0 #0a0a0a',
        'g-sm':  '3px 3px 0 #0a0a0a',
        'g-md':  '4px 4px 0 #0a0a0a',
        'g-lg':  '6px 6px 0 #0a0a0a',
        'g-xl':  '8px 8px 0 #0a0a0a',
        'g-cta': '6px 6px 0 #ff5a8c',
      },
      borderWidth: {
        g: '2.5px',
      },
      borderRadius: {
        g: '0px', // G is square
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
};

// Sample usage:
//   <button className="bg-g-pink text-white border-g border-g-ink shadow-g-lg
//                       font-black tracking-tighter active:translate-x-[2px] active:translate-y-[2px]
//                       active:shadow-g-xs px-6 py-4">
//     🎵 시작하기
//   </button>
