/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#571217",      // Deep Brown
        secondary: "#1A760D",    // Green
        accent: "#F38218",       // Orange
        yellow: "#F8B735",       // Yellow
        blue: "#040F40",         // Deep Blue
      },
      fontFamily: {
        rhregular: ["Rhodium-Regular", "sans-serif"],
        nunmedium: ["Nunito-Medium", "sans-serif"],
        nunbold: ["Nunito-Bold", "sans-serif"],
        nunlight: ["Nunito-Light", "sans-serif"],
        metroregular: ["Metrophobic-Regular", "sans-serif"],
      }
    },
  },
  plugins: [],
}