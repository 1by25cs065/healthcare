/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#172b4d',
        muted: '#718096',
        canvas: '#f5f7fb',
        brand: {
          50: '#effaf7',
          100: '#d8f3eb',
          500: '#29a889',
          600: '#188c72',
          700: '#14725f',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(27, 48, 77, 0.06)',
      },
    },
  },
  plugins: [],
}
