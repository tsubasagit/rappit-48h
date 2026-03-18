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
          DEFAULT: '#538bb0',
          hover: '#3d6f94',
          light: '#e8f0f7',
        },
      },
    },
  },
  plugins: [],
}
