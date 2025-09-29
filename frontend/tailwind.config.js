/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // scan all source files
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb", // example custom brand color
          light: "#3b82f6",
          dark: "#1e40af",
        },
      },
    },
  },
  plugins: [],
};
