/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1E3A8A', hover: '#1e40af' },
        secondary: { DEFAULT: '#2563EB', hover: '#1d4ed8' },
        accent: { DEFAULT: '#F59E0B', hover: '#d97706' },
        dark: { DEFAULT: '#0F172A', card: '#1E293B', input: '#1E293B' },
        background: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
