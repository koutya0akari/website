/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#040b16",
        "night-soft": "#0a1730",
        "night-muted": "#132642",
        accent: "#64d2ff",
        highlight: "#f7b500",
        parchment: "#fdf5e7",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto)", "system-ui", "sans-serif"],
        display: ["var(--font-signika)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1180px",
      },
      boxShadow: {
        card: "0 20px 50px rgba(2, 6, 23, 0.4)",
      },
      backgroundImage: {
        "grid-line": "linear-gradient(transparent 95%, rgba(255,255,255,0.08) 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
