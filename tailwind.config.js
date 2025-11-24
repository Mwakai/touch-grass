/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    // Avatar gradient classes - needed for dynamic class binding
    'from-pink-500', 'via-rose-400', 'to-orange-400',
    'from-emerald-500', 'via-lime-400', 'to-teal-400',
    'from-cyan-500', 'via-sky-400', 'to-blue-500',
    'from-amber-500', 'via-orange-400', 'to-rose-400',
    'from-indigo-500', 'via-purple-500', 'to-pink-500',
    'from-fuchsia-500', 'to-sky-500',
    'from-blue-400', 'to-purple-500',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
