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
          DEFAULT: '#003A70', // Azul marino profundo
          light: '#005BAC',
          pale: '#D6E6F5',
          dark: '#080B5E',
        },
        secondary: {
          DEFAULT: '#007A4D', // Verde institucional
          light: '#00A86B',
          pale: '#D4F0E3',
        },
        accent: '#F5C400', // Amarillo dorado
        dark: '#1A1A2E',
        gray: {
          DEFAULT: '#64748B',
          light: '#F1F5F9',
        }
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 58, 112, 0.10)',
        hero: '0 8px 40px rgba(0, 58, 112, 0.18)',
        floating: '0 10px 30px rgba(0, 0, 0, 0.2)',
        dropdown: '0 6px 20px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        card: '16px',
        btn: '8px',
        fab: '50%',
        chip: '16px',
      },
      zIndex: {
        dropdown: '1000',
        modal: '9999',
        chatbot: '9998',
        speedDial: '9997',
        navbar: '100',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out',
      },
    },
  },
  plugins: [],
}
