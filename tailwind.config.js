/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-pattern': "url('/src/assets/grid-bg.jpg')",
      },
      keyframes: {
        appear: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        appear: 'appear 1s ease-in-out',
      },
    },
  },
  plugins: [],
}

// https://www.youtube.com/watch?v=3Y3lM_q5X-s
