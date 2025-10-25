/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // CSS prefix for isolation when embedded
  prefix: 'lmw-',
  // Enable class-based dark mode
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
      },
    },
  },
  plugins: [],
  // Prevent Tailwind from resetting styles globally
  corePlugins: {
    preflight: false,
  },
}
