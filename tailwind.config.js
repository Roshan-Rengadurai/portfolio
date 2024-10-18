/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        "custom-blue": "#3490DC",
        "custom-green": "#2ECC71",
        "custom-orange": "#E67E22",
        "custom-purple": "#9B59B6",
        "custom-pink": "#E74C3C",
        "custom-yellow": "#F1C40F",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
        mono: ["Source Code Pro", "monospace"],
        heading: ["Heading", "Afacad Flux"],
      },
    
    },
  },
  plugins: [],
}

