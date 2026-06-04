/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal:    { DEFAULT:'#10b981', dim:'#0f8f69', light:'rgba(16,185,129,0.12)' },
        emerald: { DEFAULT:'#34d399', dim:'#158f68' },
        cyan:    { DEFAULT:'#86efac' },
        deep:    { DEFAULT:'#111315', mid:'#171b1f', card:'#1f252b' },
        muted:   '#9aa6ad',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal':    '0 0 24px rgba(16,185,129,0.28)',
        'glow-emerald': '0 0 24px rgba(52,211,153,0.28)',
        'glow-cyan':    '0 0 20px rgba(134,239,172,0.25)',
        'glow-red':     '0 0 20px rgba(255,77,109,0.4)',
      },
      borderColor: {
        DEFAULT: 'rgba(16,185,129,0.18)',
      },
    },
  },
  plugins: [],
};
