/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': {
          900: '#0A0E27',
          800: '#1A1F3A',
        },
        'bio-cyan': '#00D9FF',
        'bio-violet': '#8B5CF6',
        'bio-green': '#00FF88',
      },
    },
  },
  plugins: [],
};
