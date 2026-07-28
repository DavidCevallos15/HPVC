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
          DEFAULT: '#2E7D6F',
          light: '#449789',
          pale: '#E4F2EE',
          dark: '#225E55',
        },
        secondary: {
          DEFAULT: '#C96F48',
          light: '#DD8A64',
          pale: '#F9E9DF',
        },
        accent: '#E9B949',
        dark: '#243B36',
        gray: {
          DEFAULT: '#66756F',
          light: '#F3F6F3',
        },
        error: '#C94D4D',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body:    ['Source Sans 3', 'sans-serif'],
      },
      borderRadius: {
        btn:  '8px',
        card: '16px',
      },
      boxShadow: {
        card:     '0 10px 32px rgba(46, 80, 70, 0.09)',
        floating: '0 18px 44px rgba(46, 80, 70, 0.16)',
      },
    },
  },
  plugins: [],
}
