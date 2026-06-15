/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e8364e',
          light: '#ff6b81',
        },
        dark: {
          DEFAULT: '#0a0a0f',
          lighter: '#141420',
        },
        gold: '#f0c040',
      },
    },
  },
  plugins: [],
};
