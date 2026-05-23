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
        // Driven by CSS vars so each theme can swap the family (default = Noto,
        // the four designer directions = Pretendard). See src/index.css.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // 헤드라인 / 큰 숫자 / 정답률 표시용 (클래식한 무게감)
        display: ['var(--font-display)', 'system-ui', 'serif'],
      },
      fontSize: {
        // 디스플레이용 큰 숫자: 정답률, 결과 점수 등
        'display-sm': ['2.5rem',  { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display':    ['3.5rem',  { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['4.75rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      colors: {
        // All palettes are driven by CSS custom properties (space-separated RGB
        // triples) defined per-theme in src/index.css. The `<alpha-value>`
        // placeholder lets Tailwind's opacity modifiers (e.g. bg-primary-500/20)
        // keep working. Switching `<html data-theme>` re-skins every utility.
        primary: {
          50:  'rgb(var(--c-primary-50) / <alpha-value>)',
          100: 'rgb(var(--c-primary-100) / <alpha-value>)',
          200: 'rgb(var(--c-primary-200) / <alpha-value>)',
          300: 'rgb(var(--c-primary-300) / <alpha-value>)',
          400: 'rgb(var(--c-primary-400) / <alpha-value>)',
          500: 'rgb(var(--c-primary-500) / <alpha-value>)',
          600: 'rgb(var(--c-primary-600) / <alpha-value>)',
          700: 'rgb(var(--c-primary-700) / <alpha-value>)',
          800: 'rgb(var(--c-primary-800) / <alpha-value>)',
          900: 'rgb(var(--c-primary-900) / <alpha-value>)',
          950: 'rgb(var(--c-primary-950) / <alpha-value>)',
        },
        accent: {
          50:  'rgb(var(--c-accent-50) / <alpha-value>)',
          100: 'rgb(var(--c-accent-100) / <alpha-value>)',
          200: 'rgb(var(--c-accent-200) / <alpha-value>)',
          300: 'rgb(var(--c-accent-300) / <alpha-value>)',
          400: 'rgb(var(--c-accent-400) / <alpha-value>)',
          500: 'rgb(var(--c-accent-500) / <alpha-value>)',
          600: 'rgb(var(--c-accent-600) / <alpha-value>)',
          700: 'rgb(var(--c-accent-700) / <alpha-value>)',
          800: 'rgb(var(--c-accent-800) / <alpha-value>)',
          900: 'rgb(var(--c-accent-900) / <alpha-value>)',
        },
        canvas: {
          50:  'rgb(var(--c-canvas-50) / <alpha-value>)',
          100: 'rgb(var(--c-canvas-100) / <alpha-value>)',
          200: 'rgb(var(--c-canvas-200) / <alpha-value>)',
        },
        success: {
          50:  'rgb(var(--c-success-50) / <alpha-value>)',
          100: 'rgb(var(--c-success-100) / <alpha-value>)',
          200: 'rgb(var(--c-success-200) / <alpha-value>)',
          400: 'rgb(var(--c-success-400) / <alpha-value>)',
          500: 'rgb(var(--c-success-500) / <alpha-value>)',
          600: 'rgb(var(--c-success-600) / <alpha-value>)',
          700: 'rgb(var(--c-success-700) / <alpha-value>)',
          800: 'rgb(var(--c-success-800) / <alpha-value>)',
        },
        danger: {
          50:  'rgb(var(--c-danger-50) / <alpha-value>)',
          100: 'rgb(var(--c-danger-100) / <alpha-value>)',
          200: 'rgb(var(--c-danger-200) / <alpha-value>)',
          400: 'rgb(var(--c-danger-400) / <alpha-value>)',
          500: 'rgb(var(--c-danger-500) / <alpha-value>)',
          600: 'rgb(var(--c-danger-600) / <alpha-value>)',
          700: 'rgb(var(--c-danger-700) / <alpha-value>)',
        },
        // Neutral grey ramp — themed so secondary text, dividers, and muted
        // surfaces shift with the active design (warm for G/J, cool for I/M).
        slate: {
          50:  'rgb(var(--c-slate-50) / <alpha-value>)',
          100: 'rgb(var(--c-slate-100) / <alpha-value>)',
          200: 'rgb(var(--c-slate-200) / <alpha-value>)',
          300: 'rgb(var(--c-slate-300) / <alpha-value>)',
          400: 'rgb(var(--c-slate-400) / <alpha-value>)',
          500: 'rgb(var(--c-slate-500) / <alpha-value>)',
          600: 'rgb(var(--c-slate-600) / <alpha-value>)',
          700: 'rgb(var(--c-slate-700) / <alpha-value>)',
          800: 'rgb(var(--c-slate-800) / <alpha-value>)',
          900: 'rgb(var(--c-slate-900) / <alpha-value>)',
        },
        // "correct" semantics → success token; "wrong" semantics → danger token.
        // Lets the many emerald-*/red-* feedback usages re-skin per theme.
        emerald: {
          50:  'rgb(var(--c-success-50) / <alpha-value>)',
          100: 'rgb(var(--c-success-100) / <alpha-value>)',
          200: 'rgb(var(--c-success-200) / <alpha-value>)',
          400: 'rgb(var(--c-success-400) / <alpha-value>)',
          500: 'rgb(var(--c-success-500) / <alpha-value>)',
          600: 'rgb(var(--c-success-600) / <alpha-value>)',
          700: 'rgb(var(--c-success-700) / <alpha-value>)',
          800: 'rgb(var(--c-success-800) / <alpha-value>)',
        },
        red: {
          50:  'rgb(var(--c-danger-50) / <alpha-value>)',
          100: 'rgb(var(--c-danger-100) / <alpha-value>)',
          200: 'rgb(var(--c-danger-200) / <alpha-value>)',
          400: 'rgb(var(--c-danger-400) / <alpha-value>)',
          500: 'rgb(var(--c-danger-500) / <alpha-value>)',
          600: 'rgb(var(--c-danger-600) / <alpha-value>)',
          700: 'rgb(var(--c-danger-700) / <alpha-value>)',
        },
      },
      borderRadius: {
        // Themed radius scale. `full`/`md`/`sm` keep Tailwind defaults so true
        // circles (spinners, knobs) stay round in every theme.
        lg:    'var(--radius-lg)',
        xl:    'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        // Themed shadows — soft/blurred for default & M, hard offsets for G & J,
        // none for I. Defined per-theme in src/index.css.
        'soft':    'var(--shadow-soft)',
        'card':    'var(--shadow-card)',
        'lifted':  'var(--shadow-lifted)',
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-accent':  'var(--shadow-glow-accent)',
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
