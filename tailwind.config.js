/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bomb: {
          bg: '#0f0f1a',
          card: '#1a1a2e',
          surface: '#1e1e30',
          border: '#2d2d44',
          orange: '#ff6b35',
          green: '#00e676',
          red: '#ff1744',
        },
      },
    },
  },
  plugins: [],
};
