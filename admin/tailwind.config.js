/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003A70',
          light: '#005BAC',
          pale: '#D6E6F5',
          dark: '#080B5E',
        },
        secondary: {
          DEFAULT: '#007A4D',
          light: '#00A86B',
          pale: '#D4F0E3',
        },
        accent: '#F5C400',
        dark: '#1A1A2E',
        gray: {
          DEFAULT: '#64748B',
          light: '#F1F5F9',
        },
        error: '#E30613',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        btn:  '8px',
        card: '16px',
      },
      boxShadow: {
        card:     '0 4px 24px rgba(0, 58, 112, 0.10)',
        floating: '0 10px 30px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
