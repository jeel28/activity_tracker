/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edfcf5',
          100: '#d3f8e8',
          200: '#aaf0d4',
          300: '#72e2b9',
          400: '#38cc99',
          500: '#16b07e',
          600: '#0d9067',
          700: '#0d7356',
          800: '#0e5b45',
          900: '#0d4a39',
        }
      }
    },
  },
  plugins: [],
}
