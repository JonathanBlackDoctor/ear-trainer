/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Class-based dark mode hook is wired but no dark variants are styled yet —
  // toggling `<html class="dark">` is a future PR.
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'system-ui', 'sans-serif'],
        // 헤드라인 / 큰 숫자 / 정답률 표시용 (클래식한 무게감)
        display: ['Noto Serif KR', 'Noto Sans KR', 'serif'],
      },
      fontSize: {
        // 디스플레이용 큰 숫자: 정답률, 결과 점수 등
        'display-sm': ['2.5rem',  { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display':    ['3.5rem',  { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['4.75rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      colors: {
        // 딥 인디고 (피아노 건반의 검은 건반, 잉크, 경건함)
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // 골드 (악기 황동, 성가대 빛, 음악적 따뜻함)
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // 따뜻한 크림 배경 (순백색보다 부드러움 — 종이/상아 느낌)
        canvas: {
          50:  '#fdfcf8',
          100: '#faf8f1',
          200: '#f3efe2',
        },
        // 정답 — 차분한 sage green (요란하지 않게)
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // 오답 — 따뜻한 rose (공격적이지 않게)
        danger: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
      },
      boxShadow: {
        // 더 부드럽고 따뜻한 그림자 (인디고 톤이 살짝 섞임)
        'soft':    '0 1px 2px 0 rgb(49 46 129 / 0.04), 0 1px 3px 0 rgb(49 46 129 / 0.06)',
        'card':    '0 2px 4px -1px rgb(49 46 129 / 0.06), 0 4px 12px -2px rgb(49 46 129 / 0.08)',
        'lifted':  '0 10px 25px -5px rgb(49 46 129 / 0.12), 0 6px 12px -4px rgb(49 46 129 / 0.08)',
        'glow-primary': '0 0 0 4px rgb(99 102 241 / 0.15)',
        'glow-accent':  '0 0 0 4px rgb(245 158 11 / 0.2)',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pop':       'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shake':     'shake 0.4s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
}
